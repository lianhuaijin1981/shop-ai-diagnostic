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

// ==================== AI 方案生成（模拟大模型）====================

app.post('/api/ai/generate-plan', (req: Request, res: Response) => {
  const { dimension, title, description, priority } = req.body as {
    shopId: string
    dimension: string
    title: string
    description: string
    priority: string
  }

  // 模拟大模型生成延迟
  setTimeout(() => {
    const planTemplates: Record<string, {
      background: string
      targetGoal: string
      specificMeasures: string[]
      implementSteps: Array<{ step: number; action: string; timeline: string; owner: string }>
      expectedEffect: string
      riskWarning: string
      exitMechanism: string
      referenceCase: string
    }> = {
      customerFlow: {
        background: `门店当前自然客流不足，近期周同比下滑约12%。根据时段分析，早市（9-11点）和下午茶时段（14-16点）是明显低谷，对比行业基准存在明显差距。客流问题是当前制约门店业绩增长的首要瓶颈。`,
        targetGoal: '目标：4周内将门店日均客流量从当前基础提升15%-20%，其中引流活动客流占比从当前12%提升至25%',
        specificMeasures: [
          '启动线上+线下双渠道引流：抖音/小红书发布门店特色内容（服装穿搭/买家秀），引导到店转化',
          '设计「老客带新」裂变活动：老客带1名新客到店，双方各享9折优惠，老客累计积分加倍',
          '针对低谷时段（早10点前/下午14-16点）设置专属到店礼，引导错峰消费',
          '与周边写字楼/社区联动，定向派发福利卡，覆盖500米辐射范围内潜在客群',
          '优化门头陈列和橱窗展示，每周更换主题陈列，提升路人进店率',
        ],
        implementSteps: [
          { step: 1, action: '制作3条抖音/小红书种草短视频，发布门店穿搭内容，设置引导到店文案', timeline: '第1-2天', owner: '店长/运营' },
          { step: 2, action: '设计「老带新」活动规则及物料（海报、话术、核销码），培训店员引导推荐', timeline: '第2-3天', owner: '店长' },
          { step: 3, action: '低谷时段专属到店礼上线，收银系统配置相关核销规则', timeline: '第3-4天', owner: '收银/IT' },
          { step: 4, action: '周边商圈走访，拜访5-8家异业商户洽谈互推合作，确定联合方案', timeline: '第4-7天', owner: '店长' },
          { step: 5, action: '执行首周活动，每日统计引流来源（自然/老带新/线上/异业），复盘调整', timeline: '第7-28天', owner: '全员' },
        ],
        expectedEffect: '预计4周后日均客流提升15-20%，引流活动客流占比达25%，低谷时段进店人数提升30%+，月营收增量约8,000-15,000元',
        riskWarning: '① 抖音/小红书内容需避免过度营销感，以真实体验内容为主；② 老带新活动需设置每人每月1次上限，防止羊毛党；③ 异业合作需签订简单书面协议，明确各方权责',
        exitMechanism: '执行2周后评估：若引流成本超过新客首单利润的150%，或日均客流提升低于5%，则暂停该引流活动，改为集中资源到自然流量优化（门头/陈列）方向',
        referenceCase: '参考案例：某服装门店通过"老带新9折+短视频引流"组合，首月新客增加42%，老客复购率同步提升18%，整体营收提升23%，验证该策略对服装实体门店有效性高',
      },
      conversion: {
        background: `门店进店转化率当前约35%，低于同类型服装门店行业均值42%约7个百分点。进一步分析发现，主要流失节点在客户进店后前3分钟：店员未能及时接待/有效开场，导致约28%进店客户无互动直接离开。`,
        targetGoal: '目标：6周内将门店整体转化率从35%提升至42%，接近行业基准；员工有效开场率从当前65%提升至85%以上',
        specificMeasures: [
          '制定并培训标准接待SOP：进店10秒内完成问候→30秒内完成需求探询→1分钟内完成产品引导',
          '优化门店陈列动线：将爆款/高转化款移至入门右侧第一黄金区，降低客户选择困难',
          '设计「进店有礼」引导：进店扫码关注领取9折券，降低首次成交心理门槛',
          '对转化率排名靠后的店员开展1对1话术培训，针对"价格异议"和"款式犹豫"两大痛点专项演练',
          '每日收市后15分钟复盘转化率，由店长点评当日成功/未成功案例各1个',
        ],
        implementSteps: [
          { step: 1, action: '编写标准接待SOP手册（含话术示范视频），组织全员培训考核', timeline: '第1-3天', owner: '店长' },
          { step: 2, action: '现场调整陈列布局，爆款前置，清仓款移至内区，高毛利款陈列在主推位', timeline: '第2-3天', owner: '陈列负责人' },
          { step: 3, action: '上线「进店扫码礼」小程序活动，培训收银员核销流程', timeline: '第3-5天', owner: '店长/IT' },
          { step: 4, action: '开展转化率低于25%的店员1对1话术训练，每人30分钟模拟演练', timeline: '第4-7天', owner: '店长' },
          { step: 5, action: '建立每日转化率看板，每周周会对比各员工数据，激励先进、帮扶落后', timeline: '持续执行', owner: '店长' },
        ],
        expectedEffect: '预计6周后转化率从35%提升至42%，按当前日均进店100人估算，每日增加7单，月增营收约15,000-22,000元，投入产出比约1:8',
        riskWarning: '① 强制转化话术可能引发客户反感，需把握"服务感"而非"推销感"；② 陈列调整后需观察1周数据再决定是否继续优化；③ 员工考核压力不宜过大，避免流失人才',
        exitMechanism: '若4周后转化率未提升超过2个百分点，说明主要问题在货品匹配度（款式/价格不符合客群需求），应切换策略方向，优先进行货品结构调整',
        referenceCase: '参考案例：某连锁女装品牌通过接待SOP+陈列优化，3个月内单店转化率从31%提升至45%，营收增长38%，核心动作是将接待语从"随便看看"改为"您是找休闲风还是通勤风？"',
      },
      avgAmount: {
        background: `门店当前平均客单价约${Math.floor(180 + Math.random() * 80)}元，低于同类型服装门店行业均值约15%。连带销售率（每单平均件数）仅1.3件，远低于行业均值1.8件。客单提升空间巨大，且是成本最低的业绩增长路径。`,
        targetGoal: '目标：8周内将门店平均客单价提升20%，连带销售率从1.3件提升至1.7件，每日多贡献营收约1,200-2,000元',
        specificMeasures: [
          '培训"三步搭配法"：① 了解场合需求 → ② 推荐主打款 → ③ 自然搭配上/下/配件，实现1+1+1连带',
          '设计3档组合套餐：基础套餐（上衣+裤装）享9折、进阶套餐（上衣+下装+外套）享8.5折、全套搭（上下外套+配件）享8折',
          '陈列调整为"搭配式展示"：每套完整穿搭搭配模特陈列，旁边附上搭配说明牌和价格组合',
          '设置连带销售提成奖励：当日连带率超过1.8件的员工，额外奖励50元/天',
          '针对会员客户推送"专属搭配师服务"：预约到店享免费穿搭咨询，提升高价值客户客单',
        ],
        implementSteps: [
          { step: 1, action: '制作10套完整穿搭案例（含价格/组合搭配图），分发给所有店员背诵练习', timeline: '第1-2天', owner: '陈列/店长' },
          { step: 2, action: '重新设计陈列：将爆款设计为完整搭配展示，每套搭配附组合价格标签', timeline: '第2-4天', owner: '陈列负责人' },
          { step: 3, action: '配置套餐组合活动，收银系统录入3档套餐折扣规则', timeline: '第3-5天', owner: '店长/IT' },
          { step: 4, action: '开展连带话术培训，模拟演练"三步搭配法"，全员考核合格后上线', timeline: '第4-6天', owner: '店长' },
          { step: 5, action: '每日统计连带率，公布排名，周奖励兑现，激励机制落地', timeline: '持续执行', owner: '店长' },
        ],
        expectedEffect: '预计8周后平均客单价提升18-22%，连带销售率从1.3提升至1.7件，日均额外增加营收约1,500元，月增营收约45,000元',
        riskWarning: '① 套餐折扣设计需测算毛利率，确保最低套餐仍有35%以上毛利；② 连带销售不能过度强推，需以"需求匹配"为出发点；③ 员工连带率竞争可能导致抢单，需制定公平机制',
        exitMechanism: '若4周后连带率未从1.3提升超过0.2件，说明问题在货品搭配度而非话术，应优先调整上货结构，增加上下装/配件联动款比例',
        referenceCase: '参考案例：某快时尚品牌通过"三步搭配法"培训+搭配式陈列，3个月内连带率从1.2提升至1.9件，客单价提升42%，成为该品牌历史最佳季度业绩',
      },
      repurchase: {
        background: `门店当前30天复购率约28%，低于同业均值38%约10个百分点。重点问题是老客流失：沉睡会员（90天未消费）占比高达25%，且缺乏系统性的老客激活机制，会员复购完全依赖客户自然到店。`,
        targetGoal: '目标：12周内将30天复购率从28%提升至38%，激活沉睡会员300人以上，月会员消费贡献占比从42%提升至55%',
        specificMeasures: [
          '建立会员分层运营体系：VIP（月消费1000+）/ 活跃（30天内消费）/ 普通 / 沉睡，差异化维护策略',
          '设计"专属回访"机制：每周三店员主动联系未消费超30天的活跃会员，发送新品到货提醒',
          '批量激活沉睡会员：发送"X天未见，专属回归礼"短信+优惠券（满300减60），限7天有效',
          '推出储值锁客活动：储值500享95折、储值1000享9折、储值3000享85折，搭配专属权益',
          '创建私域社群（微信群）：定期分享穿搭内容+新品资讯，形成粘性，重要节点发放群专属福利',
        ],
        implementSteps: [
          { step: 1, action: '导出沉睡会员名单，按消费金额分级，制作差异化短信模板，批量发送激活券', timeline: '第1-2天', owner: '店长/运营' },
          { step: 2, action: '建立微信私域群，邀请近6个月消费会员入群，发布群规和欢迎礼', timeline: '第2-5天', owner: '店员分工' },
          { step: 3, action: '上线储值活动，培训收银员储值推荐话术，目标每天成交2-3单储值', timeline: '第3-5天', owner: '店长/IT' },
          { step: 4, action: '制定会员回访工作表，分配给各店员，每周三统一回访，记录反馈', timeline: '每周执行', owner: '全员' },
          { step: 5, action: '每月统计会员复购率、激活率、储值金额，月度会员专项复盘会', timeline: '每月底', owner: '店长' },
        ],
        expectedEffect: '预计12周后30天复购率从28%提升至36%-38%，激活沉睡会员300人+，储值收入增加约20,000-35,000元，月会员贡献营收提升约30,000元',
        riskWarning: '① 短信激活需注意频率，同一客户1个月内不超过2次触达，避免反感；② 私域群运营需持续投入内容，切忌变成纯广告群；③ 储值活动需在合规范围内，不得承诺超出商品价值的权益',
        exitMechanism: '若激活短信发出后7天转化率低于3%，说明沉睡原因在于货品款式陈旧不匹配，应首先推进换季上新，再配合激活动作，单纯优惠券效果有限',
        referenceCase: '参考案例：某女装门店通过"沉睡会员激活+私域群运营"组合，3个月内激活沉睡客750人，其中38%在3个月内产生了复购，会员月消费贡献提升至62%',
      },
      profit: {
        background: `门店当前毛利率约42%，净利率约18%，均低于行业优质水平（毛利率50%+、净利率25%+）。主要原因：① 折扣活动过频导致有效客单毛利被稀释；② 部分滞销品类（外套/配件）占用大量资金但周转极慢；③ 损耗和隐性成本控制不足。`,
        targetGoal: '目标：3个月内将净利率从18%提升至24%以上，毛利率从42%提升至48%，每月额外净利润增加约12,000-20,000元',
        specificMeasures: [
          '立即停止"全场8折"等无差别折扣活动，改为精准针对滞销款的定向清仓活动',
          '对利润率低于20%的品类进行清仓处理，释放库存资金，优先补充高毛利爆款',
          '重新梳理成本结构：对各品类毛利率进行核算，将"利润款"（毛利率55%+）的陈列面积扩大30%',
          '建立损耗管控制度：每日盘点，设置损耗KPI，月损耗率超过1.5%则触发追责',
          '引入联营模式处理压货：与上游供应商协商部分货品寄售，降低库存积压风险',
        ],
        implementSteps: [
          { step: 1, action: '全面梳理SKU毛利率，标注高/中/低利润款，确定清仓优先级名单（20款）', timeline: '第1-2天', owner: '店长/采购' },
          { step: 2, action: '对低利润滞销款启动清仓活动（买一送一/附赠小礼品），2周内清场', timeline: '第3-14天', owner: '店长' },
          { step: 3, action: '用清仓回款优先补货高毛利爆款，调整进货结构，高利润款占比提升至60%', timeline: '第7-21天', owner: '采购' },
          { step: 4, action: '与供应商重新谈判账期/联营条款，部分压货转为寄售模式减轻库存压力', timeline: '第14-30天', owner: '店长/老板' },
          { step: 5, action: '建立月度利润复盘机制，每月核算各品类贡献利润，动态调整货品结构', timeline: '每月执行', owner: '店长/财务' },
        ],
        expectedEffect: '预计3个月后毛利率从42%提升至47%-48%，净利率从18%提升至22%-24%，月净利润增量约15,000-25,000元，全年额外净利润约180,000-300,000元',
        riskWarning: '① 清仓活动需控制折扣幅度，避免低于成本价销售影响品牌调性；② 减少折扣活动初期可能短期客流下降，需有心理准备；③ 与供应商谈判寄售需做好合同约定，避免纠纷',
        exitMechanism: '若执行2个月后毛利率提升不足3个百分点，说明主要问题在于客单价/连带率不足（低基数），需优先提升客单，而非单纯控制成本；此时应切换策略重点',
        referenceCase: '参考案例：某中档女装门店通过"停止无差别折扣+清仓滞销+货品结构优化"，半年内毛利率从38%提升至51%，净利率从14%提升至26%，年净利润增加约42万元',
      },
    }

    const templateKey = dimension in planTemplates ? dimension : 'customerFlow'
    const template = planTemplates[templateKey]!

    // 为不同维度定制化响应内容
    const finalPlan = {
      dimension,
      title,
      ...template,
    }

    res.json({ code: 200, data: finalPlan, message: 'success' })
  }, 1500 + Math.random() * 1000) // 模拟1.5-2.5秒AI思考时间
})

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
