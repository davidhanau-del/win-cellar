const api = window.electronAPI

export const csvApi = {
  exportWines: () => api.invoke('csv:export-wines'),
  importWines: () => api.invoke('csv:import-wines'),
}
