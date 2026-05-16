import { useMutation } from '@tanstack/react-query'
import { authApi } from '@/api'
import { useAuthStore } from '@/stores'
import { useNavigate } from 'react-router-dom'

/**
 * 登录 Mutation
 */
export function useLogin() {
  const { setAuth } = useAuthStore()
  const navigate = useNavigate()

  return useMutation({
    mutationFn: (data: { username: string; password: string }) =>
      authApi.login(data),
    onSuccess: (response) => {
      const { token, user } = response.data.data
      setAuth({
        token,
        userId: user.id,
        username: user.username,
        role: user.role,
      })
      navigate('/dashboard')
    },
  })
}

/**
 * 登出 Mutation
 */
export function useLogout() {
  const { logout } = useAuthStore()
  const navigate = useNavigate()

  return useMutation({
    mutationFn: () => authApi.logout(),
    onSettled: () => {
      logout()
      navigate('/login')
    },
  })
}

/**
 * 用户信息 Hook
 */
export function useAuth() {
  const auth = useAuthStore()
  return auth
}
