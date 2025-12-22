import { createFileRoute } from '@tanstack/react-router'
import { LocationListPage } from '@/features/locations/pages/LocationListPage';

export const Route = createFileRoute('/locations/')({
  component: LocationListPage,
})
