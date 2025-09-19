import { NestFactory, Reflector } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe, VersioningType } from '@nestjs/common';
import cookieParser from 'cookie-parser';
import { ResponseInterceptor } from './core/response.interceptor';
import { JwtAuthGuard } from './auth/jwt-auth.guard';
import { RoleGuard } from './auth/role.guard';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const reflector = app.get(Reflector);


  app.useGlobalGuards(new JwtAuthGuard(reflector), new RoleGuard(reflector));
  app.useGlobalInterceptors(new ResponseInterceptor(reflector));
  app.useGlobalPipes(new ValidationPipe(
    { transform: true, }
  ));

  app.use(cookieParser());


  app.setGlobalPrefix("api");
  app.enableVersioning({
    type: VersioningType.URI,
    defaultVersion: ["1"],
  });

  app.enableCors({
    origin: 
    [process.env.CORS_ORIGIN, process.env.FRONTEND_URL, 'http://localhost:3001',  ],
    methods: "GET,HEAD,PUT,PATCH,POST,DELETE",
    preflightContinue: false,
    credentials: true,
  });

  // Đảm bảo app lắng nghe trên port đúng cho production hosting
 const port = process.env.PORT || 3001;
  const host = process.env.NODE_ENV === 'production' ? '0.0.0.0' : 'localhost';
  
  await app.listen(port, host);
  console.log(`🚀 Application is running on: http://${host}:${port}`);
}

bootstrap();
