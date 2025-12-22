import { createFileRoute } from '@tanstack/react-router'
import { CreatePositionPage } from '@/features/positions/pages/CreatePositionPage';

export const Route = createFileRoute('/positions/new')({
  component: CreatePositionPage,
})
