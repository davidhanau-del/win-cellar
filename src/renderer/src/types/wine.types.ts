export type WineColor = 'red' | 'white' | 'rosé' | 'sparkling' | 'dessert' | 'fortified'
export type BottleFormat = '375ml' | '750ml' | '1.5L' | '3L' | '6L'
export type TransactionType = 'purchase' | 'consumption' | 'gift_in' | 'gift_out' | 'adjustment'

export interface Wine {
  id: string
  user_id: string
  name: string
  domain?: string
  region: string
  sub_region?: string
  country: string
  appellation?: string
  grape_varieties?: string[]
  vintage?: number
  color: WineColor
  price_paid?: number
  estimated_value?: number
  supplier?: string
  notes_general?: string
  label_image_url?: string
  peak_from?: number
  peak_until?: number
  created_at: string
  updated_at: string
}

export interface CellarEntry {
  id: string
  user_id: string
  wine_id: string
  quantity: number
  location?: string
  format: BottleFormat
  acquired_at?: string
  created_at: string
  updated_at: string
  wine?: Wine
}

export interface WineFilters {
  region?: string
  color?: WineColor
  grapeVariety?: string
  vintageMin?: number
  vintageMax?: number
  search?: string
}

export type ViewMode = 'grid' | 'table'
