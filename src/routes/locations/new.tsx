import { createFileRoute } from '@tanstack/react-router'
import { CreateLocationPage } from '@/features/locations/pages/CreateLocationPage';

export const Route = createFileRoute('/locations/new')({
  component: CreateLocationPage,
})
