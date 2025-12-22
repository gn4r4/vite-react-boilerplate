import { createFileRoute } from '@tanstack/react-router'
import { EditReaderPage } from '@/features/readers/pages/EditReaderPage';

export const Route = createFileRoute('/readers/$readerId')({
  component: EditReaderPage,
})
