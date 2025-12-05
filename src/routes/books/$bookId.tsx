import { createFileRoute } from '@tanstack/react-router'
import { EditBookPage } from '@/features/books/pages/EditBookPage';

export const Route = createFileRoute('/books/$bookId')({
  component: EditBookPage,
})
