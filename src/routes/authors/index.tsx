import { createFileRoute } from '@tanstack/react-router'
import { AuthorsListPage } from '@/features/authors/pages/AuthorListPage';

export const Route = createFileRoute('/authors/')({
  component: AuthorsListPage,
})