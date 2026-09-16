import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from 'src/prisma/prisma.service';
import { CreateSimulationDto } from './dto/create-simulation.dto';
import { GenerateSimulationDto } from './dto/generate-simulation.dto';
import { ListSimulationsQueryDto } from './dto/list-simulations.query.dto';
import { AddSimulationQuestionsDto } from './dto/add-simulation-questions.dto';
import { SimulationQuestionFiltersDto } from './dto/simulation-question-filters.dto';
import { buildPaginatedResponse } from 'src/common/dto/pagination.dto';

@Injectable()
export class SimulationsService {
  constructor(private readonly prisma: PrismaService) {}

  async create(userId: string, dto: CreateSimulationDto) {
    const questionIds = dto.questionIds ?? [];

    if (questionIds.length > 0) {
      await this.ensureQuestionsExist(questionIds);
    }

    const simulation = await this.prisma.$transaction(async (tx) => {
      const created = await tx.simulation.create({
        data: {
          userId,
          title: dto.title ?? null,
          filters: dto.filters
            ? (dto.filters as Prisma.InputJsonValue)
            : Prisma.JsonNull,
        },
        select: {
          id: true,
          userId: true,
          title: true,
          filters: true,
          createdAt: true,
        },
      });

      if (questionIds.length > 0) {
        await tx.simulationQuestion.createMany({
          data: questionIds.map((questionId, index) => ({
            simulationId: created.id,
            questionId,
            order: index + 1,
          })),
        });
      }

      return created;
    });

    return this.getById(userId, simulation.id);
  }

  async list(userId: string, query: ListSimulationsQueryDto) {
    const page = query.page ?? 1;
    const limit = query.limit ?? 20;
    const skip = (page - 1) * limit;

    if (page < 1) {
      throw new BadRequestException('page deve ser maior ou igual a 1.');
    }

    if (limit < 1 || limit > 100) {
      throw new BadRequestException('limit deve estar entre 1 e 100.');
    }

    const where: Prisma.SimulationWhereInput = { userId };

    const [items, total] = await this.prisma.$transaction([
      this.prisma.simulation.findMany({
        where,
        skip,
        take: limit,
        orderBy: {
          createdAt: 'desc',
        },
        select: {
          id: true,
          userId: true,
          title: true,
          filters: true,
          createdAt: true,
          _count: {
            select: {
              simulationQuestions: true,
              attemptSessions: true,
            },
          },
        },
      }),
      this.prisma.simulation.count({ where }),
    ]);

    return buildPaginatedResponse(items, total, page, limit);
  }

  async getById(userId: string, id: string) {
    const simulation = await this.prisma.simulation.findFirst({
      where: { id, userId },
      select: {
        id: true,
        userId: true,
        title: true,
        filters: true,
        createdAt: true,
        _count: {
          select: {
            simulationQuestions: true,
            attemptSessions: true,
          },
        },
      },
    });

    if (!simulation) {
      throw new NotFoundException('Simulado não encontrado.');
    }

    return simulation;
  }

  async getQuestions(userId: string, id: string) {
    await this.ensureSimulationExists(userId, id);

    const items = await this.prisma.simulationQuestion.findMany({
      where: { simulationId: id },
      orderBy: { order: 'asc' },
      select: {
        order: true,
        question: {
          select: {
            id: true,
            examId: true,
            number: true,
            area: true,
            tpLingua: true,
            skillId: true,
            inepItemCode: true,
            exam: {
              select: {
                id: true,
                year: true,
                day: true,
                type: true,
              },
            },
            skill: {
              select: {
                id: true,
                code: true,
                competency: {
                  select: {
                    id: true,
                    code: true,
                  },
                },
              },
            },
            blocks: {
              orderBy: { order: 'asc' },
              select: {
                id: true,
                type: true,
                order: true,
                text: true,
                imageUrl: true,
              },
            },
            alternatives: {
              orderBy: { letter: 'asc' },
              select: {
                id: true,
                letter: true,
                text: true,
              },
            },
          },
        },
      },
    });

    return {
      total: items.length,
      items,
    };
  }

