import { PageTransition } from '../components/PageTransition'
import { Container } from '../layouts/Container'
import { Card } from '../components/ui/Card'

export function PrivacyPage() {
  return (
    <PageTransition>
      <Container className="py-10">
        <Card className="p-6">
          <h1 className="text-xl font-semibold">Privacy Policy</h1>
          <p className="mt-3 text-sm text-slate-600 dark:text-slate-300">
            We use the information you provide (reports, images, and claim details) to help match
            lost and found items and to contact you about your request.
          </p>

          <div className="mt-4 grid gap-3 text-sm text-slate-600 dark:text-slate-300">
            <p>
              If you create an account, we store your basic profile details so you can manage your
              reports and claims.
            </p>
            <p>
              We don’t sell your personal information. If you want a report or claim removed,
              contact support.
            </p>
          </div>
        </Card>
      </Container>
    </PageTransition>
  )
}
