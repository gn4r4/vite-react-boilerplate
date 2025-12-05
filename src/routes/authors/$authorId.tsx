import { createFileRoute } from '@tanstack/react-router'
import { EditAuthorPage } from '@/features/authors/pages/EditAuthorPage';

export const Route = createFileRoute('/authors/$authorId')({
  component: EditAuthorPage,
})