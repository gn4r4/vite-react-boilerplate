import { createFileRoute } from '@tanstack/react-router'
import { BooksListPage } from '@/features/books/pages/BookListPage';

export const Route = createFileRoute('/books/')({
  component: BooksListPage,
})
