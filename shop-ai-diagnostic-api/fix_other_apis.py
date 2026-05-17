#!/usr/bin/env python3
"""简单替换剩余的货品诊断API"""

# 读取文件
with open('dist/demo/demo-server.js', 'r', encoding='utf-8') as f:
    content = f.read()

# 2. sales-velocity API
old_sv = """// 动销诊断
app.get('/api/diagnostic/sales-velocity', (req, res) => {
    res.json({
        code: 200,
        data: {
            overallTurnover: 4.2,
            categoryVelocity: [
                { category: '上衣', turnover: 5.5, status: 'fast' },
                { category: '裤装', turnover: 4.8, status: 'fast' },
                { category: '鞋类', turnover: 3.2, status: 'normal' },
                { category: '配饰', turnover: 6.2, status: 'fast' },
                { category: '外套', turnover: 2.8, status: 'slow' },
            ],
            velocityDistribution: [
                { range: 'fast', count: 180, percentage: 31.0 },
                { range: 'normal', count: 220, percentage: 37.9 },
                { range: 'slow', count: 120, percentage: 20.7 },
                { range: 'dead', count: 60, percentage: 10.4 },
            ],
            seasonalTrend: Array.from({ length: 12 }, (_, i) => ({
                month: `${i + 1}月`,
                turnover: Math.round((2.5 + Math.random() * 4) * 10) / 10,
            })),
            suggestions: [
                { id: 'sv_1', title: '清理滞销库存', priority: 'high', description: '60个SKU零动销，建议清仓处理', action: '查看方案' },
                { id: 'sv_2', title: '外套品类促销', priority: 'medium', description: '外套品类动销偏慢，建议季末促销', action: '查看方案' },
            ],
        },
    });
});"""

new_sv = """// 动销诊断
app.get('/api/diagnostic/sales-velocity', (req, res) => {
    const shopId = req.query.shopId || 'shop_1';
    const period = req.query.period || 'week';
    res.json({
        code: 200,
        data: generateSalesVelocity(shopId, period),
    });
});"""

if old_sv in content:
    content = content.replace(old_sv, new_sv)
    print("✅ sales-velocity API 已更新")
else:
    print("❌ sales-velocity 未找到")

# 3. inventory-risk API
old_ir = """// 库存风险诊断
app.get('/api/diagnostic/inventory-risk', (req, res) => {
    res.json({
        code: 200,
        data: {
            overallRisk: 'medium',
            riskScore: 62,
            stockoutRisk: [
                { skuId: 'sku_001', name: '纯棉基础T恤', currentStock: 12, avgDailySales: 8, daysLeft: 1.5, risk: 'critical' },
                { skuId: 'sku_003', name: '透气运动鞋', currentStock: 8, avgDailySales: 5, daysLeft: 1.6, risk: 'critical' },
            ],
            overstockRisk: [
                { skuId: 'sku_045', name: '复古印花衬衫', currentStock: 85, avgDailySales: 0.5, daysOfSupply: 170, risk: 'high' },
                { skuId: 'sku_089', name: '亮片装饰外套', currentStock: 28, avgDailySales: 0.3, daysOfSupply: 93, risk: 'high' },
            ],
            expirationRisk: [
                { skuId: 'sku_201', name: '夏季印花T恤', currentStock: 45, season: 'summer', daysToEnd: 15, risk: 'medium' },
            ],
            suggestions: [
                { id: 'ir_1', title: '紧急补货计划', priority: 'high', description: '2个SKU库存告急，需立即补货', action: '查看方案' },
                { id: 'ir_2', title: '滞销品清仓', priority: 'high', description: '2个SKU库存积压严重', action: '查看方案' },
            ],
        },
    });
});"""

new_ir = """// 库存风险诊断
app.get('/api/diagnostic/inventory-risk', (req, res) => {
    const shopId = req.query.shopId || 'shop_1';
    const period = req.query.period || 'week';
    res.json({
        code: 200,
        data: generateInventoryRisk(shopId, period),
    });
});"""

if old_ir in content:
    content = content.replace(old_ir, new_ir)
    print("✅ inventory-risk API 已更新")
else:
    print("❌ inventory-risk 未找到")

# 4. operation-solution API - 需要找到这段代码
import re
match = re.search(r"// 运营方案\napp\.get\('/api/diagnostic/operation-solution', \(req, res\) => \{[^}]+\{[\s\S]*?\}\);", content)
if match:
    new_os = """// 运营方案
app.get('/api/diagnostic/operation-solution', (req, res) => {
    const shopId = req.query.shopId || 'shop_1';
    res.json({
        code: 200,
        data: generateOperationSolution(shopId),
    });
});"""
    content = content[:match.start()] + new_os + content[match.end():]
    print("✅ operation-solution API 已更新")
else:
    print("❌ operation-solution 未找到")

# 写回文件
with open('dist/demo/demo-server.js', 'w', encoding='utf-8') as f:
    f.write(content)

print("\n所有API已更新!")
