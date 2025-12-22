import { createFileRoute } from '@tanstack/react-router'
import { CreateShelfPage } from '@/features/shelves/pages/CreateShelfPage';

export const Route = createFileRoute('/shelves/new')({
  component: CreateShelfPage,
})
