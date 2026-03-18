import { zodResolver } from '@hookform/resolvers/zod'
import { motion } from 'framer-motion'
import { Lock, Mail } from 'lucide-react'
import { useForm } from 'react-hook-form'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { z } from 'zod'
import { PageTransition } from '../components/PageTransition'
import { Button } from '../components/ui/Button'
import { Card } from '../components/ui/Card'
import { Input } from '../components/ui/Input'
import { Container } from '../layouts/Container'
import { useAuthStore } from '../stores/authStore'

const schema = z.object({
  email: z.string().email('Enter a valid email'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
})

type FormValues = z.infer<typeof schema>

export function LoginPage() {
  const login = useAuthStore((s) => s.login)
  const navigate = useNavigate()
  const location = useLocation()

  const state = location.state as { from?: string } | null
  const from = state?.from

  const {
    register,
    handleSubmit,
    setError,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>({ resolver: zodResolver(schema) })

  return (
    <PageTransition>
      <Container className="py-14">
        <div className="mx-auto max-w-md">
          <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}>
            <Card className="p-6">
              <h1 className="text-xl font-semibold">Login</h1>
              <p className="mt-1 text-sm text-slate-600 dark:text-slate-300">
                Welcome back. Continue to your dashboard and reports.
              </p>

              <form
                className="mt-6 grid gap-4"
                onSubmit={handleSubmit(async (values) => {
                  try {
                    await login(values.email, values.password)

                    const current = useAuthStore.getState().user
                    if (current?.role === 'admin') {
                      navigate('/admin/claims', { replace: true })
                      return
                    }

                    navigate(from ?? '/dashboard', { replace: true })
                  } catch (err: any) {
                    setError('root', { message: err.message || 'Login failed' })
                  }
                })}
              >
                <div>
                  <label className="text-sm font-medium">Email</label>
                  <div className="relative mt-2">
                    <div className="pointer-events-none absolute inset-y-0 left-3 flex items-center">
                      <Mail className="h-4 w-4 text-slate-400" />
                    </div>
                    <Input placeholder="you@example.com" className="pl-10" {...register('email')} />
                  </div>
                  {errors.email ? (
                    <div className="mt-1 text-xs text-rose-600">{errors.email.message}</div>
                  ) : null}
                </div>

                <div>
                  <label className="text-sm font-medium">Password</label>
                  <div className="relative mt-2">
                    <div className="pointer-events-none absolute inset-y-0 left-3 flex items-center">
                      <Lock className="h-4 w-4 text-slate-400" />
                    </div>
                    <Input type="password" className="pl-10" {...register('password')} />
                  </div>
                  {errors.password ? (
                    <div className="mt-1 text-xs text-rose-600">{errors.password.message}</div>
                  ) : null}
                </div>

                {errors.root && (
                  <div className="text-sm font-medium text-rose-600 bg-rose-50 dark:bg-rose-900/30 dark:text-rose-400 p-3 rounded-lg">
                    {errors.root.message}
                  </div>
                )}

                <Button type="submit" disabled={isSubmitting}>
                  {isSubmitting ? 'Logging in...' : 'Login'}
                </Button>

                <div className="text-sm text-slate-600 dark:text-slate-300">
                  New here?{' '}
                  <Link className="font-semibold text-slate-900 dark:text-white" to="/signup">
                    Create an account
                  </Link>
                </div>
              </form>
            </Card>
          </motion.div>
        </div>
      </Container>
    </PageTransition>
  )
}
