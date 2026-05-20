import type { PiniaPlugin } from 'pinia'

export const persistedStatePlugin: PiniaPlugin = ({ store }) => {
  // rehydration (loading from localStorage)
  try {
    const rawLocalStorageValue = localStorage.getItem(`pinia:${store.$id}`)

    if (!rawLocalStorageValue) {
      throw new Error(
        `persistedState: rehydration failed because ${`pinia:${store.$id}`} is not found in localStorage.`,
      )
    }

    const parsedLocalStorageValue = JSON.parse(rawLocalStorageValue)
    store.$patch(parsedLocalStorageValue)
  } catch (e) {
    console.warn('persistedState: rehydration failed.', e)
  }

  // persistence (saving to localStorage)
  store.$subscribe((_, state) => {
    try {
      localStorage.setItem(`pinia:${store.$id}`, JSON.stringify(state))
    } catch (e) {
      console.warn('persistedState: persistence failed.', e)
    }
  })
}
