import { Category, ICategory } from './category.model';

export class CategoryService {
  async createCategory(data: Partial<ICategory>): Promise<ICategory> {
    const existingCategory = await Category.findOne({ name: data.name });
    if (existingCategory) {
      throw new Error('Category with this name already exists');
    }

    const category = await Category.create(data);
    return category;
  }

  async getAllCategories(activeOnly: boolean = false): Promise<ICategory[]> {
    const query = activeOnly ? { isActive: true } : {};
    const categories = await Category.find(query).sort({ name: 1 });
    return categories;
  }

  async getCategoryById(id: string): Promise<ICategory> {
    const category = await Category.findById(id);
    if (!category) {
      throw new Error('Category not found');
    }
    return category;
  }

  async updateCategory(id: string, data: Partial<ICategory>): Promise<ICategory> {
    const category = await Category.findById(id);
    if (!category) {
      throw new Error('Category not found');
    }

    if (data.name && data.name !== category.name) {
      const existingCategory = await Category.findOne({ name: data.name });
      if (existingCategory) {
        throw new Error('Category with this name already exists');
      }
    }

    Object.assign(category, data);
    await category.save();
    return category;
  }

  async deleteCategory(id: string): Promise<void> {
    const category = await Category.findById(id);
    if (!category) {
      throw new Error('Category not found');
    }

    await category.deleteOne();
  }

  async toggleCategoryStatus(id: string): Promise<ICategory> {
    const category = await Category.findById(id);
    if (!category) {
      throw new Error('Category not found');
    }

    category.isActive = !category.isActive;
    await category.save();
    return category;
  }
}
