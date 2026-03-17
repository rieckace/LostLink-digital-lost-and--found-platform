import { zodResolver } from '@hookform/resolvers/zod'
import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { z } from 'zod'
import { PageTransition } from '../components/PageTransition'
import { Container } from '../layouts/Container'
import { Card } from '../components/ui/Card'
import { Input } from '../components/ui/Input'
import { Textarea } from '../components/ui/Textarea'
import { Button } from '../components/ui/Button'

const contactSchema = z.object({
  name: z.string().min(2, 'Enter your name'),
  email: z.string().email('Enter a valid email'),
  message: z.string().min(10, 'Enter a short message'),
})

type ContactValues = z.infer<typeof contactSchema>

export function ContactPage() {
  const [sent, setSent] = useState(false)

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<ContactValues>({
    resolver: zodResolver(contactSchema),
    defaultValues: { name: '', email: '', message: '' },
  })

  return (
    <PageTransition>
      <Container className="py-10">
        <Card className="p-6">
          <h1 className="text-xl font-semibold">Contact</h1>
          <p className="mt-3 text-sm text-slate-600 dark:text-slate-300">
            Send a message and we’ll get back to you.
          </p>

          {sent ? (
            <div className="mt-6 rounded-2xl bg-emerald-50 p-4 text-sm text-emerald-800 ring-1 ring-emerald-200 dark:bg-emerald-900/20 dark:text-emerald-200 dark:ring-emerald-800">
              Message sent. Thanks for reaching out.
            </div>
          ) : (
            <form
              className="mt-6 grid gap-4"
              onSubmit={handleSubmit(() => {
                setSent(true)
              })}
            >
              <div>
                <label className="text-sm font-medium">Name</label>
                <div className="mt-2">
                  <Input placeholder="Your name" {...register('name')} />
                  {errors.name ? (
                    <div className="mt-1 text-xs text-rose-600">{errors.name.message}</div>
                  ) : null}
                </div>
              </div>

              <div>
                <label className="text-sm font-medium">Email</label>
                <div className="mt-2">
                  <Input placeholder="you@example.com" {...register('email')} />
                  {errors.email ? (
                    <div className="mt-1 text-xs text-rose-600">{errors.email.message}</div>
                  ) : null}
                </div>
              </div>

              <div>
                <label className="text-sm font-medium">Message</label>
                <div className="mt-2">
                  <Textarea
                    placeholder="Tell us what you need help with..."
                    rows={5}
                    {...register('message')}
                  />
                  {errors.message ? (
                    <div className="mt-1 text-xs text-rose-600">{errors.message.message}</div>
                  ) : null}
                </div>
              </div>

              <Button type="submit" disabled={isSubmitting}>
                Send message
              </Button>
            </form>
          )}
        </Card>
      </Container>
    </PageTransition>
  )
}
