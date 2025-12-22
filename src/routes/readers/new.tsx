import { createFileRoute } from '@tanstack/react-router'
import { CreateReaderPage } from '@/features/readers/pages/CreateReaderPage';

export const Route = createFileRoute('/readers/new')({
  component: CreateReaderPage,
})
