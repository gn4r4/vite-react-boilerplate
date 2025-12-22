import { createFileRoute } from '@tanstack/react-router'
import { EditLocationPage } from '@/features/locations/pages/EditLocationPage';

export const Route = createFileRoute('/locations/$lendingId')({
  component: EditLocationPage,
})
