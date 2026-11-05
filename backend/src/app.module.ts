import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { UseCaseModule } from './use-case/use-case.module';
import { AuthController } from './auth/auth.controller';
import { AuthModule } from './auth/auth.module';
import { ConfigModule } from '@nestjs/config';
import { SeqMlpService } from './use-case/seq/seq-mlp.service';

@Module({
  imports: [
    UseCaseModule,
    AuthModule,
    ConfigModule.forRoot({
      isGlobal: true,
    }),
  ],
  controllers: [AppController, AuthController],
  providers: [AppService, SeqMlpService],
})
export class AppModule {}
