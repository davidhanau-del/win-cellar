/// <reference types="vite/client" />

import type { IpcChannel, IpcResult } from './types/ipc.types'

declare global {
  interface Window {
    electronAPI: {
      invoke: <T = unknown>(channel: IpcChannel, payload?: unknown) => Promise<IpcResult<T>>
    }
  }
}
