import { useMutation } from '@tanstack/react-query'
import { authApi } from '@/api/http'
import { useAuthStore } from '@/stores'
import { useNavigate } from 'react-router-dom'

/**
 * 登录 Mutation
 */
export function useLogin() {
  const { setAuth } = useAuthStore()
  const navigate = useNavigate()

  return useMutation({
    mutationFn: async (data: { username: string; password: string }) => {
      const response = await authApi.login(data)
      // 响应拦截器会返回 AxiosResponse，data.data 是实际的业务数据
      return (response as unknown as { data: { token: string; user: { id: string; username: string; role: string } } }).data
    },
    onSuccess: (data) => {
      const { token, user } = data
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
