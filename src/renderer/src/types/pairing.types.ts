export type MatchQuality = 'classic' | 'good' | 'acceptable' | 'avoid'

export interface Pairing {
  id: string
  user_id?: string
  wine_style: string
  grape_hint?: string[]
  food_category: string
  food_name: string
  match_quality: MatchQuality
  notes?: string
  created_at: string
}