  async generate(userId: string, dto: GenerateSimulationDto) {
    this.validateGenerateDto(dto);

    if (dto.strategy === 'manual') {
      const questionIds = dto.questionIds ?? [];
      if (questionIds.length === 0) {
        throw new BadRequestException(
          'questionIds é obrigatório na estratégia manual.',
        );
      }

      await this.ensureQuestionsExist(questionIds);

      const simulation = await this.create(userId, {
        title: dto.title,
        filters: dto.filters,
        questionIds,
      });
      return {
        message: `Simulado manual criado com ${questionIds.length} questão(ões).`,
        strategy: dto.strategy,
        requestedQuantity: questionIds.length,
        returnedQuantity: questionIds.length,
        simulation,
      };
    }

    const where = await this.buildQuestionWhere(dto.filters);

    const candidates = await this.prisma.question.findMany({
      where,
      select: {
        id: true,
        number: true,
        tpLingua: true,
        exam: {
          select: {
            day: true,
            year: true,
          },
        },
      },
      orderBy: [
        { exam: { year: 'desc' } },
        { exam: { day: 'asc' } },
        { number: 'asc' },
        { tpLingua: 'asc' },
      ],
    });

    if (candidates.length === 0) {
      throw new NotFoundException(
        'Nenhuma questão encontrada para os filtros informados.',
      );
    }

    let selectedIds: string[] = [];
    let message = '';

    if (dto.strategy === 'exact_exam') {
      selectedIds = candidates.map((q) => q.id);
      message = `Simulado gerado com ${selectedIds.length} questão(ões) usando a estratégia exact_exam.`;
    }

    if (dto.strategy === 'random') {
      if (!dto.quantity) {
        throw new BadRequestException(
          'quantity é obrigatório para a estratégia random.',
        );
      }
      const shuffled = this.shuffleArray([...candidates]);
      if (dto.quantity > candidates.length) {
        selectedIds = shuffled.map((q) => q.id);
        message =
          `Foram solicitadas ${dto.quantity} questão(ões), ` +
          `mas só existem ${candidates.length} para os filtros informados. ` +
          `O simulado foi criado com a quantidade disponível no banco.`;
      } else {
        selectedIds = shuffled.slice(0, dto.quantity).map((q) => q.id);
        message = `Simulado random criado com ${selectedIds.length} questão(ões).`;
      }

    }

    const simulation = await this.create(userId, {
      title: dto.title,
      filters: dto.filters,
      questionIds: selectedIds,
    });
    return {
      message,
      strategy: dto.strategy,
      requestedQuantity: dto.quantity ?? null,
      returnedQuantity: selectedIds.length,
      availableQuantity: candidates.length,
      simulation,
    };
  }

  async addQuestions(userId: string, id: string, dto: AddSimulationQuestionsDto) {
    await this.ensureSimulationExists(userId, id);
    await this.ensureQuestionsExist(dto.questionIds);

    const existing = await this.prisma.simulationQuestion.findMany({
      where: {
        simulationId: id,
        questionId: {
          in: dto.questionIds,
        },
      },
      select: {
        questionId: true,
      },
    });

    if (existing.length > 0) {
      throw new BadRequestException(
        `As seguintes questões já pertencem ao simulado: ${existing
          .map((e) => e.questionId)
          .join(', ')}`,
      );
    }

    const lastOrderRow = await this.prisma.simulationQuestion.findFirst({
      where: { simulationId: id },
      orderBy: { order: 'desc' },
      select: { order: true },
    });

    const startOrder = (lastOrderRow?.order ?? 0) + 1;

    await this.prisma.simulationQuestion.createMany({
      data: dto.questionIds.map((questionId, index) => ({
        simulationId: id,
        questionId,
        order: startOrder + index,
      })),
    });

    return this.getQuestions(userId, id);
  }

  async removeQuestion(userId: string, id: string, questionId: string) {
    await this.ensureSimulationExists(userId, id);

    const row = await this.prisma.simulationQuestion.findUnique({
      where: {
        simulationId_questionId: {
          simulationId: id,
          questionId,
        },
      },
      select: {
        simulationId: true,
        questionId: true,
        order: true,
      },
    });

    if (!row) {
      throw new NotFoundException(
        'A questão informada não pertence a este simulado.',
      );
    }

    await this.prisma.$transaction(async (tx) => {
      await tx.simulationQuestion.delete({
        where: {
          simulationId_questionId: {
            simulationId: id,
            questionId,
          },
        },
      });

      const remaining = await tx.simulationQuestion.findMany({
        where: { simulationId: id },
        orderBy: { order: 'asc' },
        select: { questionId: true },
      });

      for (let i = 0; i < remaining.length; i++) {
        await tx.simulationQuestion.update({
          where: {
            simulationId_questionId: {
              simulationId: id,
              questionId: remaining[i].questionId,
            },
          },
          data: {
            order: i + 1,
          },
        });
      }
    });

    return {
      message: 'Question removed from simulation successfully.',
    };
  }

