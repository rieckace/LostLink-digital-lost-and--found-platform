import type { LostFoundItem } from '../lib/types'

const img = (seed: string) =>
  `https://images.unsplash.com/photo-${seed}?auto=format&fit=crop&w=1200&q=70`

export const mockItems: LostFoundItem[] = [
  {
    id: 'it_001',
    type: 'found',
    title: 'Black Wireless Earbuds (Case)',
    description:
      'Found near the central library entrance. Case only, no earbuds inside.',
    category: 'Electronics',
    location: 'Central Library',
    dateISO: '2026-03-12',
    tags: ['earbuds', 'black', 'case', 'library'],
    imageUrl: img('1526170375885-4d8ecf77b99f'),
    matchScore: 0.85,
    matchingTags: ['earbuds', 'black'],
  },
  {
    id: 'it_002',
    type: 'lost',
    title: 'Student ID Card - “Ananya R.”',
    description:
      'Lost between cafeteria and admin block. Blue lanyard attached.',
    category: 'ID & Cards',
    location: 'Cafeteria',
    dateISO: '2026-03-10',
    tags: ['id card', 'lanyard', 'blue'],
    imageUrl: img('1523285367489-d38aec03b5c9'),
    matchScore: 0.62,
    matchingTags: ['id card'],
  },
  {
    id: 'it_003',
    type: 'found',
    title: 'Set of Keys with Red Keychain',
    description:
      'Found on the parking lot side walkway. Has 3 keys + one small tag.',
    category: 'Keys',
    location: 'Parking Lot',
    dateISO: '2026-03-08',
    tags: ['keys', 'red keychain', 'parking'],
    imageUrl: img('1520975682031-a9271c85c1f5'),
    matchScore: 0.73,
    matchingTags: ['keys'],
  },
  {
    id: 'it_004',
    type: 'lost',
    title: 'Grey Backpack (Laptop Sleeve)',
    description:
      'Lost after evening class. Contains notebooks and a 13" laptop sleeve.',
    category: 'Bags',
    location: 'Block B - 2nd Floor',
    dateISO: '2026-03-11',
    tags: ['backpack', 'grey', 'laptop'],
    imageUrl: img('1522199755839-a2bacb67c546'),
    matchScore: 0.58,
    matchingTags: ['backpack'],
  },
  {
    id: 'it_005',
    type: 'found',
    title: 'Silver Bracelet with Heart Charm',
    description:
      'Found inside auditorium seat row 6. Looks like a sentimental piece.',
    category: 'Accessories',
    location: 'Auditorium',
    dateISO: '2026-03-09',
    tags: ['bracelet', 'silver', 'charm'],
    imageUrl: img('1522312346375-d1a52e2b99b3'),
    matchScore: 0.77,
    matchingTags: ['bracelet', 'silver'],
  },
  {
    id: 'it_006',
    type: 'lost',
    title: 'Calculus Notes (Spiral Notebook)',
    description:
      'Lost a spiral notebook with “MATH-2” label. Some pages highlighted.',
    category: 'Books',
    location: 'Lecture Hall 3',
    dateISO: '2026-03-07',
    tags: ['notebook', 'math', 'spiral'],
    imageUrl: img('1519681393784-d120267933ba'),
    matchScore: 0.46,
    matchingTags: ['notebook'],
  },
]

export const categories = [
  'Electronics',
  'ID & Cards',
  'Bags',
  'Keys',
  'Clothing',
  'Books',
  'Accessories',
  'Other',
] as const

export const commonLocations = [
  'Central Library',
  'Cafeteria',
  'Parking Lot',
  'Auditorium',
  'Block B - 2nd Floor',
  'Lecture Hall 3',
  'Sports Complex',
] as const
