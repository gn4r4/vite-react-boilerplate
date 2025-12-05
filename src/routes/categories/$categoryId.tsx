import { createFileRoute } from '@tanstack/react-router'
import { EditCategoryPage } from '@/features/categories/pages/EditCategoryPage';

export const Route = createFileRoute('/categories/$categoryId')({
  component: EditCategoryPage,
})