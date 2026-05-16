import * as fs from 'fs'
import * as path from 'path'
import * as yaml from 'js-yaml'

export interface AppConfig {
  app: {
    host: string
    port: number
    env: string
  }
  database: {
    host: string
    port: number
    name: string
    username: string
    password: string
    authSource: string
    get uri(): string
  }
  redis: {
    host: string
    port: number
    password: string
    db: number
  }
  jwt: {
    secret: string
    expiresIn: string
  }
  ai: {
    provider: string
    apiKey: string
    model: string
    temperature: number
    maxTokens: number
  }
  diagnostic: {
    weights: {
      customerFlow: number
      conversion: number
      avgAmount: number
      repurchase: number
      profit: number
    }
    benchmarks: {
      customerFlow: number
      conversion: number
      avgAmount: number
      repurchase: number
      profit: number
    }
  }
  alert: {
    rules: {
      customerFlow: { danger: number; warning: number }
      conversion: { danger: number; warning: number }
      avgAmount: { danger: number; warning: number }
      repurchase: { danger: number; warning: number }
      profit: { danger: number; warning: number }
    }
  }
}

export class ConfigService {
  private static config: AppConfig | null = null

  static loadConfig(): AppConfig {
    if (this.config) {
      return this.config
    }

    const configPath = path.join(process.cwd(), 'src', 'config', 'default.yaml')

    if (fs.existsSync(configPath)) {
      const fileContents = fs.readFileSync(configPath, 'utf8')
      const config = yaml.load(fileContents) as AppConfig

      // 处理环境变量替换
      const processed = this.processEnvVariables(config)
      this.config = processed
      return this.config
    }

    // 默认配置
    return {
      app: { host: '0.0.0.0', port: 8080, env: 'development' },
      database: {
        host: 'localhost',
        port: 27017,
        name: 'shop_ai_diagnostic',
        username: '',
        password: '',
        authSource: 'admin',
        get uri() {
          return `mongodb://${this.host}:${this.port}/${this.name}`
        },
      },
      redis: { host: 'localhost', port: 6379, password: '', db: 0 },
      jwt: { secret: 'default-secret', expiresIn: '7d' },
      ai: { provider: 'openai', apiKey: '', model: 'gpt-4', temperature: 0.7, maxTokens: 2000 },
      diagnostic: {
        weights: { customerFlow: 0.2, conversion: 0.25, avgAmount: 0.2, repurchase: 0.2, profit: 0.15 },
        benchmarks: { customerFlow: 100, conversion: 40, avgAmount: 180, repurchase: 50, profit: 30 },
      },
      alert: {
        rules: {
          customerFlow: { danger: 70, warning: 85 },
          conversion: { danger: 30, warning: 35 },
          avgAmount: { danger: 150, warning: 160 },
          repurchase: { danger: 35, warning: 40 },
          profit: { danger: 20, warning: 25 },
        },
      },
    }
  }

  private static processEnvVariables(config: AppConfig): AppConfig {
    const jsonStr = JSON.stringify(config)
    const processed = jsonStr.replace(/\$\{(\w+)\}/g, (_, envVar) => process.env[envVar] || '')
    return JSON.parse(processed)
  }
}
