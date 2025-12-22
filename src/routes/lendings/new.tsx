import { createFileRoute } from '@tanstack/react-router'
import { CreateLendingPage } from '@/features/lendings/pages/CreateLendingPage';

export const Route = createFileRoute('/lendings/new')({
  component: CreateLendingPage,
})
