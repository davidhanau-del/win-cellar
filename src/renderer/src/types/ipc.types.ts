export type IpcChannel =
  | 'wine:list'
  | 'wine:get'
  | 'wine:create'
  | 'wine:update'
  | 'wine:delete'
  | 'wine:search'
  | 'cellar:list'
  | 'cellar:adjust'
  | 'cellar:history'
  | 'tasting:list'
  | 'tasting:create'
  | 'tasting:update'
  | 'tasting:delete'
  | 'pairing:search'
  | 'pairing:by-wine'
  | 'pairing:create'
  | 'csv:export-wines'
  | 'csv:import-wines'
  | 'auth:sign-in'
  | 'auth:sign-out'
  | 'auth:session'
  | 'label:scan'

export interface IpcResult<T = unknown> {
  ok: boolean
  data?: T
  error?: string
}
