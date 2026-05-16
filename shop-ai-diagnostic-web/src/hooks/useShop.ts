import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { shopApi } from '@/api'
import type { IShop } from '@/types'
import { useShopStore } from '@/stores'

/**
 * 门店列表 Hook
 */
export function useShops() {
  return useQuery({
    queryKey: ['shops'],
    queryFn: () => shopApi.getList(),
    staleTime: 5 * 60 * 1000, // 5分钟内不重新请求
  })
}

/**
 * 当前门店 Hook
 */
export function useCurrentShop() {
  const { currentShop, currentShopId, setCurrentShop, setShops } = useShopStore()
  const { data, isLoading } = useShops()

  // 同步门店数据到 store
  if (data?.data && Array.isArray(data.data)) {
    const shopList = data.data.map((shop: any) => ({
      id: shop._id || shop.id,
      name: shop.name,
      code: shop.code,
      address: shop.address,
      manager: shop.manager,
      status: shop.status,
    }))
    if (shopList.length > 0 && !currentShopId) {
      setShops(shopList)
      setCurrentShop(shopList[0].id)
    }
  }

  return {
    currentShop,
    currentShopId,
    isLoading,
  }
}
