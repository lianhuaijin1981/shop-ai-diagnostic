# 线下门店AI经营诊断系统

## 项目概述

线下门店AI经营诊断系统 - 智能问数 & 智能问诊，为线下门店提供全面的AI驱动经营诊断能力。

**在线预览**: https://shop-ai-diagnostic.example.com

## 技术栈

| 层级 | 技术 |
|------|------|
| 前端 | React 19 + Vite + TypeScript + Zustand + ECharts + Tailwind CSS |
| 后端 | NestJS 10 + TypeScript |
| 数据库 | MongoDB 6.0 (Mongoose ODM) |
| 缓存 | Redis 7.x |
| 部署 | Docker + GitHub Actions CI/CD |

## 项目结构

```
shop-ai-diagnostic/
├── shop-ai-diagnostic-web/     # 前端项目 (React 19)
├── shop-ai-diagnostic-api/      # 后端项目 (NestJS 10)
├── docker/                       # Docker Compose 配置
├── .github/workflows/            # CI/CD 配置
└── README.md
```

## 快速开始

### 1. 环境准备

- Node.js >= 20.x
- MongoDB >= 6.0
- Redis >= 7.x
- Docker & Docker Compose (可选)

### 2. 后端启动

```bash
cd shop-ai-diagnostic-api
npm install
cp ../.env.example .env  # 修改配置
npm run start:dev
```

### 3. 前端启动

```bash
cd shop-ai-diagnostic-web
npm install
cp ../.env.example .env  # 修改配置
npm run dev
```

### 4. Docker 部署

```bash
docker-compose -f docker/docker-compose.yml up -d
```

## 核心功能模块

| 模块 | 功能描述 | 状态 |
|------|----------|------|
| 经营大盘 | 关键指标实时监控、趋势图表 | ✅ |
| 五维诊断 | 客流/转化/客单价/复购/利润 | ✅ |
| 货品诊断 | 动销/滞销/库存预警分析 | ✅ |
| 任务中心 | 问题跟进与执行追踪 | ✅ |
| 预警中心 | 多维度异常实时预警 | ✅ |
| 系统设置 | 用户配置管理 | ✅ |

## API 文档

启动后端服务后访问: `http://localhost:3000/api/docs`

## 开发指南

### 代码规范

- 使用 ESLint + Prettier
- TypeScript 严格模式
- 提交前运行 `npm run lint`

### 测试

```bash
# 后端测试
cd shop-ai-diagnostic-api
npm run test

# 前端类型检查
cd shop-ai-diagnostic-web
npm run type-check
```

## 部署说明

### 环境变量配置

| 变量 | 描述 | 示例 |
|------|------|------|
| PORT | API 服务端口 | 3000 |
| MONGODB_URI | MongoDB 连接地址 | mongodb://localhost:27017/shop-ai-diagnostic |
| JWT_SECRET | JWT 密钥 | your-super-secret-key |

### Docker 部署

1. 构建镜像: `docker build -t shop-ai-api ./shop-ai-diagnostic-api`
2. 启动服务: `docker-compose -f docker/docker-compose.yml up -d`

## License

MIT
