import { createFileRoute } from '@tanstack/react-router'
import { CreateOrderPage } from '@/features/orders/pages/CreateOrderPage';

export const Route = createFileRoute('/orders/new')({
  component: CreateOrderPage,
})
