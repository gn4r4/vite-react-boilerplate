import { createFileRoute } from '@tanstack/react-router'
import { CreatePublisherPage } from '@/features/publishers/pages/CreatePublisherPage';

export const Route = createFileRoute('/publishers/new')({
  component: CreatePublisherPage,
})
