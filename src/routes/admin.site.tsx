import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/admin/site')({
  component: RouteComponent,
})

function RouteComponent() {
  return <div>Hello "/admin/site"!</div>
}
