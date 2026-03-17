import { zodResolver } from '@hookform/resolvers/zod'
import { motion } from 'framer-motion'
import { Lock, Mail, User } from 'lucide-react'
import { useForm } from 'react-hook-form'
import { Link, useNavigate } from 'react-router-dom'
import { z } from 'zod'
import { PageTransition } from '../components/PageTransition'
import { Button } from '../components/ui/Button'
import { Card } from '../components/ui/Card'
import { Input } from '../components/ui/Input'
import { Container } from '../layouts/Container'
import { useAuthStore } from '../stores/authStore'

const schema = z
  .object({
    name: z.string().min(2, 'Enter your name'),
    email: z.string().email('Enter a valid email'),
    password: z.string().min(6, 'Password must be at least 6 characters'),
    confirmPassword: z.string().min(6, 'Confirm your password'),
  })
  .refine((v) => v.password === v.confirmPassword, {
    message: 'Passwords do not match',
    path: ['confirmPassword'],
  })

type FormValues = z.infer<typeof schema>

export function SignupPage() {
  const signup = useAuthStore((s) => s.signup)
  const navigate = useNavigate()

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>({ resolver: zodResolver(schema) })

  return (
    <PageTransition>
      <Container className="py-14">
        <div className="mx-auto max-w-md">
          <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}>
            <Card className="p-6">
              <h1 className="text-xl font-semibold">Create your account</h1>
              <p className="mt-1 text-sm text-slate-600 dark:text-slate-300">
                Get access to reporting, dashboard tracking, and claims.
              </p>

              <form
                className="mt-6 grid gap-4"
                onSubmit={handleSubmit((values) => {
                  signup(values.name, values.email, values.password)
                  navigate('/dashboard', { replace: true })
                })}
              >
                <div>
                  <label className="text-sm font-medium">Name</label>
                  <div className="relative mt-2">
                    <div className="pointer-events-none absolute inset-y-0 left-3 flex items-center">
                      <User className="h-4 w-4 text-slate-400" />
                    </div>
                    <Input placeholder="Your name" className="pl-10" {...register('name')} />
                  </div>
                  {errors.name ? (
                    <div className="mt-1 text-xs text-rose-600">{errors.name.message}</div>
                  ) : null}
                </div>

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

                <div>
                  <label className="text-sm font-medium">Confirm password</label>
                  <div className="relative mt-2">
                    <div className="pointer-events-none absolute inset-y-0 left-3 flex items-center">
                      <Lock className="h-4 w-4 text-slate-400" />
                    </div>
                    <Input type="password" className="pl-10" {...register('confirmPassword')} />
                  </div>
                  {errors.confirmPassword ? (
                    <div className="mt-1 text-xs text-rose-600">
                      {errors.confirmPassword.message}
                    </div>
                  ) : null}
                </div>

                <Button type="submit" disabled={isSubmitting}>
                  Sign up
                </Button>

                <div className="text-sm text-slate-600 dark:text-slate-300">
                  Already have an account?{' '}
                  <Link className="font-semibold text-slate-900 dark:text-white" to="/login">
                    Login
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