  async renameTitle(userId: string, id: string, title: string) {
    await this.ensureSimulationExists(userId, id);

    const updated = await this.prisma.simulation.update({
      where: { id },
      data: {
        title,
      },
      select: {
        id: true,
        userId: true,
        title: true,
        filters: true,
        createdAt: true,
        _count: {
          select: {
            simulationQuestions: true,
            attemptSessions: true,
          },
        },
      },
    });

    return {
      message: 'Simulation title updated successfully.',
      simulation: updated,
    };
  }

  private async ensureSimulationExists(userId: string, id: string) {
    const simulation = await this.prisma.simulation.findFirst({
      where: { id, userId },
      select: { id: true },
    });

    if (!simulation) {
      throw new NotFoundException('Simulado não encontrado.');
    }
  }

  private async ensureQuestionsExist(questionIds: string[]) {
    const uniqueIds = [...new Set(questionIds)];

    const found = await this.prisma.question.findMany({
      where: {
        id: {
          in: uniqueIds,
        },
      },
      select: {
        id: true,
      },
    });

    const foundIds = new Set(found.map((q) => q.id));
    const missing = uniqueIds.filter((id) => !foundIds.has(id));

    if (missing.length > 0) {
      throw new NotFoundException(
        `As seguintes questões não foram encontradas: ${missing.join(', ')}`,
      );
    }
  }

  private validateGenerateDto(dto: GenerateSimulationDto) {
    if (dto.strategy === 'exact_exam') {
      if (!dto.filters.type || !dto.filters.year) {
        throw new BadRequestException(
          'Na estratégia exact_exam, filters.type e filters.year são obrigatórios.',
        );
      }
    }

    if (dto.strategy === 'random') {
      if (!dto.quantity) {
        throw new BadRequestException(
          'Na estratégia random, quantity é obrigatório.',
        );
      }
    }

    if (dto.strategy === 'manual') {
      if (!dto.questionIds || dto.questionIds.length === 0) {
        throw new BadRequestException(
          'Na estratégia manual, questionIds é obrigatório.',
        );
      }
    }

    if (
      dto.filters.examId &&
      (dto.filters.year || dto.filters.day || dto.filters.type)
    ) {
      throw new BadRequestException(
        'Use examId sozinho ou use year/day/type nos filtros. Evite combinar ambos.',
      );
    }

    if (dto.filters.competencyCode && !dto.filters.area) {
      throw new BadRequestException(
        'Para usar competencyCode nos filtros, informe também area.',
      );
    }
  }

