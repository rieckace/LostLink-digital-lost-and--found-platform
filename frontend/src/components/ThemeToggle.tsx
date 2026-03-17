import { Moon, Sun } from 'lucide-react'
import { useThemeStore } from '../stores/themeStore'
import { Button } from './ui/Button'

export function ThemeToggle() {
  const mode = useThemeStore((s) => s.mode)
  const toggle = useThemeStore((s) => s.toggle)

  return (
    <Button
      type="button"
      variant="ghost"
      onClick={toggle}
      aria-label={mode === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
      className="h-10 w-10 rounded-xl p-0"
    >
      {mode === 'dark' ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
    </Button>
  )
}
