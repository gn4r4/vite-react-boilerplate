import { createFileRoute } from '@tanstack/react-router'
import { PositionsListPage } from '@/features/positions/pages/PositionListPage';

export const Route = createFileRoute('/positions/')({
  component: PositionsListPage,
})
