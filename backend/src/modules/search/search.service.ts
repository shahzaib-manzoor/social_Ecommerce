import { Product, IProduct } from '../products/product.model';
import { embeddingService } from '../../utils/embedding';

interface SearchIntent {
  priceFilter?: 'cheap' | 'expensive' | 'affordable' | 'premium';
  sortBy?: 'price_asc' | 'price_desc' | 'rating' | 'newest';
  qualityFilter?: 'best' | 'top' | 'high-quality';
}

export class SearchService {
  // Parse search intent from query
  private parseSearchIntent(query: string): SearchIntent {
    const lowerQuery = query.toLowerCase();
    const intent: SearchIntent = {};

    // Price-related keywords
    if (lowerQuery.match(/\b(cheap|cheapest|affordable|budget|low price|inexpensive)\b/)) {
      intent.priceFilter = 'cheap';
      intent.sortBy = 'price_asc';
    } else if (lowerQuery.match(/\b(expensive|premium|luxury|high-end|costly)\b/)) {
      intent.priceFilter = 'expensive';
      intent.sortBy = 'price_desc';
    }

    // Quality-related keywords
    if (lowerQuery.match(/\b(best|top|highest rated|excellent|superior)\b/)) {
      intent.qualityFilter = 'best';
      intent.sortBy = intent.sortBy || 'rating';
    }

    // Newest/latest keywords
    if (lowerQuery.match(/\b(new|newest|latest|recent)\b/)) {
      intent.sortBy = intent.sortBy || 'newest';
    }

    return intent;
  }

  // Clean query by removing intent keywords
  private cleanQuery(query: string): string {
    return query
      .replace(/\b(cheap|cheapest|expensive|premium|best|top|new|newest|latest|affordable|budget|low price|inexpensive|luxury|high-end|costly|highest rated|excellent|superior|recent)\b/gi, '')
      .replace(/\s+/g, ' ')
      .trim();
  }

  // Apply intent-based sorting and filtering
  private applyIntent(products: IProduct[], intent: SearchIntent, query: string): IProduct[] {
    let results = [...products];

    // Only apply price filtering if we have results
    if (results.length > 2) {
      // Filter by price range based on intent
      if (intent.priceFilter === 'cheap' || intent.priceFilter === 'affordable') {
        // Get median price
        const prices = results.map(p => p.price).sort((a, b) => a - b);
        const median = prices[Math.floor(prices.length / 2)] || 0;
        // Keep products below median price + some products above for context
        results = results.filter(p => p.price <= median * 1.5);
      } else if (intent.priceFilter === 'expensive' || intent.priceFilter === 'premium') {
        // Get median price
        const prices = results.map(p => p.price).sort((a, b) => a - b);
        const median = prices[Math.floor(prices.length / 2)] || 0;
        // Keep products above 70% of median
        results = results.filter(p => p.price >= median * 0.7);
      }
    }

    // Sort based on intent
    if (intent.sortBy === 'price_asc') {
      results.sort((a, b) => a.price - b.price);
    } else if (intent.sortBy === 'price_desc') {
      results.sort((a, b) => b.price - a.price);
    } else if (intent.sortBy === 'rating') {
      results.sort((a, b) => (b.rating || 0) - (a.rating || 0));
    } else if (intent.sortBy === 'newest') {
      results.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    }

    return results;
  }

  async semanticSearch(query: string, limit: number = 20, category?: string): Promise<IProduct[]> {
    try {
      // Parse intent from query
      const intent = this.parseSearchIntent(query);

      // Clean query for embedding (remove intent keywords)
      const cleanedQuery = this.cleanQuery(query);
      const searchQuery = cleanedQuery || query; // Use original if cleaned is empty

      console.log('🔍 Search Intent:', intent);
      console.log('🧹 Cleaned Query:', searchQuery);

      // Generate embedding for search query
      const queryEmbedding = await embeddingService.generateEmbedding(searchQuery);

      // If embedding generation failed, fallback to keyword search
      if (queryEmbedding.length === 0) {
        console.warn('⚠️ Embedding generation failed, using keyword search');
        return this.keywordSearch(query, limit, category);
      }

      // Get all products (or filtered by category)
      const filter: any = {};
      if (category) {
        filter.category = category;
      }

      const products = await Product.find(filter);

      if (products.length === 0) {
        return [];
      }

      // Calculate similarity scores
      const productsWithScores = products
        .map((product) => {
          if (product.embedding.length === 0) {
            // If product has no embedding, use keyword matching as fallback
            const keywordScore = this.calculateKeywordScore(searchQuery, product);
            return {
              product,
              score: keywordScore,
            };
          }

          let similarity = embeddingService.cosineSimilarity(queryEmbedding, product.embedding);

          // Boost score for exact or partial brand/keyword matches in title
          const titleLower = product.title.toLowerCase();
          const queryLower = searchQuery.toLowerCase();
          const queryWords = queryLower.split(/\s+/).filter(w => w.length > 2);

          queryWords.forEach((word) => {
            if (titleLower.includes(word)) {
              // Exact word match in title gets significant boost
              similarity += 0.3;
            }
          });

          // Cap boosted score at 1.0
          similarity = Math.min(similarity, 1.0);

          return {
            product,
            score: similarity,
          };
        })
        .filter((item) => item.score > 0.4) // Increased threshold for better accuracy
        .sort((a, b) => b.score - a.score);

      // Apply intent-based filtering and sorting
      const filteredProducts = productsWithScores.map(item => item.product);
      const intentAppliedResults = this.applyIntent(filteredProducts, intent, query);

      // Deduplicate by product ID (just in case)
      const seen = new Set<string>();
      const uniqueResults = intentAppliedResults.filter(product => {
        const id = product._id.toString();
        if (seen.has(id)) return false;
        seen.add(id);
        return true;
      });

      return uniqueResults.slice(0, limit);
    } catch (error) {
      console.error('Semantic search error:', error);
      // Fallback to keyword search on error
      return this.keywordSearch(query, limit, category);
    }
  }

