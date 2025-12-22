import { createFileRoute } from '@tanstack/react-router'
import { CreateGenrePage } from '@/features/genres/pages/CreateGenrePage';

export const Route = createFileRoute('/genres/new')({
  component: CreateGenrePage,
})
