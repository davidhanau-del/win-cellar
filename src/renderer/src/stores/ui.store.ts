import { create } from 'zustand'

type ModalType = 'wine-form' | 'tasting-form' | 'confirm' | null

interface UiStore {
  activeModal: ModalType
  sidebarCollapsed: boolean
  openModal: (modal: ModalType) => void
  closeModal: () => void
  toggleSidebar: () => void
}

export const useUiStore = create<UiStore>((set) => ({
  activeModal: null,
  sidebarCollapsed: false,
  openModal: (modal) => set({ activeModal: modal }),
  closeModal: () => set({ activeModal: null }),
  toggleSidebar: () => set((state) => ({ sidebarCollapsed: !state.sidebarCollapsed })),
}))
