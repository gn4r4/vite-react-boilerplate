import { createFileRoute } from '@tanstack/react-router'
import { EditLendingPage } from '@/features/lendings/pages/EditLendingPage';

export const Route = createFileRoute('/lendings/$lendingId')({
  component: EditLendingPage,
})
