#!/usr/bin/env python3
"""简单替换货品诊断API"""

# 读取文件
with open('dist/demo/demo-server.js', 'r', encoding='utf-8') as f:
    content = f.read()

# 定义要替换的内容
old_block = """// 货品结构诊断
app.get('/api/diagnostic/product-structure', (req, res) => {
    res.json({
        code: 200,
        data: {
            totalSKUs: 580,
            abcAnalysis: {
                a: { count: 58, percentage: 10, sales: 65 },
                b: { count: 174, percentage: 30, sales: 25 },
                c: { count: 348, percentage: 60, sales: 10 },
            },
            widthDepth: {
                categoryCount: 5,
                avgSKUPerCategory: 116,
                maxDepthCategory: '上衣',
                minDepthCategory: '配饰',
            },
            priceBand: [
                { band: '0-50', count: 120, percentage: 20.7 },
                { band: '50-100', count: 145, percentage: 25.0 },
                { band: '100-200', count: 180, percentage: 31.0 },
                { band: '200-500', count: 110, percentage: 19.0 },
                { band: '500+', count: 25, percentage: 4.3 },
            ],
            suggestions: [
                { id: 'ps_1', title: '缩减C类SKU', priority: 'high', description: 'C类SKU占比60%，建议淘汰滞销款', action: '查看方案' },
                { id: 'ps_2', title: '优化价格带分布', priority: 'medium', description: '100-200元价格带SKU占比偏低', action: '查看方案' },
            ],
        },
    });
});"""

new_block = """// 货品结构诊断
app.get('/api/diagnostic/product-structure', (req, res) => {
    const shopId = req.query.shopId || 'shop_1';
    const period = req.query.period || 'week';
    res.json({
        code: 200,
        data: generateProductStructure(shopId, period),
    });
});"""

if old_block in content:
    content = content.replace(old_block, new_block)
    print("✅ product-structure API 已更新")
else:
    print("❌ product-structure 未找到匹配内容")

# 写回文件
with open('dist/demo/demo-server.js', 'w', encoding='utf-8') as f:
    f.write(content)

print("\n文件已更新")
