import { Controller, Get, Param, ParseUUIDPipe, Query } from '@nestjs/common';
import {
  ApiExtraModels,
  ApiOkResponse,
  ApiOperation,
  ApiParam,
  ApiQuery,
  ApiTags,
} from '@nestjs/swagger';
import { ApplicationType, AreaCode, ExamDay } from '@prisma/client';
import { QuestionService } from './question.service';
import { QueryQuestionsDto } from './dto/query-questions.dto';
import {
  QuestionDetailResponseDto,
  QuestionsDetailedResponseDto,
  QuestionsSummaryResponseDto,
} from './dto/question-response.dto';

@ApiTags('Questions')
@Controller('questions')
@ApiExtraModels(
  QuestionsSummaryResponseDto,
  QuestionsDetailedResponseDto,
  QuestionDetailResponseDto,
)
export class QuestionController {
  constructor(private readonly questionService: QuestionService) {}

  @Get()
  @ApiOperation({
    summary: 'Lista questões com filtros de exame, pedagógicos e de completude',
    description:
      'Por padrão retorna uma listagem resumida. Se detailed=true, retorna uma listagem mais completa. ' +
      'Os filtros podem ser combinados para buscar questões por exame, área, habilidade, competência, disciplina, objeto de conhecimento, conteúdo e situação de classificação.',
  })
  @ApiQuery({
    name: 'page',
    required: false,
    description: 'Página da listagem (padrão 1)',
    example: 1,
  })
  @ApiQuery({
    name: 'limit',
    required: false,
    description: 'Quantidade de itens por página (padrão 20, máximo 100)',
    example: 20,
  })
  @ApiQuery({
    name: 'detailed',
    required: false,
    description:
      'Se true, retorna listagem detalhada; se false, listagem resumida',
    example: false,
  })

  // filtros de exame
  @ApiQuery({
    name: 'examId',
    required: false,
    description: 'UUID do exame',
  })
  @ApiQuery({
    name: 'year',
    required: false,
    description: 'Ano do exame',
    example: 2015,
  })
  @ApiQuery({
    name: 'type',
    required: false,
    enum: ApplicationType,
    description: 'Tipo da aplicação do exame',
  })
  @ApiQuery({
    name: 'day',
    required: false,
    enum: ExamDay,
    description: 'Dia do exame',
  })

  // filtros da questão
  @ApiQuery({
    name: 'number',
    required: false,
    description: 'Número da questão dentro do exame',
    example: 35,
  })
  @ApiQuery({
    name: 'area',
    required: false,
    enum: AreaCode,
    description: 'Área da questão',
  })
  @ApiQuery({
    name: 'tpLingua',
    required: false,
    description: '-1 não se aplica; 0 inglês; 1 espanhol',
    example: -1,
  })
  @ApiQuery({
    name: 'inepItemCode',
    required: false,
    description: 'Código INEP do item',
    example: '123456',
  })

  // filtros pedagógicos
  @ApiQuery({
    name: 'skillId',
    required: false,
    description: 'UUID da skill/habilidade',
  })
  @ApiQuery({
    name: 'skillCode',
    required: false,
    description: 'Código da habilidade. Aceita H12 ou 12',
    example: 'H12',
  })
  @ApiQuery({
    name: 'code',
    required: false,
    description: 'Alias de skillCode',
    example: 'H12',
  })
  @ApiQuery({
    name: 'competencyId',
    required: false,
    description: 'UUID da competência',
  })
  @ApiQuery({
    name: 'competencyCode',
    required: false,
    description: 'Código da competência. Aceita C1 ou 1. Requer area.',
    example: 'C1',
  })
  @ApiQuery({
    name: 'disciplineId',
    required: false,
    description: 'UUID da disciplina',
  })
  @ApiQuery({
    name: 'knowledgeObjectId',
    required: false,
    description: 'UUID do objeto de conhecimento',
  })
  @ApiQuery({
    name: 'contentId',
    required: false,
    description: 'UUID do conteúdo',
  })

  // filtros de curadoria/completude
  @ApiQuery({
    name: 'missingSkill',
    required: false,
    description: 'Retorna apenas questões sem skill vinculada',
    example: false,
  })
  @ApiQuery({
    name: 'missingDiscipline',
    required: false,
    description: 'Retorna apenas questões sem disciplina vinculada',
    example: false,
  })
  @ApiQuery({
    name: 'missingKnowledgeObject',
    required: false,
    description: 'Retorna apenas questões sem objeto de conhecimento vinculado',
    example: false,
  })
  @ApiQuery({
    name: 'missingInepMicrodata',
    required: false,
    description: 'Retorna apenas questões sem vínculo com microdados do INEP',
    example: false,
  })
  @ApiOkResponse({
    description:
      'Lista de questões retornada com sucesso. O formato pode variar entre resumido e detalhado conforme o parâmetro detailed.',
    schema: {
      oneOf: [
        { $ref: '#/components/schemas/QuestionsSummaryResponseDto' },
        { $ref: '#/components/schemas/QuestionsDetailedResponseDto' },
      ],
    },
  })
  list(@Query() query: QueryQuestionsDto) {
    return this.questionService.list(query);
  }

  @Get(':id')
  @ApiOperation({
    summary: 'Obtém uma questão completa por id',
    description:
      'Retorna os dados completos da questão, incluindo exame, skill, competência, área, blocos, alternativas, disciplinas, objetos de conhecimento, conteúdos relacionados, microdados do INEP e classificações de IA.',
  })
  @ApiParam({
    name: 'id',
    required: true,
    description: 'UUID da questão',
    example: '550e8400-e29b-41d4-a716-446655440000',
  })
  @ApiOkResponse({
    description: 'Questão encontrada com sucesso.',
    type: QuestionDetailResponseDto,
  })
  getById(@Param('id', new ParseUUIDPipe()) id: string) {
    return this.questionService.getById(id);
  }
}
