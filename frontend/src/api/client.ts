const apiBaseUrl = (import.meta.env.VITE_API_URL || '/api/v1').replace(/\/$/, '')
const tokenStorageKey = 'verixa_token'

export class ApiError extends Error {
  status: number

  constructor(status: number, message: string) {
    super(message)
    this.name = 'ApiError'
    this.status = status
  }
}

export const getAuthToken = () => localStorage.getItem(tokenStorageKey)

export const setAuthToken = (token: string) => {
  localStorage.setItem(tokenStorageKey, token)
}

export const clearAuthToken = () => {
  localStorage.removeItem(tokenStorageKey)
}

type RequestOptions = {
  method?: 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE'
  body?: unknown
  auth?: boolean
}

export async function apiRequest<T>(path: string, options: RequestOptions = {}): Promise<T> {
  const headers = new Headers()

  if (options.body !== undefined) {
    headers.set('Content-Type', 'application/json')
  }

  if (options.auth) {
    const token = getAuthToken()
    if (token) {
      headers.set('Authorization', `Bearer ${token}`)
    }
  }

  const response = await fetch(`${apiBaseUrl}${path}`, {
    method: options.method ?? 'GET',
    headers,
    body: options.body !== undefined ? JSON.stringify(options.body) : undefined,
  })

  const contentType = response.headers.get('Content-Type') ?? ''
  const data = contentType.includes('application/json') ? await response.json() : null

  if (!response.ok) {
    const message =
      data && typeof data === 'object' && 'message' in data && typeof data.message === 'string'
        ? data.message
        : 'Request failed'
    throw new ApiError(response.status, message)
  }

  return data as T
}

export const apiUrl = (path: string) => `${apiBaseUrl}${path}`
