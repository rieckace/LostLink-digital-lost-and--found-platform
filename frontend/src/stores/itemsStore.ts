import { create } from 'zustand'
import type { Claim, LostFoundItem, MatchStatus } from '../lib/types'
import { mockItems } from '../data/mockItems'
import { createId } from '../lib/id'

type ItemFilters = {
  query: string
  category: string
  location: string
  date: string
}

type ItemsState = {
  items: LostFoundItem[]
  filters: ItemFilters
  setFilter: <K extends keyof ItemFilters>(key: K, value: ItemFilters[K]) => void
  filteredItems: () => LostFoundItem[]

  myReports: LostFoundItem[]
  addReport: (item: Omit<LostFoundItem, 'id'>) => void

  myClaims: Claim[]
  submitClaim: (item: LostFoundItem) => void
  updateClaimStatus: (claimId: string, status: MatchStatus) => void
}

export const useItemsStore = create<ItemsState>((set, get) => ({
  items: mockItems,
  filters: { query: '', category: 'All', location: 'All', date: 'Any' },
  setFilter: (key, value) => set({ filters: { ...get().filters, [key]: value } }),
  filteredItems: () => {
    const { query, category, location, date } = get().filters
    const q = query.trim().toLowerCase()

    const allItems = [...get().myReports, ...get().items]

    return allItems.filter((it) => {
      const matchesQuery =
        !q ||
        it.title.toLowerCase().includes(q) ||
        it.description.toLowerCase().includes(q) ||
        it.location.toLowerCase().includes(q) ||
        it.tags.some((t) => t.toLowerCase().includes(q))
      const matchesCategory = category === 'All' || it.category === category
      const matchesLocation = location === 'All' || it.location === location

      const matchesDate =
        date === 'Any'
          ? true
          : date === 'Last 7 days'
            ? new Date(it.dateISO).getTime() >=
              Date.now() - 7 * 24 * 60 * 60 * 1000
            : true

      return matchesQuery && matchesCategory && matchesLocation && matchesDate
    })
  },

  myReports: [],
  addReport: (item) => {
    const newId = createId('my')

    set({ myReports: [{ ...item, id: newId }, ...get().myReports] })
  },

  myClaims: [
    {
      id: 'c_1',
      itemId: 'it_001',
      itemTitle: 'Black Wireless Earbuds (Case)',
      status: 'Pending',
      submittedAtISO: '2026-03-12',
    },
  ],
  submitClaim: (item) => {
    const claim: Claim = {
      id: createId('c'),
      itemId: item.id,
      itemTitle: item.title,
      status: 'Pending',
      submittedAtISO: new Date().toISOString(),
    }

    set({ myClaims: [claim, ...get().myClaims] })
  },
  updateClaimStatus: (claimId, status) =>
    set({
      myClaims: get().myClaims.map((c) => (c.id === claimId ? { ...c, status } : c)),
    }),
}))
