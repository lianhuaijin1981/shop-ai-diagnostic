#!/usr/bin/env python3
"""更新货品诊断API"""

# 读取文件
with open('dist/demo/demo-server.js', 'r', encoding='utf-8') as f:
    lines = f.readlines()

# 找到需要替换的API位置
new_apis = {}

# 1. product-structure API (第414行附近)
ps_start = None
ps_end = None
for i, line in enumerate(lines):
    if "app.get('/api/diagnostic/product-structure'" in line:
        ps_start = i
    if ps_start and i > ps_start and ('});' in line or '});' in lines[i-1] if i > 0 else False):
        # 找到结束
        for j in range(i, max(0, i-10), -1):
            if '});' in lines[j]:
                ps_end = j
                break
        if ps_end:
            break

# 2. sales-velocity API
sv_start = None
sv_end = None
for i, line in enumerate(lines):
    if "app.get('/api/diagnostic/sales-velocity'" in line:
        sv_start = i
    if sv_start and i > sv_start and i > (ps_end if ps_end else 0):
        for j in range(i, max(0, i-10), -1):
            if '});' in lines[j]:
                sv_end = j
                break
        if sv_end:
            break

# 3. inventory-risk API
ir_start = None
ir_end = None
for i, line in enumerate(lines):
    if "app.get('/api/diagnostic/inventory-risk'" in line:
        ir_start = i
    if ir_start and i > ir_start and i > (sv_end if sv_end else 0):
        for j in range(i, max(0, i-10), -1):
            if '});' in lines[j]:
                ir_end = j
                break
        if ir_end:
            break

# 4. operation-solution API
os_start = None
os_end = None
for i, line in enumerate(lines):
    if "app.get('/api/diagnostic/operation-solution'" in line:
        os_start = i
    if os_start and i > os_start and i > (ir_end if ir_end else 0):
        for j in range(i, max(0, i-10), -1):
            if '});' in lines[j]:
                os_end = j
                break
        if os_end:
            break

print(f"product-structure: {ps_start}-{ps_end}")
print(f"sales-velocity: {sv_start}-{sv_end}")
print(f"inventory-risk: {ir_start}-{ir_end}")
print(f"operation-solution: {os_start}-{os_end}")

# 新API实现
ps_new = """// 货品结构诊断
app.get('/api/diagnostic/product-structure', (req, res) => {
    const shopId = req.query.shopId || 'shop_1';
    const period = req.query.period || 'week';
    res.json({
        code: 200,
        data: generateProductStructure(shopId, period),
    });
});
"""

sv_new = """// 动销诊断
app.get('/api/diagnostic/sales-velocity', (req, res) => {
    const shopId = req.query.shopId || 'shop_1';
    const period = req.query.period || 'week';
    res.json({
        code: 200,
        data: generateSalesVelocity(shopId, period),
    });
});
"""

ir_new = """// 库存风险诊断
app.get('/api/diagnostic/inventory-risk', (req, res) => {
    const shopId = req.query.shopId || 'shop_1';
    const period = req.query.period || 'week';
    res.json({
        code: 200,
        data: generateInventoryRisk(shopId, period),
    });
});
"""

os_new = """// 运营方案
app.get('/api/diagnostic/operation-solution', (req, res) => {
    const shopId = req.query.shopId || 'shop_1';
    res.json({
        code: 200,
        data: generateOperationSolution(shopId),
    });
});
"""

# 执行替换
if ps_start and ps_end:
    lines[ps_start:ps_end+1] = [ps_new + '\n']
if sv_start and sv_end:
    lines[sv_start:sv_end+1] = [sv_new + '\n']
if ir_start and ir_end:
    lines[ir_start:ir_end+1] = [ir_new + '\n']
if os_start and os_end:
    lines[os_start:os_end+1] = [os_new + '\n']

# 写回文件
with open('dist/demo/demo-server.js', 'w', encoding='utf-8') as f:
    f.writelines(lines)

print("\n✅ API已更新!")
