import { createFileRoute } from '@tanstack/react-router'
import { EditCabinetPage } from '@/features/cabinets/pages/EditCabinetPage';

export const Route = createFileRoute('/cabinets/$cabinetId')({
  component: EditCabinetPage,
})
