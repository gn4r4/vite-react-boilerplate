import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/genres/$genreId')({
  component: RouteComponent,
})

function RouteComponent() {
  return <div>Hello "/genres/genres/$genreId"!</div>
}
