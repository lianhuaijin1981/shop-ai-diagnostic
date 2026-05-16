import { useState } from 'react'
import { User, Bell, Shield, Database, Palette } from 'lucide-react'

const tabs = [
  { id: 'profile', label: '个人信息', icon: User },
  { id: 'notifications', label: '通知设置', icon: Bell },
  { id: 'security', label: '安全设置', icon: Shield },
  { id: 'data', label: '数据管理', icon: Database },
  { id: 'appearance', label: '外观设置', icon: Palette },
]

export function Settings() {
  const [activeTab, setActiveTab] = useState('profile')

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Page Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">系统设置</h1>
        <p className="text-sm text-gray-500 mt-1">
          管理账户信息与系统偏好
        </p>
      </div>

      <div className="flex gap-6">
        {/* Sidebar */}
        <div className="w-48 space-y-1">
          {tabs.map((tab) => {
            const Icon = tab.icon
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-lg text-left transition-colors ${
                  activeTab === tab.id
                    ? 'bg-primary-50 text-primary-600'
                    : 'text-gray-600 hover:bg-gray-100'
                }`}
              >
                <Icon className="w-4 h-4" />
                <span className="text-sm font-medium">{tab.label}</span>
              </button>
            )
          })}
        </div>

        {/* Content */}
        <div className="flex-1 bg-white rounded-xl p-6 shadow-card">
          {activeTab === 'profile' && (
            <div className="space-y-6">
              <h2 className="text-lg font-semibold text-gray-900">个人信息</h2>
              <div className="grid grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">用户名</label>
                  <input
                    type="text"
                    defaultValue="admin"
                    className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">手机号</label>
                  <input
                    type="text"
                    defaultValue="138****8888"
                    className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">邮箱</label>
                  <input
                    type="email"
                    defaultValue="admin@example.com"
                    className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">门店</label>
                  <input
                    type="text"
                    defaultValue="示范店001"
                    disabled
                    className="w-full px-4 py-2 border border-gray-200 rounded-lg bg-gray-50"
                  />
                </div>
              </div>
              <div className="flex justify-end">
                <button className="px-6 py-2 bg-primary-500 text-white rounded-lg hover:bg-primary-600">
                  保存修改
                </button>
              </div>
            </div>
          )}

          {activeTab === 'notifications' && (
            <div className="space-y-6">
              <h2 className="text-lg font-semibold text-gray-900">通知设置</h2>
              <div className="space-y-4">
                {[
                  { label: '危险预警通知', description: '当出现危险级别预警时发送通知', enabled: true },
                  { label: '警告预警通知', description: '当出现警告级别预警时发送通知', enabled: true },
                  { label: '任务到期提醒', description: '任务截止前1天发送提醒', enabled: true },
                  { label: '日报推送', description: '每日发送经营日报', enabled: false },
                ].map((item, index) => (
                  <div key={index} className="flex items-center justify-between p-4 rounded-lg bg-gray-50">
                    <div>
                      <p className="font-medium text-gray-900">{item.label}</p>
                      <p className="text-sm text-gray-500">{item.description}</p>
                    </div>
                    <button
                      className={`w-12 h-6 rounded-full transition-colors ${
                        item.enabled ? 'bg-primary-500' : 'bg-gray-300'
                      }`}
                    >
                      <div
                        className={`w-5 h-5 bg-white rounded-full shadow transition-transform ${
                          item.enabled ? 'translate-x-6' : 'translate-x-0.5'
                        }`}
                      />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === 'security' && (
            <div className="space-y-6">
              <h2 className="text-lg font-semibold text-gray-900">安全设置</h2>
              <div className="space-y-4">
                <div className="p-4 rounded-lg border border-gray-200">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium text-gray-900">修改密码</p>
                      <p className="text-sm text-gray-500">上次修改于30天前</p>
                    </div>
                    <button className="px-4 py-2 border border-gray-200 rounded-lg hover:bg-gray-50">
                      修改
                    </button>
                  </div>
                </div>
                <div className="p-4 rounded-lg border border-gray-200">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium text-gray-900">两步验证</p>
                      <p className="text-sm text-gray-500">增强账户安全</p>
                    </div>
                    <button className="px-4 py-2 border border-gray-200 rounded-lg hover:bg-gray-50">
                      启用
                    </button>
                  </div>
                </div>
                <div className="p-4 rounded-lg border border-gray-200">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium text-gray-900">登录日志</p>
                      <p className="text-sm text-gray-500">查看最近的登录记录</p>
                    </div>
                    <button className="px-4 py-2 border border-gray-200 rounded-lg hover:bg-gray-50">
                      查看
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'data' && (
            <div className="space-y-6">
              <h2 className="text-lg font-semibold text-gray-900">数据管理</h2>
              <div className="space-y-4">
                <div className="p-4 rounded-lg border border-gray-200">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium text-gray-900">数据备份</p>
                      <p className="text-sm text-gray-500">手动备份当前数据</p>
                    </div>
                    <button className="px-4 py-2 bg-primary-500 text-white rounded-lg hover:bg-primary-600">
                      立即备份
                    </button>
                  </div>
                </div>
                <div className="p-4 rounded-lg border border-gray-200">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium text-gray-900">数据导出</p>
                      <p className="text-sm text-gray-500">导出经营数据为Excel格式</p>
                    </div>
                    <button className="px-4 py-2 border border-gray-200 rounded-lg hover:bg-gray-50">
                      导出
                    </button>
                  </div>
                </div>
                <div className="p-4 rounded-lg border border-danger/20 bg-danger/5">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium text-danger">清除缓存</p>
                      <p className="text-sm text-gray-500">清除本地缓存数据</p>
                    </div>
                    <button className="px-4 py-2 border border-danger text-danger rounded-lg hover:bg-danger/10">
                      清除
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'appearance' && (
            <div className="space-y-6">
              <h2 className="text-lg font-semibold text-gray-900">外观设置</h2>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-3">主题</label>
                  <div className="flex gap-4">
                    {[
                      { id: 'light', label: '浅色', color: 'bg-white' },
                      { id: 'dark', label: '深色', color: 'bg-gray-800' },
                      { id: 'auto', label: '跟随系统', color: 'bg-gradient-to-r from-white to-gray-800' },
                    ].map((theme) => (
                      <label
                        key={theme.id}
                        className="flex flex-col items-center gap-2 cursor-pointer"
                      >
                        <div
                          className={`w-16 h-12 rounded-lg border-2 ${
                            theme.id === 'light' ? 'border-primary-500' : 'border-gray-200'
                          } ${theme.color}`}
                        />
                        <span className="text-sm text-gray-600">{theme.label}</span>
                      </label>
                    ))}
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-3">主题色</label>
                  <div className="flex gap-3">
                    {['#0ea5e9', '#22c55e', '#f59e0b', '#ef4444', '#8b5cf6'].map((color) => (
                      <button
                        key={color}
                        className="w-8 h-8 rounded-full border-2 transition-transform hover:scale-110"
                        style={{
                          backgroundColor: color,
                          borderColor: color === '#0ea5e9' ? '#0ea5e9' : 'transparent',
                          outline: color === '#0ea5e9' ? `2px solid ${color}` : 'none',
                          outlineOffset: '2px',
                        }}
                      />
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
