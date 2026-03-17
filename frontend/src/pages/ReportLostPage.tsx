import { PageTransition } from '../components/PageTransition'
import { ReportItemForm } from '../components/ReportItemForm'
import { Container } from '../layouts/Container'

export function ReportLostPage() {
  return (
    <PageTransition>
      <Container className="py-10">
        <ReportItemForm type="lost" />
      </Container>
    </PageTransition>
  )
}
