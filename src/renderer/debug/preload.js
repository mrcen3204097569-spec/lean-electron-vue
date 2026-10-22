import { contextBridge } from 'electron'

contextBridge.exposeInMainWorld('ttApi', {
  debugApi: () => 12354
})
