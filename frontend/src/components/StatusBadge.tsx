import type { MatchStatus } from '../lib/types'
import { Badge } from './ui/Badge'

export function StatusBadge({ status }: { status: MatchStatus }) {
  if (status === 'Approved') return <Badge tone="success">Approved</Badge>
  if (status === 'Rejected') return <Badge tone="danger">Rejected</Badge>
  return <Badge tone="warning">Pending</Badge>
}
