import { create } from 'zustand'
import type { Wine, WineFilters, ViewMode } from '../types/wine.types'
import { winesApi } from '../api/wines.api'

interface WineStore {
  wines: Wine[]
  selectedWine: Wine | null
  filters: WineFilters
  viewMode: ViewMode
  isLoading: boolean
  error: string | null
  fetch: () => Promise<void>
  selectWine: (wine: Wine | null) => void
  setFilters: (filters: Partial<WineFilters>) => void
  clearFilters: () => void
  setViewMode: (mode: ViewMode) => void
  addWine: (wine: Omit<Wine, 'id' | 'user_id' | 'created_at' | 'updated_at'>) => Promise<Wine | null>
  updateWine: (id: string, payload: Partial<Wine>) => Promise<void>
  deleteWine: (id: string) => Promise<void>
}

export const useWineStore = create<WineStore>((set, get) => ({
  wines: [],
  selectedWine: null,
  filters: {},
  viewMode: 'grid',
  isLoading: false,
  error: null,

  fetch: async () => {
    set({ isLoading: true, error: null })
    const result = await winesApi.list()
    if (result.ok) {
      set({ wines: result.data || [], isLoading: false })
    } else {
      set({ error: result.error || 'Failed to fetch wines', isLoading: false })
    }
  },

  selectWine: (wine) => set({ selectedWine: wine }),

  setFilters: (filters) => set((state) => ({ filters: { ...state.filters, ...filters } })),

  clearFilters: () => set({ filters: {} }),

  setViewMode: (viewMode) => set({ viewMode }),

  addWine: async (payload) => {
    const result = await winesApi.create(payload)
    if (result.ok && result.data) {
      set((state) => ({ wines: [...state.wines, result.data!] }))
      return result.data
    }
    console.error('[wine:create] error:', result.error)
    return null
  },

  updateWine: async (id, payload) => {
    const result = await winesApi.update(id, payload)
    if (result.ok && result.data) {
      set((state) => ({
        wines: state.wines.map((w) => (w.id === id ? result.data! : w)),
        selectedWine: state.selectedWine?.id === id ? result.data! : state.selectedWine,
      }))
    }
  },

  deleteWine: async (id) => {
    set((state) => ({ wines: state.wines.filter((w) => w.id !== id) }))
    const result = await winesApi.delete(id)
    if (!result.ok) {
      get().fetch()
    }
  },
}))

export function useFilteredWines() {
  const { wines, filters } = useWineStore()
  return wines.filter((w) => {
    if (filters.color && w.color !== filters.color) return false
    if (filters.region && !w.region.toLowerCase().includes(filters.region.toLowerCase())) return false
    if (filters.vintageMin && w.vintage && w.vintage < filters.vintageMin) return false
    if (filters.vintageMax && w.vintage && w.vintage > filters.vintageMax) return false
    if (filters.search) {
      const q = filters.search.toLowerCase()
      const match = w.name.toLowerCase().includes(q) ||
        (w.domain || '').toLowerCase().includes(q) ||
        w.region.toLowerCase().includes(q)
      if (!match) return false
    }
    return true
  })
}
