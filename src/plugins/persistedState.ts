import type { PiniaPlugin } from 'pinia'
import { persistedStateConfig } from '@/plugins/persistedState.config'

// Pinia plugin that persists every store's state change to
// localStorage and rehydrates it on page load.
export const persistedStatePlugin: PiniaPlugin = ({ store }) => {
  const storageKey = `pinia:${store.$id}`
  const fieldsToPersist = persistedStateConfig[store.$id as keyof typeof persistedStateConfig]

  // If this store is not whitelisted config, do not persist it.
  if (!fieldsToPersist) return

  // Rehydrate from localStorage on startup.
  try {
    const rawLocalStorageValue = localStorage.getItem(storageKey)

    if (rawLocalStorageValue) {
      const parsedLocalStorageValue = JSON.parse(rawLocalStorageValue)
      store.$patch(parsedLocalStorageValue)
    }
  } catch (e) {
    console.warn(`persistedState: rehydration failed for ${storageKey}.`, e)
  }

  // Persist to localStorage on every state change.
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
