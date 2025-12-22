import { createFileRoute } from '@tanstack/react-router'
import { EditOrderPage } from '@/features/orders/pages/EditOrderPage';

export const Route = createFileRoute('/orders/$orderId')({
  component: EditOrderPage,
})
