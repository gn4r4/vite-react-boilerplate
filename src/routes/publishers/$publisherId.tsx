import { createFileRoute } from '@tanstack/react-router'
import { EditPublisherPage } from '@/features/publishers/pages/EditPublisherPage';

export const Route = createFileRoute('/publishers/$publisherId')({
  component: EditPublisherPage,
})
