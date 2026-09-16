import {
  Body,
  Controller,
  Get,
  Param,
  Patch,
  Post,
  Query,
} from '@nestjs/common';
import { AttemptSessionsService } from './attempt-sessions.service';
import { CreateAvulsoAttemptSessionDto } from './dto/create-avulso-attempt-session.dto';
import { CreateSimulationAttemptSessionDto } from './dto/create-simulation-attempt-session.dto';
import { CreateExamAttemptSessionDto } from './dto/create-exam-attempt-session.dto';
import { SubmitAttemptAnswerDto } from './dto/submit-attempt-answer.dto';
import { UseGuards, Req } from '@nestjs/common';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';
import type { AuthenticatedRequest } from 'src/auth/types/authenticated-request.type';
import { ApiBearerAuth } from '@nestjs/swagger';

@ApiBearerAuth('jwt')
@UseGuards(JwtAuthGuard)
@Controller('attempt-sessions')
export class AttemptSessionsController {
  constructor(
    private readonly attemptSessionsService: AttemptSessionsService,
  ) {}

  @Post('avulso')
  createAvulso(
    @Body() dto: CreateAvulsoAttemptSessionDto,
    @Req() req: AuthenticatedRequest,
  ) {
    return this.attemptSessionsService.createAvulsoSession(req.user.id, dto);
  }

  @Post('simulation')
  createFromSimulation(
    @Body() dto: CreateSimulationAttemptSessionDto,
    @Req() req: AuthenticatedRequest,
  ) {
    return this.attemptSessionsService.createSimulationSession(
      req.user.id,
      dto,
    );
  }

  @Post('exam')
  createFromExam(
    @Body() dto: CreateExamAttemptSessionDto,
    @Req() req: AuthenticatedRequest,
  ) {
    return this.attemptSessionsService.createExamSession(req.user.id, dto);
  }

  @Get(':sessionId')
  findOne(
    @Param('sessionId') sessionId: string,
    @Query('userId') userId: string,
    @Req() req: AuthenticatedRequest,
  ) {
    return this.attemptSessionsService.findOne(req.user.id, sessionId);
  }

  @Patch(':sessionId/answers/:questionId')
  submitAnswer(
    @Param('sessionId') sessionId: string,
    @Param('questionId') questionId: string,
    @Body() dto: SubmitAttemptAnswerDto,
    @Req() req: AuthenticatedRequest,
  ) {
    return this.attemptSessionsService.submitAnswer(
      req.user.id,
      sessionId,
      questionId,
      dto,
    );
  }

  @Post(':sessionId/correct')
  correctSession(
    @Param('sessionId') sessionId: string,
    //@Body() dto: SessionActionDto,
    @Req() req: AuthenticatedRequest,
  ) {
    return this.attemptSessionsService.correctSession(req.user.id, sessionId);
  }

  @Post(':sessionId/abandon')
  abandonSession(
    @Param('sessionId') sessionId: string,
    //@Body() dto: SessionActionDto,
    @Req() req: AuthenticatedRequest,
  ) {
    return this.attemptSessionsService.abandonSession(req.user.id, sessionId);
  }
}
