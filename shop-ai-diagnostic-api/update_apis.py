#!/usr/bin/env python3
"""更新demo-server.js中的货品诊断API，使其调用新的数据生成器"""

import re

# 读取文件
with open('dist/demo/demo-server.js', 'r', encoding='utf-8') as f:
    content = f.read()

# 定义替换
replacements = [
    # 1. product-structure API
    (
        r"// 货品结构诊断\s*app\.get\('/api/diagnostic/product-structure'[^}]+\{[^}]+\}\s*\}\s*\);",
        """// 货品结构诊断
app.get('/api/diagnostic/product-structure', (req, res) => {
    const shopId = req.query.shopId || 'shop_1';
    const period = req.query.period || 'week';
    res.json({
        code: 200,
        data: generateProductStructure(shopId, period),
    });
});"""
    ),
    
    # 2. sales-velocity API
    (
        r"// 动销诊断\s*app\.get\('/api/diagnostic/sales-velocity'[^}]+\{[^}]+\}\s*\}\s*\);",
        """// 动销诊断
app.get('/api/diagnostic/sales-velocity', (req, res) => {
    const shopId = req.query.shopId || 'shop_1';
    const period = req.query.period || 'week';
    res.json({
        code: 200,
        data: generateSalesVelocity(shopId, period),
    });
});"""
    ),
    
    # 3. inventory-risk API
    (
        r"// 库存风险诊断\s*app\.get\('/api/diagnostic/inventory-risk'[^}]+\{[^}]+\}\s*\}\s*\);",
        """// 库存风险诊断
app.get('/api/diagnostic/inventory-risk', (req, res) => {
    const shopId = req.query.shopId || 'shop_1';
    const period = req.query.period || 'week';
    res.json({
        code: 200,
        data: generateInventoryRisk(shopId, period),
    });
});"""
    ),
    
    # 4. operation-solution API
    (
        r"// 运营方案\s*app\.get\('/api/diagnostic/operation-solution'[^}]+\{[^}]+\}\s*\}\s*\);",
        """// 运营方案
app.get('/api/diagnostic/operation-solution', (req, res) => {
    const shopId = req.query.shopId || 'shop_1';
    res.json({
        code: 200,
        data: generateOperationSolution(shopId),
    });
});"""
    ),
]

# 执行替换
modified = False
for pattern, replacement in replacements:
    if re.search(pattern, content, re.DOTALL):
        content = re.sub(pattern, replacement, content, flags=re.DOTALL)
        print(f'✅ 已替换: {pattern[:50]}...')
        modified = True
    else:
        print(f'❌ 未找到: {pattern[:50]}...')

if modified:
    with open('dist/demo/demo-server.js', 'w', encoding='utf-8') as f:
        f.write(content)
    print('\n✅ demo-server.js 已更新')
else:
    print('\n❌ 没有进行任何修改')
