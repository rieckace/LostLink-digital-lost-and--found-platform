import { PageTransition } from '../components/PageTransition'
import { Container } from '../layouts/Container'
import { Card } from '../components/ui/Card'

export function AboutPage() {
  return (
    <PageTransition>
      <Container className="py-10">
        <Card className="p-6">
          <h1 className="text-xl font-semibold">About LostLink</h1>
          <p className="mt-3 text-sm text-slate-600 dark:text-slate-300">
            LostLink is a digital lost-and-found platform designed to make reporting, browsing,
            and claiming items feel effortless. The UI is built to be fast, accessible, and
            trustworthy—like a real product.
          </p>
        </Card>
      </Container>
    </PageTransition>
  )
}
