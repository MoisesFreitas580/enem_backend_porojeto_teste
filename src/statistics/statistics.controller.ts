import { Controller, Get, Query, Req, UseGuards } from '@nestjs/common';
import { StatisticsService } from './statistics.service';
import { StatisticsQueryDto } from './dto/statistics-query.dto';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';
import type { AuthenticatedRequest } from 'src/auth/types/authenticated-request.type';

@UseGuards(JwtAuthGuard)
@Controller('statistics')
export class StatisticsController {
  constructor(private readonly statisticsService: StatisticsService) {}

  @Get('overview')
  getOverview(
    @Query() query: StatisticsQueryDto,
    @Req() req: AuthenticatedRequest,
  ) {
    return this.statisticsService.getOverview(req.user.id, query);
  }

  @Get('by-area')
  getByArea(
    @Query() query: StatisticsQueryDto,
    @Req() req: AuthenticatedRequest,
  ) {
    return this.statisticsService.getByArea(req.user.id, query);
  }

  @Get('by-skill')
  getBySkill(
    @Query() query: StatisticsQueryDto,
    @Req() req: AuthenticatedRequest,
  ) {
    return this.statisticsService.getBySkill(req.user.id, query);
  }

  @Get('by-competency')
  getByCompetency(
    @Query() query: StatisticsQueryDto,
    @Req() req: AuthenticatedRequest,
  ) {
    return this.statisticsService.getByCompetency(req.user.id, query);
  }

  @Get('most-wrong')
  getMostWrong(
    @Query() query: StatisticsQueryDto,
    @Req() req: AuthenticatedRequest,
  ) {
    return this.statisticsService.getMostWrong(req.user.id, query);
  }

  @Get('context-comparison')
  getContextComparison(
    @Query() query: StatisticsQueryDto,
    @Req() req: AuthenticatedRequest,
  ) {
    return this.statisticsService.getContextComparison(req.user.id, query);
  }

  @Get('evolution')
  getEvolution(
    @Query() query: StatisticsQueryDto,
    @Req() req: AuthenticatedRequest,
  ) {
    return this.statisticsService.getEvolution(req.user.id, query);
  }
}
