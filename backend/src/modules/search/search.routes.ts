import { Router } from 'express';
import { SearchController } from './search.controller';

const router = Router();
const searchController = new SearchController();

// Search is available to everyone (no auth required for basic search)
router.get('/', searchController.search.bind(searchController));

export default router;
