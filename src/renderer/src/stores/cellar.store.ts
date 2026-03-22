import { create } from 'zustand'
import type { CellarEntry } from '../types/wine.types'
import { cellarApi } from '../api/cellar.api'

interface CellarStore {
  entries: CellarEntry[]
  isLoading: boolean
  error: string | null
  fetch: () => Promise<void>
  adjust: (entryId: string | null, wineId: string, delta: number) => Promise<void>
  totalBottles: () => number
  totalValue: () => number
}

export const useCellarStore = create<CellarStore>((set, get) => ({
  entries: [],
  isLoading: false,
  error: null,

  fetch: async () => {
    set({ isLoading: true, error: null })
    const result = await cellarApi.list()
    if (result.ok) {
      set({ entries: result.data || [], isLoading: false })
    } else {
      set({ error: result.error || 'Failed to fetch cellar', isLoading: false })
    }
  },

  adjust: async (entryId, wineId, delta) => {
    // optimistic update
    if (entryId !== null) {
      set((state) => ({
        entries: state.entries.map((e) =>
          e.id === entryId ? { ...e, quantity: Math.max(0, e.quantity + delta) } : e
        ),
      }))
    }
    const result = await cellarApi.adjust(entryId, wineId, delta)
    if (result.ok && result.data && entryId === null) {
      // nouvelle entrée créée, on l'ajoute au store
      set((state) => ({ entries: [...state.entries, result.data!] }))
    } else if (!result.ok) {
      get().fetch() // revert
    }
  },

  totalBottles: () => get().entries.reduce((sum, e) => sum + e.quantity, 0),

  totalValue: () =>
    get().entries.reduce((sum, e) => {
      const price = e.wine?.estimated_value || e.wine?.price_paid || 0
      return sum + price * e.quantity
    }, 0),
}))
