# 线下门店AI经营诊断系统

## 项目概述
线下门店AI经营诊断系统 - 智能问数 & 智能问诊

## 技术栈
- 前端: React 19 + Vite + TypeScript + Zustand + ECharts
- 后端: NestJS + Node.js + TypeScript
- 数据库: MongoDB 6.0
- 缓存: Redis 7.x
- 消息队列: RabbitMQ 3.x
- AI能力: OpenAI GPT-4
- 部署: Docker + CI/CD

## 项目结构
```
shop-ai-diagnostic/
├── shop-ai-diagnostic-web/     # 前端项目
├── shop-ai-diagnostic-api/      # 后端项目
├── docker/                      # Docker配置文件
├── docs/                        # 项目文档
└── README.md
```

## 快速开始

### 前端
```bash
cd shop-ai-diagnostic-web
pnpm install
pnpm dev
```

### 后端
```bash
cd shop-ai-diagnostic-api
pnpm install
pnpm start:dev
```

### Docker部署
```bash
docker-compose -f docker/docker-compose.yml up -d
```

## 核心功能模块
1. 经营大盘 - 关键指标实时监控
2. 五维诊断 - 客流/转化/客单价/复购/利润
3. 货品诊断 - 动销/滞销/库存预警
4. 任务中心 - 问题跟进与执行追踪
5. 预警中心 - 异常实时预警

## 相关文档
- [技术架构设计](./docs/TECH_ARCHITECTURE.md)
- [UI原型设计](./docs/UI_PROTOTYPE.md)
- [API接口文档](./docs/API_SPEC.md)
