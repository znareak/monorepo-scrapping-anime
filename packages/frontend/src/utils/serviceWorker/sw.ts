import DBLocal from './sw_modules/DBLocal.js'
import { updateNotifications } from './sw_modules/updateNotifications.js'
import { filterNotifications } from './sw_modules/filterNotifications.js'
import type { InAwait, NotificationsInAired, NotificationInAwait } from '../../../types'
import type { PayloadAnimeNof } from '../../../../types/Payloads'

declare const self: ServiceWorkerGlobalScope

function stringToObject<T = any>(s: string | undefined): T | null {
  try {
    const object = JSON.parse(s as string)
    return object
  } catch {
    return null
  }
}

function buildMessage(inAwait: InAwait) {
  const title = `Ep. ${inAwait.anime.episode} de: ${inAwait.anime.title}`
  const namePages = inAwait.anime.namePages
  const lastNamePages = namePages.pop() ?? ''

  const body = `En: ${namePages.join(', ')}${namePages.length === 0 ? '' : ' y '}${lastNamePages}.`
  const options: NotificationOptions = {
    body,
    icon: inAwait.anime.image,
    data: inAwait.anime
  }
  return { title, options }
}
async function pushesReceived(pushes: PayloadAnimeNof[]) {
  const currentTime = Date.now()
  const notificationsSettings = stringToObject<NotificationsInAired>((await DBLocal.get('notifications'))?.value)
  if (!notificationsSettings) {
    console.error('Notifications not found in IndexedDB')
    return
  }
  let notificationsInAwait =
    stringToObject<NotificationInAwait>((await DBLocal.get('notificationsInAwait'))?.value) ?? []

  notificationsInAwait = updateNotifications({
    currentTime,
    inAwaits: notificationsInAwait,
    pushes,
    settings: notificationsSettings
  })
  const { forSend, retained } = filterNotifications({
    inAwaits: notificationsInAwait,
    currentTime,
    settings: notificationsSettings
  })
  console.log({ forSend, retained })
  await DBLocal.set('notificationsInAwait', JSON.stringify([...forSend, ...retained]))
  for await (const inAwait of forSend) {
    const message = buildMessage(inAwait)
    await self.registration.showNotification(message.title, message.options)
  }
}
self.addEventListener('push', e => {
  const data: PayloadAnimeNof[] = e.data?.json()

  e.waitUntil(
    (async () => {
      const settings = stringToObject<NotificationsInAired>((await DBLocal.get('notifications'))?.value)
      if (!settings) {
        console.error('Notifications not found in IndexedDB')
        return
      }
      await pushesReceived(data)
      setTimeout(async () => {
        await pushesReceived([])
      }, settings.delay + 30000)
    })()
  )
})

// ON CLICK NOTIFICATION ********************************
self.addEventListener('notificationclick', event => {
  event.notification.close()
  const url = '/?id=' + `${event.notification.data.id as number}`
  event.waitUntil(
    (async () => {
      await self.clients.openWindow(url)
    })()
  )
})
