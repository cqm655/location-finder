import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { UseCaseModule } from './use-case/use-case.module';

@Module({
  imports: [UseCaseModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
