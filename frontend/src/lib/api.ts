import axios, { type AxiosError, type InternalAxiosRequestConfig } from 'axios'

export interface ApiErrorResponse {
  success: false
  data: null
  meta: null
  error: {
    code: string
    message: string
    field?: string
    details?: Record<string, unknown>
  }
}

export interface ApiSuccessResponse<T> {
  success: true
  data: T
  meta?: {
    page: number
    per_page: number
    total: number
    total_pages: number
  } | null
  error: null
}

export type ApiResponse<T> = ApiSuccessResponse<T> | ApiErrorResponse

export interface ApiError {
  code: string
  message: string
  field?: string
  details?: Record<string, unknown>
}

export interface SearchResult {
  type: string
  id: string
  title: string
  subtitle?: string
  description?: string
  status?: string
  url: string
}

export interface SearchResponse {
  success: boolean
  data: SearchResult[]
  meta: {
    total: number
    query: string
  }
  error: ApiError | null
}

export interface SearchParams {
  q: string
  type?: string
  status?: string
  date_from?: string
  date_to?: string
  owner_id?: string
}

const apiClient = axios.create({
  baseURL: '/api/v1',
  headers: { 'Content-Type': 'application/json' },
  timeout: 15000,
})

apiClient.interceptors.request.use((config: InternalAxiosRequestConfig) => {
  const token = localStorage.getItem('dealflow360-access-token') || localStorage.getItem('access_token')
  if (token && config.headers) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

apiClient.interceptors.response.use(
  (response) => response,
  (error: AxiosError<ApiErrorResponse>) => {
    const url = error.config?.url || ''
    const isAuthRequest =
      url.includes('/auth/login') ||
      url.includes('/auth/logout') ||
      url.includes('/auth/signup') ||
      url.includes('/auth/session')
    const token = localStorage.getItem('dealflow360-access-token')
    const isMockToken = token?.startsWith('mock_token_')

    if (error.response?.status === 401 && !isAuthRequest && !isMockToken) {
      localStorage.removeItem('dealflow360-access-token')
      localStorage.removeItem('dealflow360-refresh-token')
      localStorage.removeItem('dealflow360-user')
      const currentPath = window.location.pathname
      if (!currentPath.startsWith('/login') && !currentPath.startsWith('/auth') && currentPath !== '/') {
        window.location.href = `/login?returnTo=${encodeURIComponent(currentPath)}`
      }
    }
    return Promise.reject(error)
  }
)

export function getApiErrorMessage(error: unknown): string {
  if (axios.isAxiosError(error)) {
    const apiError = error.response?.data as ApiErrorResponse | undefined
    if (apiError?.error?.message) return apiError.error.message
    if (error.response?.status === 0 || !error.response) {
      return "We couldn't connect to DealFlow360. Please check your connection and try again."
    }
    if (error.response?.status === 429) {
      return 'Too many attempts. Please wait a moment and try again.'
    }
    if (error.response?.status && error.response.status >= 500) {
      return 'Something went wrong on our end. Please try again.'
    }
    return error.message || 'An unexpected error occurred.'
  }
  if (error instanceof Error) return error.message
  return 'An unexpected error occurred.'
}

export function getApiErrorCode(error: unknown): string | undefined {
  if (axios.isAxiosError(error)) {
    const apiError = error.response?.data as ApiErrorResponse | undefined
    return apiError?.error?.code
  }
  return undefined
}

export function getApiErrorField(error: unknown): string | undefined {
  if (axios.isAxiosError(error)) {
    const apiError = error.response?.data as ApiErrorResponse | undefined
    return apiError?.error?.field
  }
  return undefined
}

export const api = apiClient
export default apiClient
