import { contextBridge, ipcRenderer } from 'electron'
import type { IpcChannel, IpcResult } from '../src/renderer/src/types/ipc.types'

contextBridge.exposeInMainWorld('electronAPI', {
  invoke: <T>(channel: IpcChannel, payload?: unknown): Promise<IpcResult<T>> =>
    ipcRenderer.invoke(channel, payload)
})
