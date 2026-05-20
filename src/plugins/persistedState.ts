import type { PiniaPlugin } from 'pinia'
import { persistedStateConfig } from '@/plugins/persistedState.config'

export const persistedStatePlugin: PiniaPlugin = ({ store }) => {
  const storageKey = `pinia:${store.$id}`
  const fieldsToPersist = persistedStateConfig[store.$id as keyof typeof persistedStateConfig]

  // If this store is not listed config, do not persist it
  if (!fieldsToPersist) return

  // Rehydration (loading from localStorage)
  try {
    const rawLocalStorageValue = localStorage.getItem(storageKey)

    if (rawLocalStorageValue) {
      const parsedLocalStorageValue = JSON.parse(rawLocalStorageValue)
      store.$patch(parsedLocalStorageValue)
    }
  } catch (e) {
    console.warn(`persistedState: rehydration failed for ${storageKey}.`, e)
  }

  // Persistence (saving to localStorage)
  store.$subscribe((_, state) => {
    try {
      const persistableState = Object.fromEntries(
        fieldsToPersist.map((field) => [field, (state as Record<string, unknown>)[field]]),
      )

      localStorage.setItem(storageKey, JSON.stringify(persistableState))
    } catch (e) {
      console.warn(`persistedState: persistence failed for ${storageKey}.`, e)
    }
  })
}
