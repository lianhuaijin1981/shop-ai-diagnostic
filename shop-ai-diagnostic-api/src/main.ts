import { NestFactory } from '@nestjs/core'
import { ValidationPipe } from '@nestjs/common'
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger'
import { AppModule } from './app.module'
import { ConfigService } from '@nestjs/config'

async function bootstrap() {
  const app = await NestFactory.create(AppModule)
  const configService = app.get(ConfigService)

  // 全局前缀
  app.setGlobalPrefix('api')

  // 全局验证管道
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  )

  // CORS配置
  app.enableCors({
    origin: true,
    credentials: true,
  })

  // Swagger文档
  const swaggerConfig = new DocumentBuilder()
    .setTitle('门店AI诊断系统 API')
    .setDescription('线下门店AI经营诊断系统接口文档')
    .setVersion('1.0')
    .addBearerAuth()
    .build()
  const document = SwaggerModule.createDocument(app, swaggerConfig)
  SwaggerModule.setup('api/docs', app, document)

  const port = configService.get<number>('app.port') || 8080
  await app.listen(port)
  console.log(`Application is running on: http://localhost:${port}/api/docs`)
}

bootstrap()
