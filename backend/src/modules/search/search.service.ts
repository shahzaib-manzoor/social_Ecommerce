import { Product, IProduct } from '../products/product.model';
import { embeddingService } from '../../utils/embedding';

export class SearchService {
  async semanticSearch(query: string, limit: number = 20, category?: string): Promise<IProduct[]> {
    try {
      // Generate embedding for search query
      const queryEmbedding = await embeddingService.generateEmbedding(query);

      // If embedding generation failed, fallback to keyword search
      if (queryEmbedding.length === 0) {
        return this.keywordSearch(query, limit, category);
      }

      // Get all products (or filtered by category)
      const filter: any = {};
      if (category) {
        filter.category = category;
      }

      const products = await Product.find(filter);

      // Calculate similarity scores
      const productsWithScores = products
        .map((product) => {
          if (product.embedding.length === 0) {
            // If product has no embedding, use keyword matching as fallback
            const keywordScore = this.calculateKeywordScore(query, product);
            return {
              product,
              score: keywordScore,
            };
          }

          const similarity = embeddingService.cosineSimilarity(queryEmbedding, product.embedding);
          return {
            product,
            score: similarity,
          };
        })
        .filter((item) => item.score > 0.3) // Similarity threshold
        .sort((a, b) => b.score - a.score)
        .slice(0, limit);

      return productsWithScores.map((item) => item.product);
    } catch (error) {
      console.error('Semantic search error:', error);
      // Fallback to keyword search on error
      return this.keywordSearch(query, limit, category);
    }
  }

  async keywordSearch(query: string, limit: number = 20, category?: string): Promise<IProduct[]> {
    const filter: any = {
      $text: { $search: query },
    };

    if (category) {
      filter.category = category;
    }

    const products = await Product.find(filter)
      .sort({ score: { $meta: 'textScore' } })
      .limit(limit);

    return products;
  }

  async hybridSearch(query: string, limit: number = 20, category?: string): Promise<IProduct[]> {
    try {
      // Get results from both semantic and keyword search
      const [semanticResults, keywordResults] = await Promise.all([
        this.semanticSearch(query, limit * 2, category),
        this.keywordSearch(query, limit * 2, category),
      ]);

      // Merge and deduplicate results
      const mergedMap = new Map<string, IProduct>();

      semanticResults.forEach((product, index) => {
        mergedMap.set(product._id.toString(), product);
      });

      keywordResults.forEach((product, index) => {
        if (!mergedMap.has(product._id.toString())) {
          mergedMap.set(product._id.toString(), product);
        }
      });

      // Return top results
      return Array.from(mergedMap.values()).slice(0, limit);
    } catch (error) {
      console.error('Hybrid search error:', error);
      return this.keywordSearch(query, limit, category);
    }
  }

  // Helper function to calculate keyword-based score
  private calculateKeywordScore(query: string, product: IProduct): number {
    const queryWords = query.toLowerCase().split(/\s+/);
    const titleWords = product.title.toLowerCase().split(/\s+/);
    const descWords = product.description.toLowerCase().split(/\s+/);
    const allProductWords = [...titleWords, ...descWords, ...product.tags.map((t) => t.toLowerCase())];

    let score = 0;
    queryWords.forEach((word) => {
      if (titleWords.some((tw) => tw.includes(word) || word.includes(tw))) {
        score += 0.5; // Title match is more important
      }
      if (allProductWords.some((pw) => pw.includes(word) || word.includes(pw))) {
        score += 0.2;
      }
    });

    return score;
  }
}
