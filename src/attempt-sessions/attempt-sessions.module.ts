import { Module } from '@nestjs/common';
import { AttemptSessionsController } from './attempt-sessions.controller';
import { AttemptSessionsService } from './attempt-sessions.service';
import { PrismaModule } from 'src/prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  controllers: [AttemptSessionsController],
  providers: [AttemptSessionsService],
})
export class AttemptSessionsModule {}
