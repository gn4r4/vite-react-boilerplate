import { createFileRoute } from '@tanstack/react-router'
import { EditPositionPage } from '@/features/positions/pages/EditPositionPage';

export const Route = createFileRoute('/positions/$positionId')({
  component: EditPositionPage,
})