  private async buildQuestionWhere(
    filters: SimulationQuestionFiltersDto,
  ): Promise<Prisma.QuestionWhereInput> {
    const and: Prisma.QuestionWhereInput[] = [];

    const normalizedSkillCode = this.normalizeSkillCode(filters.skillCode);
    const normalizedCompetencyCode = this.parseCompetencyCode(
      filters.competencyCode,
    );

    /**
     * FILTROS DIRETOS DA QUESTÃO
     */
    if (filters.area) {
      and.push({ area: filters.area });
    }

    if (filters.tpLingua !== undefined) {
      and.push({ tpLingua: filters.tpLingua });
    }

    if (filters.number !== undefined) {
      and.push({ number: filters.number });
    }

    /**
     * FILTROS DE EXAME
     */
    if (filters.examId) {
      and.push({ examId: filters.examId });
    } else if (filters.year || filters.day || filters.type) {
      and.push({
        exam: {
          is: {
            ...(filters.year ? { year: filters.year } : {}),
            ...(filters.day ? { day: filters.day } : {}),
            ...(filters.type ? { type: filters.type } : {}),
          },
        },
      });
    }

    /**
     * RESOLUÇÃO ROBUSTA DE COMPETÊNCIA
     */
    let resolvedCompetencyId: string | undefined;

    if (filters.competencyId) {
      const competency = await this.prisma.competency.findUnique({
        where: { id: filters.competencyId },
        select: {
          id: true,
          area: {
            select: {
              code: true,
            },
          },
        },
      });

      if (!competency) {
        throw new NotFoundException('Competência não encontrada.');
      }

      if (filters.area && competency.area.code !== filters.area) {
        throw new BadRequestException(
          `A competência informada não pertence à área ${filters.area}.`,
        );
      }

      resolvedCompetencyId = competency.id;
    } else if (normalizedCompetencyCode !== undefined) {
      if (!filters.area) {
        throw new BadRequestException(
          'Para usar competencyCode, informe também area.',
        );
      }

      const competency = await this.prisma.competency.findFirst({
        where: {
          code: normalizedCompetencyCode,
          area: {
            is: {
              code: filters.area,
            },
          },
        },
        select: {
          id: true,
        },
      });

      if (!competency) {
        throw new NotFoundException(
          `Competência ${filters.competencyCode} não encontrada para a área ${filters.area}.`,
        );
      }

      resolvedCompetencyId = competency.id;
    }

    /**
     * RESOLUÇÃO ROBUSTA DE SKILL / HABILIDADE
     */
    if (filters.skillId) {
      const skill = await this.prisma.skill.findUnique({
        where: { id: filters.skillId },
        select: {
          id: true,
          competencyId: true,
          competency: {
            select: {
              area: {
                select: {
                  code: true,
                },
              },
            },
          },
        },
      });

      if (!skill) {
        throw new NotFoundException('Habilidade não encontrada.');
      }

      if (resolvedCompetencyId && skill.competencyId !== resolvedCompetencyId) {
        throw new BadRequestException(
          'A habilidade informada não pertence à competência informada.',
        );
      }

      if (filters.area && skill.competency.area.code !== filters.area) {
        throw new BadRequestException(
          `A habilidade informada não pertence à área ${filters.area}.`,
        );
      }

      and.push({ skillId: skill.id });
    } else if (normalizedSkillCode) {
      /**
       * Cenários cobertos:
       * 1. area + competency + skill
       * 2. area + skill
       * 3. competency + skill
       * 4. skill sozinho
       */

      if (resolvedCompetencyId) {
        const skill = await this.prisma.skill.findFirst({
          where: {
            code: normalizedSkillCode,
            competencyId: resolvedCompetencyId,
          },
          select: {
            id: true,
          },
        });

        if (!skill) {
          throw new NotFoundException(
            `Habilidade ${normalizedSkillCode} não encontrada para a competência informada.`,
          );
        }

        and.push({ skillId: skill.id });
      } else if (filters.area) {
        and.push({
          skill: {
            is: {
              code: normalizedSkillCode,
              competency: {
                is: {
                  area: {
                    is: {
                      code: filters.area,
                    },
                  },
                },
              },
            },
          },
        });
      } else {
        and.push({
          skill: {
            is: {
              code: normalizedSkillCode,
            },
          },
        });
      }
    } else if (resolvedCompetencyId) {
      and.push({
        skill: {
          is: {
            competencyId: resolvedCompetencyId,
          },
        },
      });
    }

    /**
     * FILTRO DE DISCIPLINA
     */
    if (filters.disciplineId) {
      and.push({
        questionDisciplines: {
          some: {
            disciplineId: filters.disciplineId,
          },
        },
      });
    }

    /**
     * FILTRO DE KNOWLEDGE OBJECT
     */
    if (filters.knowledgeObjectId) {
      and.push({
        questionKnowledgeObjects: {
          some: {
            knowledgeObjectId: filters.knowledgeObjectId,
          },
        },
      });
    }

    /**
     * FILTRO DE CONTENT
     */
    if (filters.contentId) {
      and.push({
        questionKnowledgeObjects: {
          some: {
            knowledgeObject: {
              objectContents: {
                some: {
                  contentId: filters.contentId,
                },
              },
            },
          },
        },
      });
    }

    if (and.length === 0) {
      return {};
    }

    return { AND: and };
  }

  private normalizeSkillCode(raw?: string): string | undefined {
    const value = raw?.trim();
    if (!value) return undefined;

    const upper = value.toUpperCase();
    return upper.startsWith('H') ? upper : `H${upper}`;
  }

  private parseCompetencyCode(raw?: string): number | undefined {
    const value = raw?.trim();
    if (!value) return undefined;

    const match = value.match(/^C?(\d+)$/i);
    if (!match) {
      throw new BadRequestException(
        'competencyCode inválido. Use C1, C2... ou 1, 2...',
      );
    }

    return Number(match[1]);
  }

  private shuffleArray<T>(array: T[]): T[] {
    for (let i = array.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [array[i], array[j]] = [array[j], array[i]];
    }
    return array;
  }
}
