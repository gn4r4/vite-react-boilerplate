import { createFileRoute } from '@tanstack/react-router'
import { CategoriesListPage } from '@/features/categories/pages/CategoriesListPage';

export const Route = createFileRoute('/categories/')({
  component: CategoriesListPage,
})