import { urlApi } from '../config'
import { KeysLocalStorage } from '../enum'
const PATCH_SW = '/sw.js'
async function getPublicKey() {
  const publicKey = localStorage.getItem(KeysLocalStorage.publicKey)
  const data = !publicKey
    ? await fetch(`${urlApi}/subscription`) // eslint-disable-next-line @typescript-eslint/indent
        .then(async response => await response.json()) // eslint-disable-next-line @typescript-eslint/indent
        .then(response => response.contents.publicKey)
    : publicKey
  localStorage.setItem(KeysLocalStorage.publicKey, data)
  return data
}

async function subscription() {
  const PUBLIC_VAPID_KEY = await getPublicKey()
  const getRegister = await navigator.serviceWorker.getRegistration(PATCH_SW)
  const register =
    getRegister ??
    (await navigator.serviceWorker.register(PATCH_SW, {
      scope: '/',
      type: 'module'
    }))
  await register.update()

  const subscription = await register.pushManager.subscribe({
    userVisibleOnly: true,
    applicationServerKey: urlBase64ToUint8Array(PUBLIC_VAPID_KEY)
  })
  // Send Notification
  const postSubscriptions = await fetch(`${urlApi}/subscription`, {
    method: 'POST',
    body: JSON.stringify({
      pushSubscription: subscription,
      publicKey: PUBLIC_VAPID_KEY
    }),
    headers: {
      'Content-Type': 'application/json'
    }
  }).then(async response => await response.json())
  if (postSubscriptions.code !== 201) return 'error api'
  console.log(postSubscriptions)
  return 'active'
}

function urlBase64ToUint8Array(base64String: string) {
  const padding = '='.repeat((4 - (base64String.length % 4)) % 4)
  const base64 = (base64String + padding).replace(/-/g, '+').replace(/_/g, '/')

  const rawData = window.atob(base64)
  const outputArray = new Uint8Array(rawData.length)

  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i)
  }
  return outputArray
}
export type SubscriptionStatus = 'active' | 'denied' | 'error api' | 'error compatibility' | 'error not defined'
// Service Worker Support
export async function subscribe(): Promise<SubscriptionStatus> {
  if (!('Notification' in window)) {
    console.error('Este navegador no es compatible con las notificaciones de escritorio')
    return 'error compatibility'
  }
  let permission = Notification.permission
  if (Notification.permission === 'default') {
    permission = await Notification.requestPermission()
  }
  if (permission === 'granted') {
    if ('serviceWorker' in navigator) {
      return await subscription().catch(err => {
        console.error(err)
        return 'error not defined'
      })
    }
  }
  return 'denied'
}
export async function unsubscribe() {
  const register = await navigator.serviceWorker.getRegistration(PATCH_SW)
  if (register) {
    return await register.unregister()
  }
  return false
}
