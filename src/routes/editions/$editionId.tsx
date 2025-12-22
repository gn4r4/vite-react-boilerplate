import { createFileRoute } from '@tanstack/react-router'
import { EditEditionPage } from '@/features/editions/pages/EditEditionPage';

export const Route = createFileRoute('/editions/$editionId')({
  component: EditEditionPage,
})
