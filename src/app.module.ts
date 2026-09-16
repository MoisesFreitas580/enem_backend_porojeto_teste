import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { UsersModule } from './users/users.module';
import { PrismaModule } from './prisma/prisma.module';
import { QuestionModule } from './question/question.module';
import { CatalogModule } from './catalog/catalog.module';
import { ExamsModule } from './exams/exams.module';
import { SimulationsModule } from './simulations/simulations.module';
import { HealthModule } from './health/health.module';
import { AttemptSessionsModule } from './attempt-sessions/attempt-sessions.module';
import { StatisticsModule } from './statistics/statistics.module';
import { AuthModule } from './auth/auth.module';
import { ImagesModule } from './images/images.module';

@Module({
  imports: [
    PrismaModule,
    UsersModule,
    QuestionModule,
    CatalogModule,
    ExamsModule,
    SimulationsModule,
    HealthModule,
    AttemptSessionsModule,
    StatisticsModule,
    AuthModule,
    ImagesModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
