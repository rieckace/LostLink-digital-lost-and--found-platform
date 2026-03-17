import { PageTransition } from '../components/PageTransition'
import { ReportItemForm } from '../components/ReportItemForm'
import { Container } from '../layouts/Container'

export function ReportFoundPage() {
  return (
    <PageTransition>
      <Container className="py-10">
        <ReportItemForm type="found" />
      </Container>
    </PageTransition>
  )
}
