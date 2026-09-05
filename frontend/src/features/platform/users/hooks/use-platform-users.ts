import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import type { PlatformUserFilters, InvitePlatformUserInput } from '../types'
import { fetchPlatformUsers, fetchPlatformUserKpis, fetchPlatformUserById, invitePlatformUser, updatePlatformUserStatus } from '../services/platform-users'

export function usePlatformUsers(filters: PlatformUserFilters) {
  return useQuery({
    queryKey: ['platform-users', filters],
    queryFn: () => fetchPlatformUsers(filters),
    staleTime: 5 * 60 * 1000,
  })
}

export function usePlatformUserKpis() {
  return useQuery({
    queryKey: ['platform-user-kpis'],
    queryFn: fetchPlatformUserKpis,
    staleTime: 5 * 60 * 1000,
  })
}

export function usePlatformUserDetail(id: string) {
  return useQuery({
    queryKey: ['platform-user', id],
    queryFn: () => fetchPlatformUserById(id),
    staleTime: 5 * 60 * 1000,
    enabled: !!id,
  })
}

export function useInvitePlatformUser() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (input: InvitePlatformUserInput) => invitePlatformUser(input),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['platform-users'] })
      queryClient.invalidateQueries({ queryKey: ['platform-user-kpis'] })
    },
  })
}

export function useUpdatePlatformUserStatus() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ id, status }: { id: string; status: 'active' | 'suspended' }) => updatePlatformUserStatus(id, status),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['platform-users'] })
      queryClient.invalidateQueries({ queryKey: ['platform-user-kpis'] })
    },
  })
}
