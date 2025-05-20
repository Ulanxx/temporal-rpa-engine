import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  
  // 启用CORS，允许前端访问
  app.enableCors({
    origin: true,
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS',
    credentials: true,
  });
  
  // 设置API前缀
  app.setGlobalPrefix('api');
  
  await app.listen(3001);
  console.log('API服务运行在: http://localhost:3001/');
}

bootstrap();
