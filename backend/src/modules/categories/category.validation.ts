import Joi from 'joi';

export const categoryValidation = {
  createCategory: Joi.object({
    name: Joi.string().required().trim().min(2).max(100),
    description: Joi.string().trim().max(500).optional(),
    image: Joi.string().required(),
    isActive: Joi.boolean().optional(),
  }),

  updateCategory: Joi.object({
    name: Joi.string().trim().min(2).max(100).optional(),
    description: Joi.string().trim().max(500).optional(),
    image: Joi.string().optional(),
    isActive: Joi.boolean().optional(),
  }),

  categoryId: Joi.object({
    id: Joi.string().required(),
  }),
};
