import { createFileRoute } from '@tanstack/react-router'
import { ShelvesListPage } from '@/features/shelves/pages/ShelfListPage';

export const Route = createFileRoute('/shelves/')({
  component: ShelvesListPage,
})
