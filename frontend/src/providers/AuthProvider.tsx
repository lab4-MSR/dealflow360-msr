import {
  createContext,
  useContext,
  useCallback,
  useEffect,
  useState,
  type ReactNode,
} from 'react'
import { authService } from '@/services/auth'
import type { AuthUser, AuthState } from '@/types/auth'
import { ROLE_DASHBOARD_MAP } from '@/types/auth'

interface AuthContextType extends AuthState {
  login: (email: string, password: string) => Promise<void>
  signup: (payload: { full_name: string; email: string; password: string; business_name: string }) => Promise<void>
  logout: () => Promise<void>
  refreshSession: () => Promise<void>
  getDashboardPath: () => string
  clearError: () => void
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const clearError = useCallback(() => setError(null), [])

  const refreshSession = useCallback(async () => {
    const token = localStorage.getItem('dealflow360-access-token')
    if (!token) {
      setUser(null)
      setIsLoading(false)
      return
    }
    try {
      const sessionUser = await authService.getSession()
      setUser(sessionUser)
    } catch {
      localStorage.removeItem('dealflow360-access-token')
      localStorage.removeItem('dealflow360-refresh-token')
      setUser(null)
    } finally {
      setIsLoading(false)
    }
  }, [])

  useEffect(() => {
    refreshSession()
  }, [refreshSession])

  const login = useCallback(
    async (email: string, password: string) => {
      setError(null)
      setIsLoading(true)
      try {
        const response = await authService.login({ email, password })
        localStorage.setItem('dealflow360-access-token', response.access_token)
        localStorage.setItem('dealflow360-refresh-token', response.refresh_token)
        setUser(response.user)
      } catch (err: unknown) {
        const axiosError = err as { response?: { data?: { error?: { message?: string } } } }
        const message =
          axiosError?.response?.data?.error?.message || 'We couldn\'t sign you in. Please try again.'
        setError(message)
        throw err
      } finally {
        setIsLoading(false)
      }
    },
    []
  )

  const signup = useCallback(
    async (payload: { full_name: string; email: string; password: string; business_name: string }) => {
      setError(null)
      setIsLoading(true)
      try {
        const response = await authService.signup(payload)
        localStorage.setItem('dealflow360-access-token', response.access_token)
        localStorage.setItem('dealflow360-refresh-token', response.refresh_token)
        setUser(response.user)
      } catch (err: unknown) {
        const axiosError = err as { response?: { data?: { error?: { message?: string } } } }
        const message =
          axiosError?.response?.data?.error?.message || 'We could not create your account. Please try again.'
        setError(message)
        throw err
      } finally {
        setIsLoading(false)
      }
    },
    []
  )

  const logout = useCallback(async () => {
    await authService.logout()
    setUser(null)
  }, [])

  const getDashboardPath = useCallback(() => {
    if (!user) return '/dashboard'
    return ROLE_DASHBOARD_MAP[user.role] || '/dashboard'
  }, [user])

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: !!user,
        isLoading,
        error,
        login,
        signup,
        logout,
        refreshSession,
        getDashboardPath,
        clearError,
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}
