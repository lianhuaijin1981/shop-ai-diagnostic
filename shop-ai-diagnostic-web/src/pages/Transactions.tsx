import { useQuery } from '@tanstack/react-query'
import { transactionApi } from '@/api/http'
import { useShopStore } from '@/stores'
import { Search, Filter, Receipt, TrendingUp, CreditCard, Banknote, Smartphone, Building } from 'lucide-react'
import { useState } from 'react'
import type { ITransaction, ITransactionItem } from '@/types'

export function Transactions() {
  const { currentShop } = useShopStore()
  const [searchQuery, setSearchQuery] = useState('')
  const [page, setPage] = useState(1)
  const pageSize = 20

  // 获取交易记录
  const { data: txnData, isLoading } = useQuery({
    queryKey: ['transactions', currentShop.id, page],
    queryFn: () => transactionApi.getList(currentShop.id, page, pageSize),
    enabled: !!currentShop.id,
  })

  const transactions = txnData?.data?.list || []
  const total = txnData?.data?.total || 0
  const totalPages = txnData?.data?.totalPages || 1

  // 筛选
  const filtered = transactions.filter(t => {
    if (searchQuery) {
      const keyword = searchQuery.toLowerCase()
      return (
        t.id?.toLowerCase().includes(keyword) ||
        t.customerId?.toLowerCase().includes(keyword)
      )
    }
    return true
  })

  const formatCurrency = (amount: number) => {
    return `¥${amount.toLocaleString('zh-CN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
  }

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleString('zh-CN', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    })
  }

  const getPaymentLabel = (method: string) => {
    const map: Record<string, { label: string; icon: any; color: string }> = {
      cash: { label: '现金', icon: Banknote, color: 'text-gray-600' },
      wechat: { label: '微信', icon: Smartphone, color: 'text-green-600' },
      alipay: { label: '支付宝', icon: CreditCard, color: 'text-blue-600' },
      card: { label: '银行卡', icon: Building, color: 'text-purple-600' },
    }
    return map[method] || { label: method, icon: CreditCard, color: 'text-gray-600' }
  }

  const calculateProfit = (txn: ITransaction) => {
    if (txn.profit !== undefined) return txn.profit
    // 如果没有profit字段，尝试从items计算
    if (txn.items) {
      const totalCost = txn.items.reduce((sum: number, item: ITransactionItem) => sum + item.cost * item.quantity, 0)
      return Math.round((txn.totalAmount - totalCost) * 100) / 100
    }
    return 0
  }

  // 统计
  const totalRevenue = filtered.reduce((sum, t) => sum + t.totalAmount, 0)
  const totalProfit = filtered.reduce((sum, t) => sum + calculateProfit(t), 0)

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">交易记录</h1>
          <p className="text-sm text-gray-500 mt-1">
            共 {total} 笔交易 · 累计 ¥{totalRevenue.toLocaleString('zh-CN', { maximumFractionDigits: 2 })}
          </p>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4">
        <div className="bg-white rounded-xl p-4 shadow-card">
          <p className="text-sm text-gray-500 mb-1">交易总额</p>
          <p className="text-2xl font-bold text-gray-900">{formatCurrency(totalRevenue)}</p>
        </div>
        <div className="bg-white rounded-xl p-4 shadow-card">
          <p className="text-sm text-gray-500 mb-1">交易笔数</p>
          <p className="text-2xl font-bold text-gray-900">{filtered.length}</p>
        </div>
        <div className="bg-white rounded-xl p-4 shadow-card">
          <p className="text-sm text-gray-500 mb-1">总利润</p>
          <p className="text-2xl font-bold text-success">{formatCurrency(totalProfit)}</p>
        </div>
      </div>

      {/* Search */}
      <div className="flex items-center gap-4">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            placeholder="搜索交易ID或客户ID..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
          />
        </div>
      </div>

      {/* Transaction List */}
      <div className="bg-white rounded-xl shadow-card overflow-hidden">
        {isLoading ? (
          <div className="text-center py-12 text-gray-500">加载中...</div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-12">
            <Receipt className="w-12 h-12 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-500">暂无交易记录</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-100 bg-gray-50">
                  <th className="text-left py-3 px-4 text-gray-500 font-medium">交易ID</th>
                  <th className="text-left py-3 px-4 text-gray-500 font-medium">时间</th>
                  <th className="text-left py-3 px-4 text-gray-500 font-medium">商品</th>
                  <th className="text-right py-3 px-4 text-gray-500 font-medium">金额</th>
                  <th className="text-right py-3 px-4 text-gray-500 font-medium">利润</th>
                  <th className="text-left py-3 px-4 text-gray-500 font-medium">支付方式</th>
                  <th className="text-left py-3 px-4 text-gray-500 font-medium">客户</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((txn) => {
                  const payment = getPaymentLabel(txn.paymentMethod)
                  const PaymentIcon = payment.icon
                  const profit = calculateProfit(txn)
                  return (
                    <tr key={txn.id} className="border-b border-gray-50 hover:bg-gray-50 transition-colors">
                      <td className="py-3 px-4">
                        <span className="font-mono text-xs text-gray-500">{txn.id}</span>
                      </td>
                      <td className="py-3 px-4 text-gray-600">
                        {formatDate(txn.createdAt)}
                      </td>
                      <td className="py-3 px-4">
                        <div className="max-w-xs">
                          {txn.items && txn.items.length > 0 ? (
                            <div className="space-y-1">
                              {txn.items.slice(0, 2).map((item: ITransactionItem, idx: number) => (
                                <p key={idx} className="text-sm text-gray-700 truncate">
                                  {item.productName} x{item.quantity}
                                </p>
                              ))}
                              {txn.items.length > 2 && (
                                <p className="text-xs text-gray-400">+{txn.items.length - 2} 更多</p>
                              )}
                            </div>
                          ) : (
                            <span className="text-gray-400">--</span>
                          )}
                        </div>
                      </td>
                      <td className="py-3 px-4 text-right font-medium text-gray-900">
                        {formatCurrency(txn.totalAmount)}
                      </td>
                      <td className={`py-3 px-4 text-right font-medium ${profit >= 0 ? 'text-success' : 'text-danger'}`}>
                        {formatCurrency(profit)}
                      </td>
                      <td className="py-3 px-4">
                        <div className={`flex items-center gap-1 ${payment.color}`}>
                          <PaymentIcon className="w-3.5 h-3.5" />
                          <span className="text-sm">{payment.label}</span>
                        </div>
                      </td>
                      <td className="py-3 px-4 text-sm text-gray-600">
                        {txn.customerId ? (
                          <span className="font-mono text-xs">{txn.customerId}</span>
                        ) : (
                          <span className="text-gray-400">散客</span>
                        )}
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-2">
          <button
            onClick={() => setPage(p => Math.max(1, p - 1))}
            disabled={page === 1}
            className="px-3 py-1 border border-gray-200 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
          >
            上一页
          </button>
          <span className="px-4 py-1 text-sm text-gray-600">
            第 {page} / {totalPages} 页
          </span>
          <button
            onClick={() => setPage(p => Math.min(totalPages, p + 1))}
            disabled={page === totalPages}
            className="px-3 py-1 border border-gray-200 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
          >
            下一页
          </button>
        </div>
      )}
    </div>
  )
}
