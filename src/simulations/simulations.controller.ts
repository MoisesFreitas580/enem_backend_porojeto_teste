import {
  Controller,
  Delete,
  Get,
  Param,
  ParseUUIDPipe,
  Post,
  Patch,
  Body,
  Query,
  Req,
  UseGuards,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOkResponse,
  ApiOperation,
  ApiParam,
  ApiQuery,
  ApiTags,
} from '@nestjs/swagger';
import { SimulationsService } from './simulations.service';
import { CreateSimulationDto } from './dto/create-simulation.dto';
import { GenerateSimulationDto } from './dto/generate-simulation.dto';
import { ListSimulationsQueryDto } from './dto/list-simulations.query.dto';
import { AddSimulationQuestionsDto } from './dto/add-simulation-questions.dto';
import { UpdateSimulationTitleDto } from './dto/update-simulation-title.dto';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';
import type { AuthenticatedRequest } from 'src/auth/types/authenticated-request.type';

@ApiTags('Simulations')
@ApiBearerAuth('jwt')
@UseGuards(JwtAuthGuard)
@Controller('simulations')
export class SimulationsController {
  constructor(private readonly simulationsService: SimulationsService) {}

  @Post()
  @ApiOperation({
    summary: 'Cria um simulado manualmente',
    description:
      'Cria um simulado vazio ou com uma lista explícita de questionIds.',
  })
  @ApiOkResponse({ description: 'Simulado criado com sucesso.' })
  create(@Body() dto: CreateSimulationDto, @Req() req: AuthenticatedRequest) {
    return this.simulationsService.create(req.user.id, dto);
  }

  @Get()
  @ApiOperation({
    summary: 'Lista simulados',
    description: 'Lista simulados do usuário autenticado.',
  })
  @ApiQuery({ name: 'page', required: false })
  @ApiQuery({ name: 'limit', required: false })
  @ApiOkResponse({ description: 'Lista de simulados retornada com sucesso.' })
  list(@Query() query: ListSimulationsQueryDto, @Req() req: AuthenticatedRequest) {
    return this.simulationsService.list(req.user.id, query);
  }

  @Get(':id')
  @ApiOperation({
    summary: 'Busca um simulado por id',
  })
  @ApiParam({ name: 'id', required: true })
  @ApiOkResponse({ description: 'Simulado encontrado com sucesso.' })
  getById(
    @Param('id', new ParseUUIDPipe()) id: string,
    @Req() req: AuthenticatedRequest,
  ) {
    return this.simulationsService.getById(req.user.id, id);
  }

  @Get(':id/questions')
  @ApiOperation({
    summary: 'Lista as questões de um simulado',
    description:
      'Retorna as questões ordenadas conforme SimulationQuestion.order.',
  })
  @ApiParam({ name: 'id', required: true })
  @ApiOkResponse({
    description: 'Questões do simulado retornadas com sucesso.',
  })
  getQuestions(
    @Param('id', new ParseUUIDPipe()) id: string,
    @Req() req: AuthenticatedRequest,
  ) {
    return this.simulationsService.getQuestions(req.user.id, id);
  }

  @Post('generate')
  @ApiOperation({
    summary: 'Gera um simulado automaticamente',
    description: 'Suporta as estratégias: exact_exam, random e manual.',
  })
  @ApiOkResponse({ description: 'Simulado gerado com sucesso.' })
  generate(@Body() dto: GenerateSimulationDto, @Req() req: AuthenticatedRequest) {
    return this.simulationsService.generate(req.user.id, dto);
  }

  @Post(':id/questions')
  @ApiOperation({
    summary: 'Adiciona questões a um simulado existente',
  })
  @ApiParam({ name: 'id', required: true })
  @ApiOkResponse({ description: 'Questões adicionadas com sucesso.' })
  addQuestions(
    @Param('id', new ParseUUIDPipe()) id: string,
    @Body() dto: AddSimulationQuestionsDto,
    @Req() req: AuthenticatedRequest,
  ) {
    return this.simulationsService.addQuestions(req.user.id, id, dto);
  }

  @Delete(':id/questions/:questionId')
  @ApiOperation({
    summary: 'Remove uma questão do simulado',
  })
  @ApiParam({ name: 'id', required: true })
  @ApiParam({ name: 'questionId', required: true })
  @ApiOkResponse({ description: 'Questão removida do simulado com sucesso.' })
  removeQuestion(
    @Param('id', new ParseUUIDPipe()) id: string,
    @Param('questionId', new ParseUUIDPipe()) questionId: string,
    @Req() req: AuthenticatedRequest,
  ) {
    return this.simulationsService.removeQuestion(req.user.id, id, questionId);
  }

  @Patch(':id/title')
  @ApiOperation({
    summary: 'Renomeia o título de um simulado',
  })
  @ApiParam({ name: 'id', required: true })
  @ApiOkResponse({ description: 'Título atualizado com sucesso.' })
  renameTitle(
    @Param('id', new ParseUUIDPipe()) id: string,
    @Body() dto: UpdateSimulationTitleDto,
    @Req() req: AuthenticatedRequest,
  ) {
    return this.simulationsService.renameTitle(req.user.id, id, dto.title);
  }
}
