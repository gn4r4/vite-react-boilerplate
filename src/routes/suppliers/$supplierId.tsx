import { createFileRoute } from '@tanstack/react-router'
import { EditSupplierPage } from '@/features/suppliers/pages/EditSupplierPage';

export const Route = createFileRoute('/suppliers/$supplierId')({
  component: EditSupplierPage,
})
