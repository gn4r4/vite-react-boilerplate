import { createFileRoute } from '@tanstack/react-router'
import { EditGenrePage } from '@/features/genres/pages/EditGenrePage';

export const Route = createFileRoute('/genres/$genreId')({
  component: EditGenrePage,
})
