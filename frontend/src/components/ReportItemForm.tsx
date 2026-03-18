import { zodResolver } from '@hookform/resolvers/zod'
import { ArrowRight } from 'lucide-react'
import { useMemo, useState } from 'react'
import { useForm } from 'react-hook-form'
import { Link } from 'react-router-dom'
import { z } from 'zod'
import { categories, commonLocations } from '../data/mockItems'
import { suggestTagsFromText } from '../lib/ai'
import type { ItemType, LostFoundItem } from '../lib/types'
import { FileUploadField } from './FileUploadField'
import { LocationPicker, type LatLng } from './LocationPicker'
import { Button } from './ui/Button'
import { Card } from './ui/Card'
import { Input } from './ui/Input'
import { Select } from './ui/Select'
import { Textarea } from './ui/Textarea'
import { useItemsStore } from '../stores/itemsStore'
import { useAuthStore } from '../stores/authStore'
import { resolveApiBase } from '../lib/apiBase'

const schema = z.object({
  title: z.string().min(3, 'Enter a clear item title'),
  category: z.string().min(1, 'Select a category'),
  location: z.string().min(1, 'Select a location'),
  locationLabel: z.string().optional(),
  lat: z.number().optional(),
  lng: z.number().optional(),
  dateISO: z.string().min(1, 'Select a date'),
  description: z.string().min(10, 'Add a bit more detail'),
  tags: z.string().optional(),
})

type FormValues = z.infer<typeof schema>

