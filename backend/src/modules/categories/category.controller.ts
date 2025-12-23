import { Request, Response } from 'express';
import { CategoryService } from './category.service';
import { sendSuccess, sendError } from '../../utils/response';

const categoryService = new CategoryService();

export class CategoryController {
  createCategory = async (req: Request, res: Response) => {
    try {
      const category = await categoryService.createCategory(req.body);
      return sendSuccess(res, category, 201);
    } catch (error: any) {
      return sendError(res, error.message || 'Failed to create category', 400);
    }
  };

  getAllCategories = async (req: Request, res: Response) => {
    try {
      const activeOnly = req.query.activeOnly === 'true';
      const categories = await categoryService.getAllCategories(activeOnly);
      return sendSuccess(res, categories, 200);
    } catch (error: any) {
      return sendError(res, error.message || 'Failed to get categories', 500);
    }
  };

  getCategoryById = async (req: Request, res: Response) => {
    try {
      const category = await categoryService.getCategoryById(req.params.id);
      return sendSuccess(res, category, 200);
    } catch (error: any) {
      return sendError(res, error.message || 'Failed to get category', 404);
    }
  };

  updateCategory = async (req: Request, res: Response) => {
    try {
      const category = await categoryService.updateCategory(req.params.id, req.body);
      return sendSuccess(res, category, 200);
    } catch (error: any) {
      return sendError(res, error.message || 'Failed to update category', 400);
    }
  };

  deleteCategory = async (req: Request, res: Response) => {
    try {
      await categoryService.deleteCategory(req.params.id);
      return sendSuccess(res, { message: 'Category deleted successfully' }, 200);
    } catch (error: any) {
      return sendError(res, error.message || 'Failed to delete category', 404);
    }
  };

  toggleCategoryStatus = async (req: Request, res: Response) => {
    try {
      const category = await categoryService.toggleCategoryStatus(req.params.id);
      return sendSuccess(res, category, 200);
    } catch (error: any) {
      return sendError(res, error.message || 'Failed to toggle category status', 404);
    }
  };
}
