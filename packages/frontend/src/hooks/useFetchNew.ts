import { useEffect, useState } from 'react'
import { type JsonResponse } from '../../../types'
interface Props {
  url: string
  method: 'GET' | 'POST' | 'PUT' | 'DELETE'
  body?: Record<string, any>
  authorization?: string
}
/**
 * @returns returns the json response already solved, in case of error returns null
 */
export async function buildFetch<T>({ url, method, body, authorization = '' }: Props) {
  const options = {
    method,
    headers: new Headers({
      Authorization: 'Bearer ' + authorization,
      'Content-Type': 'application/json;charset=utf-8'
    }),
    body: body ? JSON.stringify(body) : undefined
  }
  return (await fetch(url, options).then(async res => await res.json())) as JsonResponse<T>
}
interface MainProps {
  query: Props
  deps: any[]
  conditional?: boolean
}
export default function useFetch<T = any | null>({ query, deps, conditional }: MainProps) {
  const [error, setError] = useState<string | null>(null)
  const [errorCode, setErrorCode] = useState<number>(0)
  const [load, setLoad] = useState(true)
  const [contents, setContents] = useState<T | null>(null)
  let result = { error, load, contents, errorCode }
  useEffect(() => {
    setLoad(true)
    const fetch = async () => {
      if (conditional !== undefined && !conditional) return result
      const data = await buildFetch<T>(query)
      if (data.ok) {
        setError(null)
        setErrorCode(0)
        setContents(data.contents)
        result = { error, load, contents, errorCode }
        return
      }
      setError(data.message)
      setErrorCode(data.code)
      result = { error, load, contents, errorCode }
    }
    fetch()
      .catch(() => {
        setError('error en la petición')
        setErrorCode(500)
        result = { error, load, contents, errorCode }
      })
      .finally(() => {
        setLoad(false)
      })
  }, deps)

  return result
}
