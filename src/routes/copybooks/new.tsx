import { createFileRoute } from '@tanstack/react-router'
import { CreateCopybookPage } from '@/features/copybooks/pages/CreateCopybookPage';

export const Route = createFileRoute('/copybooks/new')({
  component: CreateCopybookPage,
})
