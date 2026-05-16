import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { customerApi } from '@/api/http'
import { useShopStore } from '@/stores'
import { Search, Filter, Plus, MoreHorizontal, Trash2, User, Phone, TrendingUp, Award, Tag, X } from 'lucide-react'
import { useState } from 'react'
import type { ICustomer } from '@/types'

const levelConfig = {
  normal: { label: '普通', color: 'bg-gray-100 text-gray-600' },
  silver: { label: '白银', color: 'bg-gray-200 text-gray-700' },
  gold: { label: '黄金', color: 'bg-yellow-100 text-yellow-700' },
  platinum: { label: '白金', color: 'bg-purple-100 text-purple-700' },
}

export function Customers() {
  const { currentShop } = useShopStore()
  const queryClient = useQueryClient()
  const [searchQuery, setSearchQuery] = useState('')
  const [filterLevel, setFilterLevel] = useState<string | null>(null)
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [createForm, setCreateForm] = useState({
    name: '',
    phone: '',
    level: 'normal' as ICustomer['level'],
  })

  // 获取客户列表
  const { data: customersData, isLoading } = useQuery({
    queryKey: ['customers', currentShop.id, filterLevel, searchQuery],
    queryFn: () => customerApi.getList(currentShop.id),
    enabled: !!currentShop.id,
  })

  // 删除客户
  const deleteMutation = useMutation({
    mutationFn: (id: string) => customerApi.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['customers'] })
    },
  })

  // 创建客户
  const createMutation = useMutation({
    mutationFn: (data: Partial<ICustomer>) => customerApi.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['customers'] })
      setShowCreateModal(false)
      setCreateForm({ name: '', phone: '', level: 'normal' })
    },
  })

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault()
    if (!createForm.name.trim() || !createForm.phone.trim()) return
    createMutation.mutate({
      ...createForm,
      shopId: currentShop.id,
      totalAmount: 0,
      visitCount: 0,
      lastVisitAt: new Date().toISOString(),
      tags: [],
    })
  }

  const handleDelete = (id: string) => {
    if (confirm('确定要删除此客户吗？')) {
      deleteMutation.mutate(id)
    }
  }

  // 筛选和搜索
  const allCustomers = customersData?.data || []
  const filteredCustomers = allCustomers.filter(c => {
    if (filterLevel && c.level !== filterLevel) return false
    if (searchQuery && !c.name.includes(searchQuery) && !c.phone.includes(searchQuery)) return false
    return true
  })

  // 统计
  const levelCounts = allCustomers.reduce((acc, c) => {
    acc[c.level] = (acc[c.level] || 0) + 1
    return acc
  }, {} as Record<string, number>)

  const formatCurrency = (amount: number) => {
    return `¥${amount.toLocaleString('zh-CN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
  }

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('zh-CN', { month: 'short', day: 'numeric' })
  }

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">客户管理</h1>
          <p className="text-sm text-gray-500 mt-1">
            共 {allCustomers.length} 位客户
          </p>
        </div>
        <button
          onClick={() => setShowCreateModal(true)}
          className="flex items-center gap-2 px-4 py-2 bg-primary-500 text-white rounded-lg hover:bg-primary-600 transition-colors"
        >
          <Plus className="w-4 h-4" />
          新增客户
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-4 gap-4">
        <div className="p-4 rounded-lg border-2 border-gray-200 bg-white">
          <p className="text-sm text-gray-500">全部客户</p>
          <p className="text-2xl font-bold text-gray-900">{allCustomers.length}</p>
        </div>
        {Object.entries(levelConfig).map(([level, config]) => (
          <div
            key={level}
            className={`p-4 rounded-lg border-2 cursor-pointer transition-colors ${
              filterLevel === level ? 'border-primary-500 bg-primary-50' : 'border-gray-200 bg-white'
            }`}
            onClick={() => setFilterLevel(filterLevel === level ? null : level)}
          >
            <div className="flex items-center gap-2">
              <Award className={`w-4 h-4 ${config.color.split(' ')[1]}`} />
              <p className="text-sm text-gray-500">{config.label}</p>
            </div>
            <p className="text-2xl font-bold text-gray-900 mt-1">{levelCounts[level] || 0}</p>
          </div>
        ))}
      </div>

      {/* Search */}
      <div className="flex items-center gap-4">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            placeholder="搜索客户姓名或手机号..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
          />
        </div>
      </div>

      {/* Customer List */}
      <div className="bg-white rounded-xl shadow-card overflow-hidden">
        {isLoading ? (
          <div className="text-center py-12 text-gray-500">加载中...</div>
        ) : filteredCustomers.length === 0 ? (
          <div className="text-center py-12">
            <User className="w-12 h-12 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-500">暂无客户数据</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-100 bg-gray-50">
                  <th className="text-left py-3 px-4 text-gray-500 font-medium">客户</th>
                  <th className="text-left py-3 px-4 text-gray-500 font-medium">手机号</th>
                  <th className="text-left py-3 px-4 text-gray-500 font-medium">等级</th>
                  <th className="text-right py-3 px-4 text-gray-500 font-medium">累计消费</th>
                  <th className="text-right py-3 px-4 text-gray-500 font-medium">到店次数</th>
                  <th className="text-left py-3 px-4 text-gray-500 font-medium">最近到店</th>
                  <th className="text-right py-3 px-4 text-gray-500 font-medium">操作</th>
                </tr>
              </thead>
              <tbody>
                {filteredCustomers.map((customer) => {
                  const level = levelConfig[customer.level] || levelConfig.normal
                  return (
                    <tr key={customer.id} className="border-b border-gray-50 hover:bg-gray-50 transition-colors">
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full bg-primary-100 text-primary-600 flex items-center justify-center text-sm font-medium">
                            {customer.name.charAt(0)}
                          </div>
                          <span className="font-medium text-gray-900">{customer.name}</span>
                        </div>
                      </td>
                      <td className="py-3 px-4 text-gray-600">
                        <div className="flex items-center gap-1">
                          <Phone className="w-3.5 h-3.5" />
                          {customer.phone}
                        </div>
                      </td>
                      <td className="py-3 px-4">
                        <span className={`px-2 py-0.5 rounded text-xs font-medium ${level.color}`}>
                          {level.label}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-right text-gray-900 font-medium">
                        {formatCurrency(customer.totalAmount)}
                      </td>
                      <td className="py-3 px-4 text-right text-gray-600">
                        {customer.visitCount} 次
                      </td>
                      <td className="py-3 px-4 text-gray-500">
                        {formatDate(customer.lastVisitAt)}
                      </td>
                      <td className="py-3 px-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <button className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg">
                            <MoreHorizontal className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleDelete(customer.id)}
                            className="p-2 text-gray-400 hover:text-danger hover:bg-danger/10 rounded-lg"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* 创建客户弹窗 */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md mx-4 overflow-hidden">
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
              <h3 className="text-lg font-semibold text-gray-900">新增客户</h3>
              <button
                onClick={() => setShowCreateModal(false)}
                className="p-1 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={handleCreate} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                  客户姓名 <span className="text-danger">*</span>
                </label>
                <input
                  type="text"
                  value={createForm.name}
                  onChange={(e) => setCreateForm(f => ({ ...f, name: e.target.value }))}
                  placeholder="请输入客户姓名"
                  className="w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                  手机号 <span className="text-danger">*</span>
                </label>
                <input
                  type="tel"
                  value={createForm.phone}
                  onChange={(e) => setCreateForm(f => ({ ...f, phone: e.target.value }))}
                  placeholder="请输入手机号"
                  className="w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">客户等级</label>
                <select
                  value={createForm.level}
                  onChange={(e) => setCreateForm(f => ({ ...f, level: e.target.value as ICustomer['level'] }))}
                  className="w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                >
                  <option value="normal">普通</option>
                  <option value="silver">白银</option>
                  <option value="gold">黄金</option>
                  <option value="platinum">白金</option>
                </select>
              </div>
              <div className="flex items-center justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="px-5 py-2.5 border border-gray-200 text-gray-600 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  取消
                </button>
                <button
                  type="submit"
                  disabled={createMutation.isPending}
                  className="flex items-center gap-2 px-5 py-2.5 bg-primary-500 text-white rounded-lg hover:bg-primary-600 transition-colors disabled:opacity-50"
                >
                  {createMutation.isPending ? '创建中...' : '创建客户'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
