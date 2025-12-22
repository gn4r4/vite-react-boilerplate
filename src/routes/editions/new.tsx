import { createFileRoute } from '@tanstack/react-router'
import { CreateEditionPage } from '@/features/editions/pages/CreateEditionPage';

export const Route = createFileRoute('/editions/new')({
  component: CreateEditionPage,
})
