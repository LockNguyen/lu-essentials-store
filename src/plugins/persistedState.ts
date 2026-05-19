import type { PiniaPlugin } from 'pinia'

export const persistedStatePlugin: PiniaPlugin = ({ store }) => {
  // rehydration (loading from localStorage)
  try {
    const rawLocalStorageValue = localStorage.getItem(`pinia:${store.$id}`)
    console.log('raw:', rawLocalStorageValue)

    if (!rawLocalStorageValue) {
      throw new Error(
        `persistedState: rehydration failed because ${`pinia:${store.$id}`} is not found in localStorage.`,
      )
    }

    const parsedLocalStorageValue = JSON.parse(rawLocalStorageValue)
    store.$patch(parsedLocalStorageValue)
    console.log('parsed:', parsedLocalStorageValue)
  } catch (e) {
    console.warn('persistedState: rehydration failed.', e)
  }

  // persistence (saving to localStorage)
  store.$subscribe((_, state) => {
    try {
      localStorage.setItem(`pinia:${store.$id}`, JSON.stringify(state))
      console.log(
        'Saving to localStorage:',
        `pinia:${store.$id}`,
        localStorage.getItem(`pinia:${store.$id}`),
      )
    } catch (e) {
      console.warn('persistedState: persistence failed.', e)
    }
  })
}
