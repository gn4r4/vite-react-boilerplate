import { createFileRoute } from '@tanstack/react-router'
import { OrdersListPage } from '@/features/orders/pages/OrderListPage';

export const Route = createFileRoute('/orders/')({
  component: OrdersListPage,
})
