import { createFileRoute } from '@tanstack/react-router'
import { CopybooksListPage } from '@/features/copybooks/pages/CopybookListPage';

export const Route = createFileRoute('/copybooks/')({
  component: CopybooksListPage,
})
