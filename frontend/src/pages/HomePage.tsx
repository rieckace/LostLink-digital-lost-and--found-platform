import {
  ArrowRight,
  BadgeCheck,
  Camera,
  CheckCircle2,
  Search,
  ShieldCheck,
  Sparkles,
} from 'lucide-react'
import { motion } from 'framer-motion'
import { Link } from 'react-router-dom'
import { PageTransition } from '../components/PageTransition'
import { Container } from '../layouts/Container'
import { Button } from '../components/ui/Button'
import { Card } from '../components/ui/Card'

const fadeUp = {
  initial: { opacity: 0, y: 10 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true, amount: 0.2 },
  transition: { duration: 0.35, ease: 'easeOut' },
} as const

export function HomePage() {
  return (
    <PageTransition>
      <section className="relative">
        <Container className="py-14 sm:py-20">
          <div className="grid gap-10 lg:grid-cols-2 lg:items-center">
            <div>
              <motion.div {...fadeUp}>
                <div className="inline-flex items-center gap-2 rounded-full bg-white/70 px-3 py-1 text-xs font-semibold ring-1 ring-slate-200 backdrop-blur dark:bg-slate-900/50 dark:ring-slate-800">
                  <Sparkles className="h-4 w-4 text-sky-500" />
                  Modern Digital Lost &amp; Found
                </div>
              </motion.div>

              <motion.h1
                {...fadeUp}
                className="mt-5 text-4xl font-semibold tracking-tight text-slate-900 dark:text-slate-100 sm:text-5xl"
              >
                Find what’s yours.
                <span className="block text-slate-600 dark:text-slate-300">
                  Return what’s found.
                </span>
              </motion.h1>

              <motion.p
                {...fadeUp}
                className="mt-5 max-w-xl text-base text-slate-600 dark:text-slate-300"
              >
                Report lost items, browse found listings, and submit claims instantly. Let AI algorithms handle the heavy lifting of matching logic.
              </motion.p>

              <motion.div {...fadeUp} className="mt-8 flex flex-wrap gap-3">
                <Button asChild>
                  <Link to="/report/lost">
                    Report Item <ArrowRight className="h-4 w-4" />
                  </Link>
                </Button>
                <Button asChild variant="secondary">
                  <Link to="/browse">Browse Items</Link>
                </Button>
              </motion.div>

              <motion.div
                {...fadeUp}
                className="mt-8 flex flex-wrap gap-4 text-sm text-slate-600 dark:text-slate-300"
              >
                <div className="inline-flex items-center gap-2">
                  <ShieldCheck className="h-4 w-4 text-emerald-500" />
                  Trust-first flows
                </div>
                <div className="inline-flex items-center gap-2">
                  <BadgeCheck className="h-4 w-4 text-sky-500" />
                  Match visualization
                </div>
                <div className="inline-flex items-center gap-2">
                  <Camera className="h-4 w-4 text-violet-500" />
                  Proof uploads
                </div>
              </motion.div>
            </div>

            <motion.div
              {...fadeUp}
              className="relative"
              aria-label="Illustration"
            >
              <div className="rounded-3xl bg-white/70 p-6 ring-1 ring-slate-200 backdrop-blur dark:bg-slate-900/50 dark:ring-slate-800">
                <div className="grid gap-4 sm:grid-cols-2">
                  <Card className="p-4">
                    <div className="flex items-start justify-between">
                      <div>
                        <div className="text-xs font-semibold text-slate-500 dark:text-slate-400">
                          Suggested match
                        </div>
                        <div className="mt-1 text-sm font-semibold">85% Match</div>
                      </div>
                      <div className="inline-flex h-10 w-10 items-center justify-center rounded-2xl bg-slate-900 text-white dark:bg-slate-50 dark:text-slate-900">
                        <Sparkles className="h-5 w-5" />
                      </div>
                    </div>
                    <div className="mt-4 h-2 w-full rounded-full bg-slate-200 dark:bg-slate-800">
                      <div className="h-2 w-[85%] rounded-full bg-sky-500" />
                    </div>
                    <div className="mt-3 flex flex-wrap gap-2">
                      <span className="rounded-full bg-sky-100 px-2 py-1 text-xs font-medium text-sky-800 ring-1 ring-sky-200 dark:bg-sky-900/30 dark:text-sky-200 dark:ring-sky-800">
                        earbuds
                      </span>
                      <span className="rounded-full bg-sky-100 px-2 py-1 text-xs font-medium text-sky-800 ring-1 ring-sky-200 dark:bg-sky-900/30 dark:text-sky-200 dark:ring-sky-800">
                        black
                      </span>
                      <span className="rounded-full bg-slate-100 px-2 py-1 text-xs font-medium text-slate-700 ring-1 ring-slate-200 dark:bg-slate-800/60 dark:text-slate-200 dark:ring-slate-700">
                        case
                      </span>
                    </div>
                  </Card>

                  <Card className="p-4">
                    <div className="flex items-start justify-between">
                      <div>
                        <div className="text-xs font-semibold text-slate-500 dark:text-slate-400">
                          Fast reporting
                        </div>
                        <div className="mt-1 text-sm font-semibold">60 seconds</div>
                      </div>
                      <div className="inline-flex h-10 w-10 items-center justify-center rounded-2xl bg-slate-900 text-white dark:bg-slate-50 dark:text-slate-900">
                        <Search className="h-5 w-5" />
                      </div>
                    </div>
                    <div className="mt-4 space-y-2">
                      <div className="h-2 w-full rounded-full bg-slate-200 dark:bg-slate-800" />
                      <div className="h-2 w-[85%] rounded-full bg-slate-200 dark:bg-slate-800" />
                      <div className="h-2 w-[70%] rounded-full bg-slate-200 dark:bg-slate-800" />
                    </div>
                    <div className="mt-4 inline-flex items-center gap-2 text-xs text-slate-600 dark:text-slate-300">
                      <CheckCircle2 className="h-4 w-4 text-emerald-500" />
                      Image + tags improve matches
                    </div>
                  </Card>
                </div>
              </div>

              <motion.div
                animate={{ y: [0, -10, 0] }}
                transition={{ duration: 6, repeat: Infinity, ease: 'easeInOut' }}
                className="pointer-events-none absolute -left-6 -top-6 hidden h-28 w-28 rounded-3xl bg-white/70 ring-1 ring-slate-200 backdrop-blur dark:bg-slate-900/50 dark:ring-slate-800 sm:block"
              />
              <motion.div
                animate={{ y: [0, 12, 0] }}
                transition={{ duration: 7, repeat: Infinity, ease: 'easeInOut' }}
                className="pointer-events-none absolute -bottom-8 -right-6 hidden h-24 w-24 rounded-3xl bg-white/70 ring-1 ring-slate-200 backdrop-blur dark:bg-slate-900/50 dark:ring-slate-800 sm:block"
              />
            </motion.div>
          </div>
        </Container>
      </section>

      <section className="relative">
        <Container className="pb-16 sm:pb-20">
          <motion.div {...fadeUp}>
            <h2 className="text-lg font-semibold tracking-tight text-slate-900 dark:text-slate-100">
              Built for efficiency
            </h2>
            <p className="mt-2 max-w-2xl text-sm text-slate-600 dark:text-slate-300">
              Fast reporting, AI-powered matching, and location radius filtering across all devices.
            </p>
          </motion.div>

          <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {features.map((f) => (
              <motion.div key={f.title} {...fadeUp}>
                <Card className="h-full p-5">
                  <div className="flex items-start gap-3">
                    <div className="inline-flex h-11 w-11 items-center justify-center rounded-2xl bg-slate-900 text-white dark:bg-slate-50 dark:text-slate-900">
                      <f.Icon className="h-5 w-5" />
                    </div>
                    <div>
                      <div className="text-sm font-semibold">{f.title}</div>
                      <div className="mt-1 text-sm text-slate-600 dark:text-slate-300">
                        {f.description}
                      </div>
                    </div>
                  </div>
                </Card>
              </motion.div>
            ))}
          </div>
        </Container>
      </section>

      <section className="relative">
        <Container className="pb-16 sm:pb-24">
          <motion.div {...fadeUp}>
            <h2 className="text-lg font-semibold tracking-tight">How it works</h2>
            <p className="mt-2 max-w-2xl text-sm text-slate-600 dark:text-slate-300">
              A frictionless flow from reporting to resolution.
            </p>
          </motion.div>

          <div className="mt-8 grid gap-4 lg:grid-cols-3">
            {steps.map((s) => (
              <motion.div key={s.title} {...fadeUp}>
                <Card className="h-full p-5">
                  <div className="text-xs font-semibold text-slate-500 dark:text-slate-400">
                    Step {s.step}
                  </div>
                  <div className="mt-2 text-sm font-semibold">{s.title}</div>
                  <div className="mt-1 text-sm text-slate-600 dark:text-slate-300">
                    {s.description}
                  </div>
                </Card>
              </motion.div>
            ))}
          </div>
        </Container>
      </section>


    </PageTransition>
  )
}

const features = [
  {
    title: 'Smart Search + Filters',
    description: 'Find items quickly with suggestions, category, location, and date filters.',
    Icon: Search,
  },
  {
    title: 'Match Visualization',
    description: 'See match percentage and highlighted tags at a glance.',
    Icon: Sparkles,
  },
  {
    title: 'Trust-first Claims',
    description: 'Proof upload UI and clear statuses keep the process transparent.',
    Icon: ShieldCheck,
  },
]

const steps = [
  {
    step: 1,
    title: 'Report lost or found',
    description: 'Upload an image, add tags, and choose location + category.',
  },
  {
    step: 2,
    title: 'Browse and compare',
    description: 'Use search suggestions and filters to narrow down results.',
  },
  {
    step: 3,
    title: 'Submit a claim',
    description: 'Provide proof and track status (Pending / Approved / Rejected).',
  },
]

