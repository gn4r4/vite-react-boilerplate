import { createFileRoute } from '@tanstack/react-router'
import { LendingsListPage } from '@/features/lendings/pages/LendingListPage';

export const Route = createFileRoute('/lendings/')({
  component: LendingsListPage,
})
