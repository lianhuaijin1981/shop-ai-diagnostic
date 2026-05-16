import { create } from 'zustand'
import { persist } from 'zustand/middleware'

// ============ Auth Store ============

interface IAuthState {
  token: string | null
  userId: string | null
  username: string | null
  role: string | null
  isAuthenticated: boolean
  setAuth: (auth: { token: string; userId: string; username: string; role: string }) => void
  logout: () => void
}

export const useAuthStore = create<IAuthState>()(
  persist(
    (set, get) => ({
      token: null,
      userId: null,
      username: null,
      role: null,
      isAuthenticated: !!get().token,
      setAuth: (auth) =>
        set({
          token: auth.token,
          userId: auth.userId,
          username: auth.username,
          role: auth.role,
          isAuthenticated: true,
        }),
      logout: () =>
        set({
          token: null,
          userId: null,
          username: null,
          role: null,
          isAuthenticated: false,
        }),
    }),
    {
      name: 'auth-storage',
    },
  ),
)

// ============ Shop Store ============

interface Shop {
  id: string
  name: string
  code?: string
  address?: string
  manager?: string
  status?: 'active' | 'inactive' | 'closed'
}

interface IShopState {
  currentShopId: string | null
  shops: Shop[]
  currentShop: Shop | null
  setCurrentShop: (shopId: string) => void
  setShops: (shops: Shop[]) => void
  getShopById: (shopId: string) => Shop | undefined
}

export const useShopStore = create<IShopState>()(
  persist(
    (set, get) => ({
      currentShopId: null,
      shops: [],
      currentShop: null,
      setCurrentShop: (shopId) => {
        const shop = get().shops.find((s) => s.id === shopId) || null
        set({ currentShopId: shopId, currentShop: shop })
      },
      setShops: (shops) => {
        const currentShopId = get().currentShopId
        const currentShop = shops.find((s) => s.id === currentShopId) || null
        set({ shops, currentShop })
      },
      getShopById: (shopId) => get().shops.find((s) => s.id === shopId),
    }),
    {
      name: 'shop-storage',
    },
  ),
)

// ============ UI Settings Store ============

interface IUISettings {
  sidebarCollapsed: boolean
  theme: 'light' | 'dark'
  toggleSidebar: () => void
  setTheme: (theme: 'light' | 'dark') => void
}

export const useUISettings = create<IUISettings>()(
  persist(
    (set) => ({
      sidebarCollapsed: false,
      theme: 'light',
      toggleSidebar: () =>
        set((state) => ({ sidebarCollapsed: !state.sidebarCollapsed })),
      setTheme: (theme) => set({ theme }),
    }),
    {
      name: 'ui-settings',
    },
  ),
)

// ============ Loading Store ============

interface ILoadingState {
  globalLoading: boolean
  setGlobalLoading: (loading: boolean) => void
}

export const useLoadingStore = create<ILoadingState>()((set) => ({
  globalLoading: false,
  setGlobalLoading: (loading) => set({ globalLoading: loading }),
}))

// ============ Notification Store ============

interface Notification {
  id: string
  type: 'success' | 'error' | 'warning' | 'info'
  message: string
  description?: string
  duration?: number
}

interface INotificationState {
  notifications: Notification[]
  addNotification: (notification: Omit<Notification, 'id'>) => void
  removeNotification: (id: string) => void
  clearAll: () => void
}

export const useNotificationStore = create<INotificationState>()((set, get) => ({
  notifications: [],
  addNotification: (notification) => {
    const id = `notification-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
    const newNotification = { ...notification, id }
    set({ notifications: [...get().notifications, newNotification] })
    
    // 自动移除
    const duration = notification.duration || 3000
    if (duration > 0) {
      setTimeout(() => {
        get().removeNotification(id)
      }, duration)
    }
  },
  removeNotification: (id) => {
    set({ notifications: get().notifications.filter((n) => n.id !== id) })
  },
  clearAll: () => set({ notifications: [] }),
}))

// ============ Cache Store (临时数据缓存) ============

interface ICacheState {
  cache: Map<string, { data: unknown; timestamp: number }>
  set: (key: string, data: unknown, ttl?: number) => void
  get: <T>(key: string, ttl?: number) => T | null
  remove: (key: string) => void
  clear: () => void
}

const DEFAULT_TTL = 5 * 60 * 1000 // 5分钟

export const useCacheStore = create<ICacheState>()((set, get) => ({
  cache: new Map(),
  set: (key, data, ttl = DEFAULT_TTL) => {
    const newCache = new Map(get().cache)
    newCache.set(key, { data, timestamp: Date.now() + ttl })
    set({ cache: newCache })
  },
  get: <T>(key: string, ttl = DEFAULT_TTL) => {
    const cached = get().cache.get(key)
    if (!cached) return null
    if (Date.now() > cached.timestamp) {
      get().remove(key)
      return null
    }
    return cached.data as T
  },
  remove: (key) => {
    const newCache = new Map(get().cache)
    newCache.delete(key)
    set({ cache: newCache })
  },
  clear: () => set({ cache: new Map() }),
}))
