import axios, { type AxiosInstance, type InternalAxiosRequestConfig } from 'axios'

const API_BASE_URL = import.meta.env.VITE_API_URL || '/api/v1'

class ApiClient {
  private client: AxiosInstance

  constructor() {
    this.client = axios.create({
      baseURL: API_BASE_URL,
      headers: {
        'Content-Type': 'application/json',
      },
    })

    this.client.interceptors.request.use(
      (config: InternalAxiosRequestConfig) => {
        const token = localStorage.getItem('access_token')
        if (token) {
          config.headers.Authorization = `Bearer ${token}`
        }
        return config
      },
      (error) => Promise.reject(error)
    )

    this.client.interceptors.response.use(
      (response) => response,
      (error) => Promise.reject(error)
    )
  }

  async get<T>(url: string, params?: Record<string, unknown>) {
    const response = await this.client.get<T>(url, { params })
    return response.data
  }

  async post<T>(url: string, data?: unknown) {
    const response = await this.client.post<T>(url, data)
    return response.data
  }

  async patch<T>(url: string, data?: unknown) {
    const response = await this.client.patch<T>(url, data)
    return response.data
  }

  async delete<T>(url: string) {
    const response = await this.client.delete<T>(url)
    return response.data
  }
}

export const api = new ApiClient()

export interface ApiResponse<T> {
  success: boolean
  data: T
  meta: Record<string, unknown> | null
  error: ApiError | null
}

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
  subtitle: string
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