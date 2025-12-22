import { createFileRoute } from '@tanstack/react-router'
import { EditionsListPage } from '@/features/editions/pages/EditionListPage';

export const Route = createFileRoute('/editions/')({
  component: EditionsListPage,
})
