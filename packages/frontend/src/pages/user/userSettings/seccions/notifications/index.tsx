import { createContext, useContext, useEffect, useState } from 'react'
import Option from '../../Option'
import DelaySetting from './DelaySetting'
import MaxRemittedSetting from './MaxRemittedSetting'
import MinPagesSetting from './MinPagesSetting'
import DefaultSetting from './defaultSetting'
import SetNotifications from './setNotifications'
import DBLocal, { type ResultDB } from '../../../../../utils/serviceWorker/sw_modules/DBLocal'
import UpdateNotifications from './updateNotifications'
import { type UseState } from '../../../../../../types'
import { KeysLocalStorage } from '../../../../../enum'
import AwaitLoad from '../../../../../components/AwaitLoad'

const title = 'Notificaciones'
const tag = 'notifications'
const ContextSettings = createContext<UseState<ResultDB | undefined> | undefined>(undefined)
export function useSettingsContext() {
  const context = useContext(ContextSettings)
  if (!context) throw new Error('Out of Context Settings')
  const [setting, setSetting] = context
  return { setting, setSetting }
}
function Options() {
  const [load, setLoad] = useState(true)
  const [setting, setSetting] = useState<ResultDB>()
  useEffect(() => {
    const database = async () => {
      setSetting(await DBLocal.get(KeysLocalStorage.notifications))
      setLoad(false)
    }
    database().catch(e => {
      console.error(e)
      throw new Error('error load Notification id IndexedDb')
    })
  }, [])
  if (load) return <AwaitLoad />
  return (
    <ContextSettings.Provider value={[setting, setSetting]}>
      <Option
        title='Dar Los Permisos'
        description='Activa o desactiva las notificaciones que te enviamos.'
        descriptionAction={undefined}
        actions={<SetNotifications />}
      />
      <Option
        title={'Actualizar Notificaciones'}
        description={'Renueva la paridad con el backend, en caso de no estar recibiendo notificaciones.'}
        descriptionAction={undefined}
        actions={<UpdateNotifications />}
      />
      <Option
        title='Restaurar Configuración'
        description='Devuelve la configuración a su valor por defecto.'
        descriptionAction={undefined}
        actions={<DefaultSetting />}
      />
      <Option
        title={'Tiempo de espera de Notificaciones'}
        description={
          'Controla cuanto tiempo tarda en enviar una notificación si no se cumplen las otras configuraciones, unidad en minutos.'
        }
        descriptionAction={undefined}
        actions={<DelaySetting />}
      />
      <Option
        title={'Cantidad de notificaciones por Anime'}
        description={
          'Controla la cantidad de Notificaciones que se envían por anime, esto es valido dentro de las 8 horas.'
        }
        descriptionAction={undefined}
        actions={<MaxRemittedSetting />}
      />
      <Option
        title={'Cantidad minima de paginas por Notificaciones'}
        description={'Fuerza la cantidad minima de paginas para el envío de la notificación.'}
        descriptionAction={undefined}
        actions={<MinPagesSetting />}
      />
      <Option
        title={'Esperar por Paginas Especificas'}
        description={'Futura implementación.'}
        descriptionAction={undefined}
        actions={undefined}
      />
      <Option
        title={'Filtrar Por Animes Fav'}
        description={'Futura implementación.'}
        descriptionAction={undefined}
        actions={undefined}
      />
    </ContextSettings.Provider>
  )
}
export default { title, tag, Options }
