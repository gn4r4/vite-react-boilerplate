import { createFileRoute } from '@tanstack/react-router'
import { PublishersListPage } from '@/features/publishers/pages/PublisherListPage';

export const Route = createFileRoute('/publishers/')({
  component: PublishersListPage,
})
