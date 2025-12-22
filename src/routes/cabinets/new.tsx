import { createFileRoute } from '@tanstack/react-router'
import { CreateCabinetPage } from '@/features/cabinets/pages/CreateCabinetPage';

export const Route = createFileRoute('/cabinets/new')({
  component: CreateCabinetPage,
})
