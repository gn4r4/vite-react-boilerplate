import { createFileRoute } from '@tanstack/react-router'
import { CreateAuthorPage } from '@/features/authors/pages/CreateAuthorPage';

export const Route = createFileRoute('/authors/new')({
  component: CreateAuthorPage,
})