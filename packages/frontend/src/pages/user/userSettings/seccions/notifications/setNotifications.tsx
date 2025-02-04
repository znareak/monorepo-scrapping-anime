import { useState } from 'react'
import { KeysLocalStorage } from '../../../../../enum'
import { subscribe, unsubscribe } from '../../../../../utils/swSubscribe'
import { DEFAULT_NOTIFICATIONS } from '../../../../../utils/const'
import { useSettingsContext } from '.'
import initDb from '../../../../../utils/serviceWorker/sw_modules/DBLocal'

export default function setNotifications() {
  const { setting, setSetting } = useSettingsContext()
  const notificationsString = setting?.value
  const [load, setLoad] = useState(false)
  if (notificationsString) {
    return (
      <button
        className='button__danger'
        onClick={async () => {
          setLoad(true)
          console.log(await unsubscribe())
          setLoad(false)
          localStorage.removeItem(KeysLocalStorage.publicKey)
          await initDb.delete(KeysLocalStorage.notifications)
          setSetting(undefined)
        }}>
        {load ? <p> . . . </p> : <>Desactivar</>}
      </button>
    )
  }
  return (
    <button
      className='button'
      onClick={async () => {
        setLoad(true)
        console.log(await subscribe())
        setSetting(await initDb.set(KeysLocalStorage.notifications, JSON.stringify(DEFAULT_NOTIFICATIONS)))
        setLoad(false)
      }}>
      {load ? <p>. . . </p> : <>Suscribirse</>}
    </button>
  )
}
