export type Clarity = 'clear' | 'hazy' | 'cloudy'
export type Intensity = 'light' | 'medium' | 'medium+' | 'pronounced'
export type Development = 'youthful' | 'developing' | 'fully developed' | 'tired'
export type Sweetness = 'dry' | 'off-dry' | 'medium-dry' | 'medium-sweet' | 'sweet' | 'luscious'
export type AcidityLevel = 'low' | 'medium-' | 'medium' | 'medium+' | 'high'
export type TanninLevel = 'low' | 'medium-' | 'medium' | 'medium+' | 'high'
export type BodyLevel = 'light' | 'medium-' | 'medium' | 'medium+' | 'full'
export type FinishLength = 'short' | 'medium-' | 'medium' | 'medium+' | 'long'
export type Conclusion = 'faulty' | 'poor' | 'acceptable' | 'good' | 'very_good' | 'outstanding'

export interface TastingNote {
  id: string
  user_id: string
  wine_id: string
  tasted_at: string
  occasion?: string
  color_desc?: string
  clarity?: Clarity
  intensity_nose?: Intensity
  aromas?: string[]
  development?: Development
  sweetness?: Sweetness
  acidity?: AcidityLevel
  tannin?: TanninLevel
  body?: BodyLevel
  finish?: FinishLength
  flavors?: string[]
  score?: number
  conclusion?: Conclusion
  free_text?: string
  created_at: string
}