export function ReportItemForm({ type }: { type: ItemType }) {
  const addReport = useItemsStore((s) => s.addReport)
  const addReportedItem = useItemsStore((s) => s.addReportedItem)
  const token = useAuthStore((s) => s.token)

  const [file, setFile] = useState<File | null>(null)
  const [submitted, setSubmitted] = useState(false)
  const [submitError, setSubmitError] = useState<string | null>(null)

  const {
    register,
    handleSubmit,
    watch,
    getValues,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      category: categories[0],
      location: commonLocations[0],
      dateISO: new Date().toISOString().slice(0, 10),
      description: '',
      title: '',
      tags: '',
      locationLabel: '',
    },
  })

  const title = type === 'lost' ? 'Report a lost item' : 'Report a found item'
  const subtitle =
    type === 'lost'
      ? 'Share details to help others identify and return it.'
      : 'Help reunite someone with their belongings.'

  const defaultImg = useMemo(() => {
    return type === 'lost'
      ? 'https://images.unsplash.com/photo-1522199873711-3f31b1e5c674?auto=format&fit=crop&w=1200&q=70'
      : 'https://images.unsplash.com/photo-1520975682031-a9271c85c1f5?auto=format&fit=crop&w=1200&q=70'
  }, [type])

  const lat = watch('lat')
  const lng = watch('lng')
  const locationLabel = watch('locationLabel')

  return (
    <Card className="p-6">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-xl font-semibold">{title}</h1>
          <p className="mt-1 text-sm text-slate-600 dark:text-slate-300">{subtitle}</p>
        </div>
        <Button asChild variant="secondary" className="hidden sm:inline-flex">
          <Link to="/browse">Browse listings</Link>
        </Button>
      </div>

      <form
        className="mt-6 grid gap-4"
        onSubmit={handleSubmit(async (values) => {
          setSubmitError(null)

          const tagList = (values.tags ?? '')
            .split(',')
            .map((t) => t.trim())
            .filter(Boolean)

          let nextImageUrl = defaultImg

          if (file && !token) {
            setSubmitError('Please login to upload an image.')
            return
          }

          if (file) {
            try {
              const API_URL = await resolveApiBase()
              const form = new FormData()
              form.append('file', file)

              const uploadRes = await fetch(`${API_URL}/uploads/image`, {
                method: 'POST',
                headers: {
                  Authorization: `Bearer ${token ?? ''}`,
                },
                body: form,
              })
              const uploadData = await uploadRes.json()
              if (!uploadRes.ok) throw new Error(uploadData?.error || 'Failed to upload image')

              if (typeof uploadData?.url === 'string' && uploadData.url) {
                nextImageUrl = uploadData.url
              }
            } catch (e) {
              setSubmitError(
                `${e instanceof Error ? e.message : 'Failed to upload image'}. Using default image instead.`,
              )
              nextImageUrl = defaultImg
            }
          }

          const localItem: Omit<LostFoundItem, 'id'> = {
            type,
            title: values.title,
            category: values.category as LostFoundItem['category'],
            location: values.location,
            locationLabel: values.locationLabel || undefined,
            lat: values.lat,
            lng: values.lng,
            dateISO: values.dateISO,
            description: values.description,
            tags: tagList.length ? tagList : [type, values.category.toLowerCase()],
            imageUrl: nextImageUrl,
            matchScore: type === 'lost' ? 0.55 : 0.72,
            matchingTags: tagList.slice(0, 2),
          }

          // Save to backend (MongoDB)
          try {
            const API_URL = await resolveApiBase()
            const res = await fetch(`${API_URL}/items`, {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${token ?? ''}`,
              },
              body: JSON.stringify({
                ...localItem,
                // backend expects tags array
                tags: localItem.tags,
              }),
            })
            const data = await res.json()

            if (!res.ok) {
              throw new Error(data?.error || 'Failed to submit report')
            }

            const apiItem = data?.item as any

            if (apiItem?.id) {
              const saved: LostFoundItem = {
                ...localItem,
                id: String(apiItem.id),
                imageUrl: apiItem.imageUrl ?? localItem.imageUrl,
                location: apiItem.location ?? localItem.location,
                locationLabel: apiItem.locationLabel ?? localItem.locationLabel,
                lat: apiItem.lat ?? localItem.lat,
                lng: apiItem.lng ?? localItem.lng,
              }
              addReportedItem(saved)
            } else {
              // Fallback to local-only report if backend response is unexpected
              addReport(localItem)
            }

            setSubmitted(true)
          } catch (err) {
            addReport(localItem)
            setSubmitted(true)
            setSubmitError(
              err instanceof Error
                ? `${err.message}. Saved locally, but not in database.`
                : 'Saved locally, but not in database.',
            )
          }
        })}
      >
        {submitted ? (
          <div className="rounded-2xl bg-emerald-50 p-4 text-sm text-emerald-800 ring-1 ring-emerald-200 dark:bg-emerald-900/20 dark:text-emerald-200 dark:ring-emerald-800">
            Report submitted. You can track it in your dashboard.
            <div className="mt-3 flex flex-wrap gap-2">
              <Button asChild>
                <Link to="/dashboard">
                  Go to Dashboard <ArrowRight className="h-4 w-4" />
                </Link>
              </Button>
              <Button asChild variant="secondary">
                <Link to="/browse">Browse Items</Link>
              </Button>
            </div>
          </div>
        ) : null}

        {submitError ? (
          <div className="rounded-2xl bg-rose-50 p-4 text-sm text-rose-800 ring-1 ring-rose-200 dark:bg-rose-900/20 dark:text-rose-200 dark:ring-rose-800">
            {submitError}
          </div>
        ) : null}

        <div className="grid gap-4 lg:grid-cols-2">
          <div>
            <label className="text-sm font-medium">Item title</label>
            <div className="mt-2">
              <Input placeholder="E.g., Grey backpack with laptop sleeve" {...register('title')} />
              {errors.title ? (
                <div className="mt-1 text-xs text-rose-600">{errors.title.message}</div>
              ) : null}
            </div>
          </div>

          <div>
            <label className="text-sm font-medium">Date</label>
            <div className="mt-2">
              <Input type="date" {...register('dateISO')} />
              {errors.dateISO ? (
                <div className="mt-1 text-xs text-rose-600">{errors.dateISO.message}</div>
              ) : null}
            </div>
          </div>

          <div>
            <label className="text-sm font-medium">Category</label>
            <div className="mt-2">
              <Select {...register('category')}>
                {categories.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </Select>
              {errors.category ? (
                <div className="mt-1 text-xs text-rose-600">{errors.category.message}</div>
              ) : null}
            </div>
          </div>

          <div>
            <label className="text-sm font-medium">Location</label>
            <div className="mt-2">
              <Input
                list="common-locations"
                placeholder="E.g., Central Library"
                {...register('location')}
              />
              <datalist id="common-locations">
                {commonLocations.map((l) => (
                  <option key={l} value={l} />
                ))}
              </datalist>
              {errors.location ? (
                <div className="mt-1 text-xs text-rose-600">{errors.location.message}</div>
              ) : null}
            </div>
          </div>
        </div>

        <div className="grid gap-3">
          <LocationPicker
            value={
              typeof lat === 'number' && typeof lng === 'number'
                ? ({ lat, lng } satisfies LatLng)
                : null
            }
            onChange={(v) => {
              setValue('lat', v.lat, { shouldDirty: true })
              setValue('lng', v.lng, { shouldDirty: true })
              setValue('location', `${v.lat.toFixed(6)}, ${v.lng.toFixed(6)}`, { shouldDirty: true })
            }}
            onLabelChange={(label) => {
              setValue('locationLabel', label, { shouldDirty: true })
              setValue('location', label, { shouldDirty: true })
            }}
          />

          {locationLabel ? (
            <div className="text-xs text-slate-500 dark:text-slate-400">
              Pin label: {locationLabel}
            </div>
          ) : null}
        </div>

        <div>
          <label className="text-sm font-medium">Description</label>
          <div className="mt-2">
            <Textarea
              placeholder="Color, brand, distinguishing marks, where you last saw it..."
              {...register('description')}
            />
            {errors.description ? (
              <div className="mt-1 text-xs text-rose-600">{errors.description.message}</div>
            ) : null}
          </div>
        </div>

        <div>
          <label className="text-sm font-medium">Tags (comma separated)</label>
          <div className="mt-2">
            <Input placeholder="E.g., black, earbuds, case, library" {...register('tags')} />
            {errors.tags ? (
              <div className="mt-1 text-xs text-rose-600">{errors.tags.message}</div>
            ) : null}
          </div>
        </div>

        <FileUploadField label="Upload image" onChange={setFile} />
        {file ? (
          <div className="text-xs text-slate-500 dark:text-slate-400">Image selected.</div>
        ) : null}

        <div className="mt-2 flex flex-wrap gap-2">
          <Button
            type="button"
            variant="secondary"
            onClick={() => {
              const v = getValues()
              const next = suggestTagsFromText(`${v.title} ${v.description}`).join(', ')
              if (next) setValue('tags', next, { shouldDirty: true })
            }}
          >
            Suggest tags
          </Button>
          <Button type="submit" disabled={isSubmitting}>
            Submit report
          </Button>
          <Button asChild variant="secondary">
            <Link to="/dashboard">Dashboard</Link>
          </Button>
        </div>
      </form>
    </Card>
  )
}
