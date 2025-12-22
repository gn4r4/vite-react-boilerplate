import { createFileRoute } from '@tanstack/react-router'
import { ReaderListPage } from '@/features/readers/pages/ReaderListPage';

export const Route = createFileRoute('/readers/')({
  component: ReaderListPage,
})
