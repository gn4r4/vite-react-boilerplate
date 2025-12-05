import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/genres/new')({
  component: RouteComponent,
})

function RouteComponent() {
  return <div>Hello "/genres/genres/new"!</div>
}
