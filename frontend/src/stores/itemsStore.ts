import { create } from 'zustand'
import type { Claim, LostFoundItem, MatchStatus } from '../lib/types'
import { mockItems } from '../data/mockItems'
import { createId } from '../lib/id'
import { resolveApiBase } from '../lib/apiBase'

type ItemFilters = {
  query: string
  category: string
  location: string
  date: string
}

type ItemsState = {
  items: LostFoundItem[]
  fetchItems: () => Promise<void>
  filters: ItemFilters
  setFilter: <K extends keyof ItemFilters>(key: K, value: ItemFilters[K]) => void
  filteredItems: () => LostFoundItem[]

  myReports: LostFoundItem[]
  addReport: (item: Omit<LostFoundItem, 'id'>) => void
  addReportedItem: (item: LostFoundItem) => void

  myClaims: Claim[]
  submitClaim: (item: LostFoundItem) => void
  updateClaimStatus: (claimId: string, status: MatchStatus) => void
}

export const useItemsStore = create<ItemsState>((set, get) => ({
  items: mockItems,
  fetchItems: async () => {
    try {
      const API_URL = await resolveApiBase()
      const res = await fetch(`${API_URL}/items`)
      const data = await res.json()

      if (!res.ok) {
        throw new Error(data?.error || 'Failed to fetch items')
      }

      const apiItems = Array.isArray(data?.items) ? data.items : []
      const mapped: LostFoundItem[] = apiItems
        .map((it: any) => {
          const id = String(it?.id ?? it?._id ?? '')
          if (!id) return null

          return {
            id,
            // The public browse endpoint can be redacted (title/image only).
            type: (it.type ?? 'lost') as any,
            title: String(it.title ?? ''),
            description: String(it.description ?? ''),
            category: (it.category ?? 'Other') as any,
            location: String(it.location ?? ''),
            locationLabel: typeof it.locationLabel === 'string' ? it.locationLabel : undefined,
            lat: typeof it.lat === 'number' ? it.lat : undefined,
            lng: typeof it.lng === 'number' ? it.lng : undefined,
            dateISO: String(it.dateISO ?? ''),
            tags: Array.isArray(it.tags) ? it.tags.map((t: any) => String(t)) : [],
            imageUrl: typeof it.imageUrl === 'string' ? it.imageUrl : '',
            matchScore: 0,
            matchingTags: [],
          } satisfies LostFoundItem
        })
        .filter(Boolean) as LostFoundItem[]

      set({ items: mapped })
    } catch {
      // Keep existing (mock/local) items if API is unavailable.
    }
  },
  filters: { query: '', category: 'All', location: 'All', date: 'Any' },
  setFilter: (key, value) => set({ filters: { ...get().filters, [key]: value } }),
  filteredItems: () => {
    const { query, category, location, date } = get().filters
    const q = query.trim().toLowerCase()

    const byId = new Map<string, LostFoundItem>()
    for (const it of [...get().myReports, ...get().items]) {
      if (!byId.has(it.id)) byId.set(it.id, it)
    }
    const allItems = Array.from(byId.values())

    return allItems.filter((it) => {
      const matchesQuery =
        !q ||
        (it.title ?? '').toLowerCase().includes(q) ||
        (it.description ?? '').toLowerCase().includes(q) ||
        (it.location ?? '').toLowerCase().includes(q) ||
        (it.tags ?? []).some((t) => (t ?? '').toLowerCase().includes(q))
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

  addReportedItem: (item) => {
    set({ myReports: [item, ...get().myReports] })
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