  async keywordSearch(query: string, limit: number = 20, category?: string): Promise<IProduct[]> {
    try {
      // Parse intent
      const intent = this.parseSearchIntent(query);
      const cleanedQuery = this.cleanQuery(query);
      const searchQuery = cleanedQuery || query;

      const filter: any = {
        $text: { $search: searchQuery },
      };

      if (category) {
        filter.category = category;
      }

      const products = await Product.find(filter)
        .sort({ score: { $meta: 'textScore' } })
        .limit(limit * 2); // Get more to allow intent filtering

      // Apply intent-based filtering and sorting
      const intentAppliedResults = this.applyIntent(products, intent, query);

      return intentAppliedResults.slice(0, limit);
    } catch (error) {
      console.error('Keyword search error:', error);
      // Fallback to basic search without text index
      return this.basicSearch(query, limit, category);
    }
  }

  async basicSearch(query: string, limit: number = 20, category?: string): Promise<IProduct[]> {
    try {
      const intent = this.parseSearchIntent(query);
      const cleanedQuery = this.cleanQuery(query);
      const searchQuery = cleanedQuery || query;
      const queryWords = searchQuery.toLowerCase().split(/\s+/);

      const filter: any = {};
      if (category) {
        filter.category = category;
      }

      const products = await Product.find(filter);

      // Score products based on keyword matching
      const productsWithScores = products
        .map(product => ({
          product,
          score: this.calculateKeywordScore(searchQuery, product)
        }))
        .filter(item => item.score > 0)
        .sort((a, b) => b.score - a.score)
        .map(item => item.product);

      // Apply intent
      const intentAppliedResults = this.applyIntent(productsWithScores, intent, query);

      return intentAppliedResults.slice(0, limit);
    } catch (error) {
      console.error('Basic search error:', error);
      return [];
    }
  }

  async hybridSearch(query: string, limit: number = 20, category?: string): Promise<IProduct[]> {
    try {
      console.log('🔎 Hybrid Search Query:', query);

      // Get results from both semantic and keyword search
      const [semanticResults, keywordResults] = await Promise.all([
        this.semanticSearch(query, limit * 2, category),
        this.keywordSearch(query, limit * 2, category),
      ]);

      console.log('📊 Semantic Results:', semanticResults.length);
      console.log('📊 Keyword Results:', keywordResults.length);

      // Merge and deduplicate results, preserving order
      const mergedMap = new Map<string, IProduct>();
      const scoreMap = new Map<string, number>();

      // Add semantic results first (higher priority)
      semanticResults.forEach((product, index) => {
        const id = product._id.toString();
        mergedMap.set(id, product);
        scoreMap.set(id, semanticResults.length - index); // Higher score for earlier results
      });

      // Add keyword results
      keywordResults.forEach((product, index) => {
        const id = product._id.toString();
        if (!mergedMap.has(id)) {
          mergedMap.set(id, product);
          scoreMap.set(id, (keywordResults.length - index) * 0.5); // Lower priority
        } else {
          // Boost score if product appears in both
          scoreMap.set(id, (scoreMap.get(id) || 0) + (keywordResults.length - index) * 0.3);
        }
      });

      // Sort by combined score
      const mergedResults = Array.from(mergedMap.values()).sort((a, b) => {
        const scoreA = scoreMap.get(a._id.toString()) || 0;
        const scoreB = scoreMap.get(b._id.toString()) || 0;
        return scoreB - scoreA;
      });

      console.log('✅ Merged Results:', mergedResults.length);

      // Return top results
      return mergedResults.slice(0, limit);
    } catch (error) {
      console.error('Hybrid search error:', error);
      return this.keywordSearch(query, limit, category);
    }
  }

  // Helper function to calculate keyword-based score
  private calculateKeywordScore(query: string, product: IProduct): number {
    const queryWords = query.toLowerCase().split(/\s+/).filter(w => w.length > 2);
    const titleWords = product.title.toLowerCase().split(/\s+/);
    const descWords = product.description.toLowerCase().split(/\s+/);
    const allProductWords = [...titleWords, ...descWords, ...product.tags.map((t) => t.toLowerCase())];

    let score = 0;
    queryWords.forEach((word) => {
      // Exact match in title (highest score)
      if (titleWords.includes(word)) {
        score += 1.0;
      }
      // Partial match in title
      else if (titleWords.some((tw) => tw.includes(word) || word.includes(tw))) {
        score += 0.5;
      }
      // Match in description or tags
      if (allProductWords.some((pw) => pw.includes(word) || word.includes(pw))) {
        score += 0.2;
      }
    });

    return score;
  }
}
