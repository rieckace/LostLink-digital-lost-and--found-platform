import { PageTransition } from '../components/PageTransition'
import { ReportItemForm } from '../components/ReportItemForm'
import { Container } from '../layouts/Container'
import { useAuthStore } from '../stores/authStore'
import { Navigate } from 'react-router-dom'

export function ReportLostPage() {
  const user = useAuthStore((s) => s.user)
  if (user?.role === 'admin') return <Navigate to="/admin/claims" replace />

  return (
    <PageTransition>
      <Container className="py-10">
        <ReportItemForm type="lost" />
      </Container>
    </PageTransition>
  )
}
