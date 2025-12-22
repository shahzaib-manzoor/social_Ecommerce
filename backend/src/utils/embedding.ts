import axios from 'axios';
import { env } from '../config/env';

export class EmbeddingService {
  private apiUrl: string;
  private apiKey: string;
  private model: string;

  constructor() {
    this.apiUrl = env.EMBEDDING_API_URL || '';
    this.apiKey = env.EMBEDDING_API_KEY || '';
    this.model = env.EMBEDDING_MODEL;
  }

  async generateEmbedding(text: string): Promise<number[]> {
    if (!this.apiUrl || !this.apiKey) {
      console.warn('⚠️ Embedding API not configured, returning empty embedding');
      return [];
    }

    try {
      const response = await axios.post(
        this.apiUrl,
        {
          model: this.model,
          input: text,
        },
        {
          headers: {
            'Authorization': `Bearer ${this.apiKey}`,
            'Content-Type': 'application/json',
          },
        }
      );

      if (response.data?.data?.[0]?.embedding) {
        return response.data.data[0].embedding;
      }

      throw new Error('Invalid response from embedding API');
    } catch (error) {
      console.error('Error generating embedding:', error);
      // Graceful fallback - return empty array
      return [];
    }
  }

  async generateProductEmbedding(title: string, description: string, tags: string[]): Promise<number[]> {
    // Combine product information for embedding
    const text = `${title}. ${description}. Tags: ${tags.join(', ')}`;
    return this.generateEmbedding(text);
  }

  // Calculate cosine similarity between two vectors
  cosineSimilarity(vecA: number[], vecB: number[]): number {
    if (vecA.length === 0 || vecB.length === 0 || vecA.length !== vecB.length) {
      return 0;
    }

    let dotProduct = 0;
    let normA = 0;
    let normB = 0;

    for (let i = 0; i < vecA.length; i++) {
      dotProduct += vecA[i] * vecB[i];
      normA += vecA[i] * vecA[i];
      normB += vecB[i] * vecB[i];
    }

    return dotProduct / (Math.sqrt(normA) * Math.sqrt(normB));
  }
}

export const embeddingService = new EmbeddingService();
