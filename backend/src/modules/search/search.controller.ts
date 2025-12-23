import { Request, Response } from 'express';
import { SearchService } from './search.service';
import { sendSuccess, sendError } from '../../utils/response';

const searchService = new SearchService();

export class SearchController {
  async search(req: Request, res: Response): Promise<void> {
    try {
      const query = req.query.q as string;
      const limit = parseInt(req.query.limit as string) || 20;
      const category = req.query.category as string;
      const mode = (req.query.mode as string) || 'hybrid'; // semantic, keyword, or hybrid

      if (!query) {
        sendError(res, 'Search query is required', 400);
        return;
      }

      let results;
      switch (mode) {
        case 'semantic':
          results = await searchService.semanticSearch(query, limit, category);
          break;
        case 'keyword':
          results = await searchService.keywordSearch(query, limit, category);
          break;
        case 'hybrid':
        default:
          results = await searchService.hybridSearch(query, limit, category);
          break;
      }

      sendSuccess(res, {
        query,
        products: results, // Return as 'products' for consistency with other endpoints
        results, // Keep 'results' for backward compatibility
        count: results.length
      });
    } catch (error) {
      sendError(res, (error as Error).message, 400);
    }
  }
}
