import { Link } from 'react-router-dom'
import type { LostFoundItem } from '../lib/types'
import { Card } from './ui/Card'

export function ItemCard({ item }: { item: LostFoundItem }) {
  const imageUrl = item.imageUrl || 'https://images.unsplash.com/photo-1520975682031-a9271c85c1f5?auto=format&fit=crop&w=1200&q=70'

  return (
    <Link to={`/items/${item.id}`} className="block">
      <Card className="group overflow-hidden transition-colors hover:bg-white dark:hover:bg-slate-900/70">
        <div className="relative">
          <img
            src={imageUrl}
            alt={item.title}
            className="h-44 w-full object-cover transition-transform duration-300 group-hover:scale-[1.02]"
            loading="lazy"
          />
        </div>

        <div className="p-4">
          <div className="text-sm font-semibold text-slate-900 dark:text-slate-100">
            {item.title}
          </div>
        </div>
      </Card>
    </Link>
  )
}
