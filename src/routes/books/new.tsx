import { createFileRoute } from '@tanstack/react-router'
import { CreateBookPage } from '@/features/books/pages/CreateBookPage';

export const Route = createFileRoute('/books/new')({
  component: CreateBookPage,
})
