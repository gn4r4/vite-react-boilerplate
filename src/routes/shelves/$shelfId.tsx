import { createFileRoute } from '@tanstack/react-router'
import { EditShelfPage } from '@/features/shelves/pages/EditShelfPage';

export const Route = createFileRoute('/shelves/$shelfId')({
  component: EditShelfPage,
})
