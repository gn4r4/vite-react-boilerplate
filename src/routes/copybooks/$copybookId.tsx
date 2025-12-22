import { createFileRoute } from '@tanstack/react-router'
import { EditCopybookPage } from '@/features/copybooks/pages/EditCopybookPage';

export const Route = createFileRoute('/copybooks/$copybookId')({
  component: EditCopybookPage,
})
