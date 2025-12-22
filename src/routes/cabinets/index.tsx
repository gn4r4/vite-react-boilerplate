import { createFileRoute } from '@tanstack/react-router'
import { CabinetsListPage } from '@/features/cabinets/pages/CabinetListPage';

export const Route = createFileRoute('/cabinets/')({
  component: CabinetsListPage,
})
