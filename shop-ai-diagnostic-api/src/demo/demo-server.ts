/**
 * 演示服务器 - 轻量级Mock API Server
 * 用于在没有MongoDB/Redis的情况下演示前端功能
 */
import express, { Request, Response, NextFunction } from 'express';
import cors from 'cors';
import { generateMockShops, generateMockDashboardStats, generateMockAlerts, generateMockTasks, generateMockReport, generateMockTransactions, generateMockCustomers, generateMockFiveDimension, generateMockCustomerFlowAnalysis, generateMockConversionAnalysis, generateMockAvgAmountAnalysis, generateMockRepurchaseAnalysis, generateMockProfitAnalysis, generateMockDashboard7Categories, generateMockMultiStoreSummary, generateMockProductStructureDiag, generateMockSalesVelocityDiag, generateMockInventoryRiskDiag, generateMockOperationSolution } from './demo-data';

const app = express();
const PORT = 8080;

// 中间件
app.use(cors({ origin: ['http://localhost:3000', 'http://localhost:3003', 'http://127.0.0.1:3000', 'http://127.0.0.1:3003'] }));
app.use(express.json());

// 日志中间件
app.use((req: Request, _res: Response, next: NextFunction) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.path}`);
  next();
});

// ==================== 认证相关 ====================

// 登录
app.post('/api/auth/login', (req: Request, res: Response) => {
  const { username, password } = req.body;
  if (username && password) {
    res.json({
      code: 200,
      message: '登录成功',
      data: {
        token: 'demo-jwt-token-' + Date.now(),
        user: {
          id: 'user_1',
          username: username,
          name: '演示用户',
          role: 'admin',
        },
      },
    });
  } else {
    res.status(401).json({ code: 401, message: '用户名或密码错误' });
  }
});

// 注册
app.post('/api/auth/register', (req: Request, res: Response) => {
  const { username, password, name } = req.body;
  res.json({
    code: 200,
    message: '注册成功',
    data: {
      id: 'user_' + Date.now(),
      username,
      name: name || username,
      role: 'user',
    },
  });
});

const mockUser = {
  id: 'user_1',
  username: 'admin',
  name: '演示管理员',
  role: 'admin',
};

// 当前用户（兼容两种路径）
app.get('/api/auth/me', (_req: Request, res: Response) => {
  res.json({ code: 200, data: mockUser, message: 'success' });
});

app.get('/api/auth/profile', (_req: Request, res: Response) => {
  res.json({ code: 200, data: mockUser, message: 'success' });
});

// ==================== 门店相关 ====================

let mockShops = generateMockShops(5);

// 获取门店列表
app.get('/api/shops', (_req: Request, res: Response) => {
  res.json({ code: 200, data: mockShops, total: mockShops.length });
});

// 获取单个门店
app.get('/api/shops/:id', (req: Request, res: Response) => {
  const shop = mockShops.find((s) => s._id === req.params.id || s.code === req.params.id);
  if (shop) {
    res.json({ code: 200, data: shop });
  } else {
    res.status(404).json({ code: 404, message: '门店不存在' });
  }
});

// 创建门店
app.post('/api/shops', (req: Request, res: Response) => {
  const newShop = {
    _id: 'shop_' + Date.now(),
    ...req.body,
    status: 'active',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
  mockShops.push(newShop);
  res.json({ code: 200, message: '创建成功', data: newShop });
});

// 更新门店
app.put('/api/shops/:id', (req: Request, res: Response) => {
  const index = mockShops.findIndex((s) => s._id === req.params.id);
  if (index !== -1) {
    mockShops[index] = { ...mockShops[index], ...req.body, updatedAt: new Date().toISOString() };
    res.json({ code: 200, message: '更新成功', data: mockShops[index] });
  } else {
    res.status(404).json({ code: 404, message: '门店不存在' });
  }
});

// ==================== 仪表盘相关 ====================

// 获取统计数据
app.get('/api/dashboard/stats', (req: Request, res: Response) => {
  const shopId = (req.query.shopId as string) || mockShops[0]?._id || 'shop_1';
  res.json({ code: 200, data: generateMockDashboardStats(shopId) });
});

// 趋势数据
app.get('/api/dashboard/trends', (req: Request, res: Response) => {
  const days = parseInt(req.query.days as string) || 7;
  const trends = Array.from({ length: days }, (_, i) => {
    const d = new Date();
    d.setDate(d.getDate() - (days - 1 - i));
    return {
      date: d.toISOString().slice(0, 10),
      sales: Math.round((Math.random() * 50000 + 10000) * 100) / 100,
      transactions: Math.floor(Math.random() * 200 + 30),
      customers: Math.floor(Math.random() * 300 + 50),
      profit: Math.round((Math.random() * 20000 + 5000) * 100) / 100,
    };
  });
  res.json({ code: 200, data: trends });
});

// 排行榜
app.get('/api/dashboard/rankings', (_req: Request, res: Response) => {
  res.json({
    code: 200,
    data: {
      topProducts: [
        { name: '明星套餐A', sales: 523, revenue: 26150 },
        { name: '明星套餐B', sales: 412, revenue: 20600 },
        { name: '明星套餐C', sales: 356, revenue: 17800 },
        { name: '明星套餐D', sales: 298, revenue: 14900 },
        { name: '明星套餐E', sales: 245, revenue: 12250 },
      ],
      topCustomers: mockShops.slice(0, 3).map((s) => ({
        name: s.name,
        revenue: Math.floor(Math.random() * 50000 + 10000),
        visits: Math.floor(Math.random() * 50 + 10),
      })),
    },
  });
});

// ==================== 交易记录 ====================

app.get('/api/transactions', (req: Request, res: Response) => {
  const shopId = (req.query.shopId as string) || mockShops[0]?._id || 'shop_1';
  const page = parseInt(req.query.page as string) || 1;
  const pageSize = parseInt(req.query.pageSize as string) || 20;
  const transactions = generateMockTransactions(shopId, 100);
  const start = (page - 1) * pageSize;
  const list = transactions.slice(start, start + pageSize);
  res.json({
    code: 200,
    data: {
      list,
      total: transactions.length,
      page,
      pageSize,
      totalPages: Math.ceil(transactions.length / pageSize),
    },
    message: 'success',
  });
});

// ==================== 客户管理 ====================

app.get('/api/customers', (req: Request, res: Response) => {
  const shopId = (req.query.shopId as string) || mockShops[0]?._id || 'shop_1';
  const customers = generateMockCustomers(shopId, 50);
  res.json({ code: 200, data: customers, total: customers.length });
});

// ==================== 告警管理 ====================

let mockAlerts = generateMockAlerts(mockShops[0]?._id || 'shop_1', 15);

// 获取告警列表
app.get('/api/diagnostic/alerts', (req: Request, res: Response) => {
  const { status, dimension, page = 1, pageSize = 20 } = req.query;
  let filtered = mockAlerts;
  if (status) filtered = filtered.filter((a) => a.status === status);
  if (dimension) filtered = filtered.filter((a) => a.dimension === dimension);
  res.json({
    code: 200,
    data: {
      list: filtered,
      total: filtered.length,
      page: Number(page),
      pageSize: Number(pageSize),
      totalPages: Math.ceil(filtered.length / Number(pageSize)),
    },
    message: 'success',
  });
});

// 处理告警
app.post('/api/diagnostic/alerts/:id/process', (req: Request, res: Response) => {
  const alert = mockAlerts.find((a) => a.id === req.params.id);
  if (alert) {
    alert.status = 'processing';
    alert.processedAt = new Date().toISOString();
    res.json({ code: 200, message: '已标记处理中', data: alert });
  } else {
    res.status(404).json({ code: 404, message: '告警不存在' });
  }
});

// 解决告警
app.post('/api/diagnostic/alerts/:id/resolve', (req: Request, res: Response) => {
  const alert = mockAlerts.find((a) => a.id === req.params.id);
  if (alert) {
    alert.status = 'resolved';
    alert.resolvedAt = new Date().toISOString();
    res.json({ code: 200, message: '已标记解决', data: alert });
  } else {
    res.status(404).json({ code: 404, message: '告警不存在' });
  }
});

// ==================== 任务管理 ====================

let mockTasks = generateMockTasks(mockShops[0]?._id || 'shop_1', 10);

// 获取任务列表
app.get('/api/tasks', (req: Request, res: Response) => {
  const { status, priority } = req.query;
  let filtered = mockTasks;
  if (status) filtered = filtered.filter((t) => t.status === status);
  if (priority) filtered = filtered.filter((t) => t.priority === priority);
  res.json({
    code: 200,
    data: {
      list: filtered,
      total: filtered.length,
      page: 1,
      pageSize: filtered.length,
      totalPages: 1,
    },
    message: 'success',
  });
});

// 创建任务
app.post('/api/tasks', (req: Request, res: Response) => {
  const newTask = {
    id: 'task_' + Date.now(),
    shopId: mockShops[0]?._id || 'shop_1',
    ...req.body,
    status: 'pending',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
  mockTasks.push(newTask);
  res.json({ code: 200, message: '创建成功', data: newTask });
});

// 更新任务状态
app.patch('/api/tasks/:id', (req: Request, res: Response) => {
  const task = mockTasks.find((t) => t.id === req.params.id);
  if (task) {
    Object.assign(task, req.body, { updatedAt: new Date().toISOString() });
    res.json({ code: 200, message: '更新成功', data: task });
  } else {
    res.status(404).json({ code: 404, message: '任务不存在' });
  }
});

// 删除任务
app.delete('/api/tasks/:id', (req: Request, res: Response) => {
  const index = mockTasks.findIndex((t) => t.id === req.params.id);
  if (index !== -1) {
    mockTasks.splice(index, 1);
    res.json({ code: 200, message: '删除成功' });
  } else {
    res.status(404).json({ code: 404, message: '任务不存在' });
  }
});

// ==================== 五维诊断 ====================

app.get('/api/diagnostic/five-dimension', (req: Request, res: Response) => {
  const shopId = (req.query.shopId as string) || mockShops[0]?._id || 'shop_1';
  const period = (req.query.period as string) || 'week';
  const result = generateMockFiveDimension(shopId, period);
  res.json({ code: 200, data: result });
});

// 诊断趋势
app.get('/api/diagnostic/trends', (req: Request, res: Response) => {
  const shopId = (req.query.shopId as string) || mockShops[0]?._id || 'shop_1';
  const startDate = (req.query.startDate as string) || new Date(Date.now() - 7 * 86400000).toISOString().slice(0, 10);
  const endDate = (req.query.endDate as string) || new Date().toISOString().slice(0, 10);
  const days = Math.max(1, Math.ceil((new Date(endDate).getTime() - new Date(startDate).getTime()) / 86400000) + 1);
  const trends = Array.from({ length: days }, (_, i) => {
    const d = new Date(new Date(startDate).getTime() + i * 86400000);
    return {
      date: d.toISOString().slice(0, 10),
      customerFlow: Math.floor(Math.random() * 80 + 20),
      conversion: Math.round((Math.random() * 30 + 10) * 10) / 10,
      avgAmount: Math.round((Math.random() * 100 + 100) * 100) / 100,
      repurchase: Math.round((Math.random() * 40 + 10) * 10) / 10,
      profit: Math.round((Math.random() * 30 + 10) * 10) / 10,
    };
  });
  res.json({ code: 200, data: trends });
});

// ==================== 报告生成 ====================

app.get('/api/reports', (req: Request, res: Response) => {
  const shopId = (req.query.shopId as string) || mockShops[0]?._id || 'shop_1';
  res.json({ code: 200, data: [generateMockReport(shopId)], message: 'success' });
});

app.post('/api/reports/generate', (req: Request, res: Response) => {
  const shopId = req.body.shopId || mockShops[0]?._id || 'shop_1';
  res.json({ code: 200, message: '报告生成中...', data: generateMockReport(shopId) });
});

// ==================== 任务完成（补充前端调用的端点） ====================

app.post('/api/tasks/:id/complete', (req: Request, res: Response) => {
  const task = mockTasks.find((t) => t.id === req.params.id);
  if (task) {
    task.status = 'completed';
    (task as any).completedAt = new Date().toISOString();
    res.json({ code: 200, message: '任务已完成', data: task });
  } else {
    res.status(404).json({ code: 404, message: '任务不存在' });
  }
});

// ==================== 货品诊断 ====================

app.get('/api/product-diagnostic', (req: Request, res: Response) => {
  const shopId = (req.query.shopId as string) || mockShops[0]?._id || 'shop_1';
  const period = (req.query.period as string) || 'week';
  const fastMoving = Array.from({ length: 5 }, (_, i) => ({
    productId: `prod_fast_${i + 1}`,
    productName: ['明星套餐A', '招牌奶茶', '经典咖啡', '网红蛋糕', '限定周边'][i],
    category: ['饮品', '甜品', '主食', '周边', '套餐'][i],
    salesAmount: Math.round((Math.random() * 20000 + 5000) * 100) / 100,
    salesCount: Math.floor(Math.random() * 500 + 100),
    profit: Math.round((Math.random() * 8000 + 2000) * 100) / 100,
    rank: i + 1,
  }));
  const slowMoving = Array.from({ length: 5 }, (_, i) => ({
    productId: `prod_slow_${i + 1}`,
    productName: ['季节限定', '试验新品', '老款周边', '过季礼盒', '冷门搭配'][i],
    category: ['限量', '新品', '周边', '礼盒', '套餐'][i],
    salesAmount: Math.round((Math.random() * 2000 + 100) * 100) / 100,
    salesCount: Math.floor(Math.random() * 50 + 5),
    profit: Math.round((Math.random() * 500 + 50) * 100) / 100,
    rank: i + 1,
  }));
  const stockAlerts = Array.from({ length: 4 }, (_, i) => ({
    productId: `prod_stock_${i + 1}`,
    productName: ['原料A', '原料B', '包装材料', '季节性食材'][i],
    currentStock: Math.floor(Math.random() * 15 + 1),
    minStock: 20,
    alertLevel: (['low', 'critical', 'low', 'normal'] as const)[i],
    suggestedReorder: Math.floor(Math.random() * 50 + 30),
  }));
  const categoryAnalysis = [
    { category: '饮品', salesAmount: 45000, salesCount: 800, avgPrice: 56.25, profitRate: 0.35, salesRatio: 0.45 },
    { category: '甜品', salesAmount: 28000, salesCount: 400, avgPrice: 70, profitRate: 0.42, salesRatio: 0.28 },
    { category: '主食', salesAmount: 18000, salesCount: 300, avgPrice: 60, profitRate: 0.3, salesRatio: 0.18 },
    { category: '周边', salesAmount: 9000, salesCount: 150, avgPrice: 60, profitRate: 0.5, salesRatio: 0.09 },
  ];
  res.json({
    code: 200,
    data: {
      id: `pd_${Date.now()}`,
      shopId,
      period: { start: new Date(Date.now() - 7 * 86400000).toISOString(), end: new Date().toISOString() },
      fastMoving,
      slowMoving,
      stockAlerts,
      categoryAnalysis,
      createdAt: new Date().toISOString(),
    },
    message: 'success',
  });
});

app.get('/api/product-diagnostic/fast-moving', (req: Request, res: Response) => {
  const limit = parseInt(req.query.limit as string) || 10;
  const list = Array.from({ length: limit }, (_, i) => ({
    productId: `prod_fast_${i + 1}`,
    productName: ['明星套餐A', '招牌奶茶', '经典咖啡', '网红蛋糕', '限定周边', '人气联名', '爆款小食', '季节特饮', '限定礼盒', '热销组合'][i] || `热销商品${i + 1}`,
    category: ['饮品', '甜品', '主食', '周边', '套餐', '联名', '小食', '特饮', '礼盒', '组合'][i] || '其他',
    salesAmount: Math.round((Math.random() * 20000 + 5000) * 100) / 100,
    salesCount: Math.floor(Math.random() * 500 + 100),
    profit: Math.round((Math.random() * 8000 + 2000) * 100) / 100,
    rank: i + 1,
  }));
  res.json({ code: 200, data: list, message: 'success' });
});

app.get('/api/product-diagnostic/slow-moving', (req: Request, res: Response) => {
  const limit = parseInt(req.query.limit as string) || 10;
  const list = Array.from({ length: limit }, (_, i) => ({
    productId: `prod_slow_${i + 1}`,
    productName: ['季节限定', '试验新品', '老款周边', '过季礼盒', '冷门搭配', '积压库存', '旧版包装', '下架候选', '尾货清仓', '冷门原料'][i] || `滞销商品${i + 1}`,
    category: ['限量', '新品', '周边', '礼盒', '套餐', '库存', '包装', '候选', '尾货', '原料'][i] || '其他',
    salesAmount: Math.round((Math.random() * 2000 + 100) * 100) / 100,
    salesCount: Math.floor(Math.random() * 50 + 5),
    profit: Math.round((Math.random() * 500 + 50) * 100) / 100,
    rank: i + 1,
  }));
  res.json({ code: 200, data: list, message: 'success' });
});

app.get('/api/product-diagnostic/stock-alerts', (req: Request, res: Response) => {
  const shopId = (req.query.shopId as string) || mockShops[0]?._id || 'shop_1';
  const list = Array.from({ length: 5 }, (_, i) => ({
    productId: `prod_stock_${i + 1}`,
    productName: ['原料A', '原料B', '包装材料', '季节性食材', '易耗品'][i],
    currentStock: Math.floor(Math.random() * 15 + 1),
    minStock: 20,
    alertLevel: (['low', 'critical', 'low', 'normal', 'critical'] as const)[i],
    suggestedReorder: Math.floor(Math.random() * 50 + 30),
  }));
  res.json({ code: 200, data: list, message: 'success' });
});

// ==================== 深度诊断分析 ====================

// 客流深度分析
app.get('/api/diagnostic/deep/customer-flow', (req: Request, res: Response) => {
  const shopId = (req.query.shopId as string) || mockShops[0]?._id || 'shop_1';
  const period = (req.query.period as string) || 'week';
  const result = generateMockCustomerFlowAnalysis(shopId, period);
  res.json({ code: 200, data: result, message: 'success' });
});

// 转化深度分析
app.get('/api/diagnostic/deep/conversion', (req: Request, res: Response) => {
  const shopId = (req.query.shopId as string) || mockShops[0]?._id || 'shop_1';
  const period = (req.query.period as string) || 'week';
  const result = generateMockConversionAnalysis(shopId, period);
  res.json({ code: 200, data: result, message: 'success' });
});

// 客单价深度分析
app.get('/api/diagnostic/deep/avg-amount', (req: Request, res: Response) => {
  const shopId = (req.query.shopId as string) || mockShops[0]?._id || 'shop_1';
  const period = (req.query.period as string) || 'week';
  const result = generateMockAvgAmountAnalysis(shopId, period);
  res.json({ code: 200, data: result, message: 'success' });
});

// 复购深度分析
app.get('/api/diagnostic/deep/repurchase', (req: Request, res: Response) => {
  const shopId = (req.query.shopId as string) || mockShops[0]?._id || 'shop_1';
  const period = (req.query.period as string) || 'week';
  const result = generateMockRepurchaseAnalysis(shopId, period);
  res.json({ code: 200, data: result, message: 'success' });
});

// 利润深度分析
app.get('/api/diagnostic/deep/profit', (req: Request, res: Response) => {
  const shopId = (req.query.shopId as string) || mockShops[0]?._id || 'shop_1';
  const period = (req.query.period as string) || 'week';
  const result = generateMockProfitAnalysis(shopId, period);
  res.json({ code: 200, data: result, message: 'success' });
});

// ==================== 经营大盘7大类数据 ====================

// 经营大盘综合数据
app.get('/api/dashboard/comprehensive', (req: Request, res: Response) => {
  const shopId = (req.query.shopId as string) || mockShops[0]?._id || 'shop_1';
  const period = (req.query.period as string) || 'today';
  const result = generateMockDashboard7Categories(shopId, period as 'today' | 'yesterday' | 'week' | 'month');
  res.json({ code: 200, data: result, message: 'success' });
});

// 多门店汇总数据
app.get('/api/dashboard/multi-store-summary', (req: Request, res: Response) => {
  const shopIds = mockShops.map((s) => s._id);
  const period = (req.query.period as string) || 'today';
  const stores = generateMockMultiStoreSummary(shopIds, period as 'today' | 'yesterday' | 'week' | 'month');
  // 计算排名
  const sorted = [...stores].sort((a, b) => b.revenue - a.revenue);
  sorted.forEach((s, i) => { s.rank = i + 1; });
  const totalRevenue = stores.reduce((sum, s) => sum + s.revenue, 0);
  const totalProfit = stores.reduce((sum, s) => sum + s.profit, 0);
  const totalCustomers = stores.reduce((sum, s) => sum + s.customers, 0);
  const totalTransactions = stores.reduce((sum, s) => sum + s.transactions, 0);
  const avgAmount = totalRevenue / totalTransactions;
  const avgCustomerFlow = Math.round(totalCustomers / stores.length);
  res.json({
    code: 200,
    data: {
      stores: sorted,
      totalRevenue,
      totalProfit,
      totalCustomers,
      totalTransactions,
      avgAmount,
      avgCustomerFlow,
      storeCount: stores.length,
    },
    message: 'success',
  });
});

// ==================== 货品全链路智能诊断 ====================

// 3.3.1 货品结构诊断
app.get('/api/diagnostic/product-structure', (req: Request, res: Response) => {
  const shopId = (req.query.shopId as string) || mockShops[0]?._id || 'shop_1';
  const period = (req.query.period as string) || 'week';
  const result = generateMockProductStructureDiag(shopId, period);
  res.json({ code: 200, data: result, message: 'success' });
});

// 3.3.2 动销滞销智能判定
app.get('/api/diagnostic/sales-velocity', (req: Request, res: Response) => {
  const shopId = (req.query.shopId as string) || mockShops[0]?._id || 'shop_1';
  const period = (req.query.period as string) || 'week';
  const result = generateMockSalesVelocityDiag(shopId, period);
  res.json({ code: 200, data: result, message: 'success' });
});

// 3.3.3 库存风险诊断
app.get('/api/diagnostic/inventory-risk', (req: Request, res: Response) => {
  const shopId = (req.query.shopId as string) || mockShops[0]?._id || 'shop_1';
  const period = (req.query.period as string) || 'week';
  const result = generateMockInventoryRiskDiag(shopId, period);
  res.json({ code: 200, data: result, message: 'success' });
});

// 3.3.4 货品运营解决方案
app.get('/api/diagnostic/operation-solution', (req: Request, res: Response) => {
  const shopId = (req.query.shopId as string) || mockShops[0]?._id || 'shop_1';
  const result = generateMockOperationSolution(shopId);
  res.json({ code: 200, data: result, message: 'success' });
});

// ==================== 健康检查 ====================

app.get('/api/health', (_req: Request, res: Response) => {
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    mode: 'demo',
  });
});

// 启动服务器
app.listen(PORT, () => {
  console.log(`
╔═══════════════════════════════════════════════════════════════╗
║                                                               ║
║   🏪 门店AI诊断系统 - 演示服务器已启动                           ║
║                                                               ║
║   📡 监听端口: http://localhost:${PORT}                          ║
║   🌐 前端地址: http://localhost:3000                            ║
║                                                               ║
║   ⚠️  当前运行在演示模式，数据均为模拟数据                        ║
║                                                               ║
╚═══════════════════════════════════════════════════════════════╝
  `);
});

export default app;
