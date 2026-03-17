import { Outlet } from 'react-router-dom'
import { AnimatedBackground } from '../components/AnimatedBackground'
import { Footer } from '../components/Footer'
import { Navbar } from '../components/Navbar'

export function AppShell() {
  return (
    <div className="relative min-h-dvh">
      <AnimatedBackground />
      <div className="relative flex min-h-dvh flex-col">
        <Navbar />
        <main className="flex-1">
          <Outlet />
        </main>
        <Footer />
      </div>
    </div>
  )
}
