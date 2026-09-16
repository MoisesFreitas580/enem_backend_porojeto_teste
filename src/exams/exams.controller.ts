import { Controller, Get, Param, Query } from '@nestjs/common';
import { ExamsService } from './exams.service';
import { ListExamsQueryDto } from './dto/list-exams.query.dto';
import {
  ApiOperation,
  ApiQuery,
  ApiTags,
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiParam,
} from '@nestjs/swagger';
import { ListExamQuestionsQueryDto } from './dto/list-exam-questions.query.dto';
import { ListExamsResponseDto } from './dto/exam-response.dto';
import { ListExamQuestionsResponseDto } from './dto/exam-question-response.dto';
import { ExamIdParamDto } from './dto/exam-id.param.dto';

@ApiTags('Exams')
@Controller('exams')
export class ExamsController {
  constructor(private readonly examsService: ExamsService) {}

  @Get()
  @ApiOperation({
    summary: 'Lista exames por tipo, ano e opcionalmente por dia',
    description:
      'Se day for informado, retorna o exame específico. Se day for omitido, retorna os exames do ano/tipo (normalmente D1 e D2).',
  })
  @ApiQuery({ name: 'type', required: true })
  @ApiQuery({ name: 'year', required: true })
  @ApiQuery({ name: 'day', required: false })
  @ApiOkResponse({
    description: 'Lista de exames encontrada com sucesso.',
    type: ListExamsResponseDto,
  })
  listExams(@Query() query: ListExamsQueryDto) {
    return this.examsService.listExams(query);
  }

  @Get('questions')
  @ApiOperation({
    summary: 'Lista questões de exames por tipo, ano e opcionalmente por dia',
    description:
      'Se day for informado, retorna apenas as questões daquele dia. Se day for omitido, retorna as questões de todos os dias daquele ano/tipo.',
  })
  @ApiQuery({ name: 'type', required: true })
  @ApiQuery({ name: 'year', required: true })
  @ApiQuery({ name: 'day', required: false })
  @ApiOkResponse({
    description:
      'Questões encontradas com sucesso a partir dos filtros do exame.',
    type: ListExamQuestionsResponseDto,
  })
  listExamQuestions(@Query() query: ListExamQuestionsQueryDto) {
    return this.examsService.listExamQuestions(query);
  }

  @Get(':id/questions')
  @ApiOperation({
    summary: 'Lista questões de um exame pelo examId',
    description:
      'Use esta rota quando o frontend já tiver o examId retornado por /exams. É uma navegação mais RESTful: exame -> questões.',
  })
  @ApiParam({
    name: 'id',
    required: true,
    description: 'UUID do exame',
  })
  @ApiOkResponse({
    description: 'Questões do exame encontradas com sucesso.',
    type: ListExamQuestionsResponseDto,
  })
  @ApiNotFoundResponse({
    description: 'Exame não encontrado.',
  })
  listQuestionsByExamId(@Param() params: ExamIdParamDto) {
    return this.examsService.listQuestionsByExamId(params.id);
  }
}
