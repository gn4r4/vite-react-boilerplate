import { createFileRoute } from '@tanstack/react-router'
import { GenresListPage } from '@/features/genres/pages/GenresListPage';

export const Route = createFileRoute('/genres/')({
  component: GenresListPage,
})