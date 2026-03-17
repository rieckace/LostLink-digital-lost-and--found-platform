import { Github, Linkedin, Twitter } from 'lucide-react'
import { Link } from 'react-router-dom'
import { Container } from '../layouts/Container'
import { cn } from '../lib/cn'

export function Footer() {
  return (
    <footer className="border-t border-slate-200/60 bg-white/40 backdrop-blur dark:border-slate-800/60 dark:bg-slate-950/30">
      <Container className="py-10">
        <div className="flex flex-col gap-8 md:flex-row md:items-start md:justify-between">
          <div>
            <div className="text-sm font-semibold text-slate-900 dark:text-slate-100">
              LostLink
            </div>
            <div className="mt-2 max-w-sm text-sm text-slate-600 dark:text-slate-300">
              A premium digital lost-and-found experience—report, browse, and claim with confidence.
            </div>
          </div>

          <div className="grid grid-cols-2 gap-8 sm:grid-cols-3">
            <div>
              <div className="text-sm font-semibold">Company</div>
              <div className="mt-3 space-y-2 text-sm">
                <Link className={linkCls} to="/about">
                  About
                </Link>
                <Link className={linkCls} to="/contact">
                  Contact
                </Link>
                <Link className={linkCls} to="/privacy">
                  Privacy Policy
                </Link>
              </div>
            </div>
            <div>
              <div className="text-sm font-semibold">Product</div>
              <div className="mt-3 space-y-2 text-sm">
                <Link className={linkCls} to="/browse">
                  Browse Items
                </Link>
                <Link className={linkCls} to="/report/lost">
                  Report Lost
                </Link>
                <Link className={linkCls} to="/report/found">
                  Report Found
                </Link>
              </div>
            </div>
            <div>
              <div className="text-sm font-semibold">Social</div>
              <div className="mt-3 flex items-center gap-2">
                <a className={iconCls} href="#" aria-label="GitHub">
                  <Github className="h-4 w-4" />
                </a>
                <a className={iconCls} href="#" aria-label="Twitter">
                  <Twitter className="h-4 w-4" />
                </a>
                <a className={iconCls} href="#" aria-label="LinkedIn">
                  <Linkedin className="h-4 w-4" />
                </a>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-10 text-xs text-slate-500 dark:text-slate-400">
          © {new Date().getFullYear()} LostLink. All rights reserved.
        </div>
      </Container>
    </footer>
  )
}

const linkCls = cn(
  'block text-slate-600 hover:text-slate-900',
  'transition-colors dark:text-slate-300 dark:hover:text-white',
)

const iconCls = cn(
  'inline-flex h-9 w-9 items-center justify-center rounded-xl',
  'bg-white/70 ring-1 ring-slate-200 hover:bg-white',
  'transition-colors dark:bg-slate-900/60 dark:ring-slate-800 dark:hover:bg-slate-900',
)
