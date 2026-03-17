export type ItemType = 'lost' | 'found'

export type ItemCategory =
  | 'Electronics'
  | 'ID & Cards'
  | 'Bags'
  | 'Keys'
  | 'Clothing'
  | 'Books'
  | 'Accessories'
  | 'Other'

export type MatchStatus = 'Pending' | 'Approved' | 'Rejected'

export type LostFoundItem = {
  id: string
  type: ItemType
  title: string
  description: string
  category: ItemCategory
  location: string
  dateISO: string
  tags: string[]
  imageUrl: string
  matchScore?: number
  matchingTags?: string[]
}

export type Claim = {
  id: string
  itemId: string
  itemTitle: string
  status: MatchStatus
  submittedAtISO: string
}

export type User = {
  id: string
  name: string
  email: string
}
