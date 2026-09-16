import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from 'src/prisma/prisma.service';
import { QueryQuestionsDto } from './dto/query-questions.dto';
import { buildPaginatedResponse } from 'src/common/dto/pagination.dto';

type QuestionSummaryItem = {
  id: string;
  examId: string;
  number: number;
  area: string;
  tpLingua: number;
  skillId: string | null;
  inepItemCode: string | null;
  exam: {
    id: string;
    year: number;
    day: string;
    type: string;
  };
  skill: {
    id: string;
    code: string;
    competency: {
      id: string;
      code: number;
    };
  } | null;
  blocks: Array<{
    type: string;
    text: string | null;
  }>;
};

@Injectable()
export class QuestionService {
  constructor(private readonly prisma: PrismaService) {}

  async list(query: QueryQuestionsDto) {
    const page = query.page ?? 1;
    const limit = query.limit ?? 20;

    if (page < 1) {
      throw new BadRequestException('page deve ser maior ou igual a 1.');
    }

    if (limit < 1 || limit > 100) {
      throw new BadRequestException('limit deve estar entre 1 e 100.');
    }

    this.validateQuery(query);

    const skip = (page - 1) * limit;
    const where = this.buildWhere(query);

    if (query.detailed) {
      return this.listDetailed(where, page, limit, skip);
    }

    return this.listSummary(where, page, limit, skip);
  }

  async getById(id: string) {
    const question = await this.prisma.question.findUnique({
      where: { id },
      select: {
        id: true,
        examId: true,
        number: true,
        area: true,
        tpLingua: true,
        skillId: true,
        rawJson: true,
        inepItemCode: true,
        createdAt: true,
        updatedAt: true,

        exam: {
          select: {
            id: true,
            year: true,
            day: true,
            type: true,
            createdAt: true,
            updatedAt: true,
          },
        },

        skill: {
          select: {
            id: true,
            code: true,
            description: true,
            competency: {
              select: {
                id: true,
                code: true,
                description: true,
                area: {
                  select: {
                    id: true,
                    code: true,
                    name: true,
                  },
                },
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

        questionDisciplines: {
          select: {
            discipline: {
              select: {
                id: true,
                name: true,
                area: {
                  select: {
                    id: true,
                    code: true,
                    name: true,
                  },
                },
              },
            },
          },
        },

        questionKnowledgeObjects: {
          select: {
            knowledgeObject: {
              select: {
                id: true,
                name: true,
                discipline: {
                  select: {
                    id: true,
                    name: true,
                    area: {
                      select: {
                        id: true,
                        code: true,
                        name: true,
                      },
                    },
                  },
                },
                objectContents: {
                  select: {
                    content: {
                      select: {
                        id: true,
                        name: true,
                      },
                    },
                  },
                  orderBy: {
                    content: {
                      name: 'asc',
                    },
                  },
                },
              },
            },
          },
        },

        inepMicrodata: {
          select: {
            id: true,
            year: true,
            application: true,
            day: true,
            coPosicao: true,
            sgArea: true,
            coItem: true,
            coHabilidade: true,
            coProva: true,
            tpLingua: true,
          },
        },

        aiClassifications: {
          orderBy: {
            createdAt: 'desc',
          },
          select: {
            id: true,
            modelName: true,
            modelVersion: true,
            confidence: true,
            rationale: true,
            createdAt: true,

            suggestedSkill: {
              select: {
                id: true,
                code: true,
              },
            },

            suggestedDiscipline: {
              select: {
                id: true,
                name: true,
              },
            },

            suggestedKnowledgeObject: {
              select: {
                id: true,
                name: true,
              },
            },

            suggestedContent: {
              select: {
                id: true,
                name: true,
              },
            },

            validations: {
              orderBy: {
                validatedAt: 'desc',
              },
              select: {
                id: true,
                status: true,
                notes: true,
                validatedAt: true,
                validatedByUser: {
                  select: {
                    id: true,
                    name: true,
                    email: true,
                    role: true,
                  },
                },
              },
            },
          },
        },
      },
    });

    if (!question) {
      throw new NotFoundException('Question not found');
    }

    return question;
  }

  private async listSummary(
    where: Prisma.QuestionWhereInput,
    page: number,
    limit: number,
    skip: number,
  ) {
    const [items, total] = await this.prisma.$transaction([
      this.prisma.question.findMany({
        where,
        skip,
        take: limit,
        orderBy: this.buildOrderBy(),
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
            take: 3,
            select: {
              type: true,
              text: true,
            },
          },
        },
      }),
      this.prisma.question.count({ where }),
    ]);

    const mapped = (items as QuestionSummaryItem[]).map((q) => {
      const firstTextBlock =
        q.blocks.find((b) => b.type === 'TEXT')?.text ?? '';

      return {
        id: q.id,
        examId: q.examId,
        number: q.number,
        area: q.area,
        tpLingua: q.tpLingua,
        skillId: q.skillId,
        hasSkill: !!q.skillId,
        inepItemCode: q.inepItemCode,
        exam: q.exam,
        skill: q.skill,
        previewText: firstTextBlock.slice(0, 160),
      };
    });

    return buildPaginatedResponse(mapped, total, page, limit);
  }

  async listDetailed(
    where: Prisma.QuestionWhereInput,
    page: number,
    limit: number,
    skip: number,
  ) {
    const [items, total] = await this.prisma.$transaction([
      this.prisma.question.findMany({
        where,
        skip,
        take: limit,
        orderBy: this.buildOrderBy(),
        select: {
          id: true,
          examId: true,
          number: true,
          area: true,
          tpLingua: true,
          skillId: true,
          inepItemCode: true,
          createdAt: true,
          updatedAt: true,

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
              description: true,
              competency: {
                select: {
                  id: true,
                  code: true,
                  description: true,
                  area: {
                    select: {
                      id: true,
                      code: true,
                      name: true,
                    },
                  },
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

          questionDisciplines: {
            select: {
              discipline: {
                select: {
                  id: true,
                  name: true,
                  area: {
                    select: {
                      id: true,
                      code: true,
                      name: true,
                    },
                  },
                },
              },
            },
          },

          questionKnowledgeObjects: {
            select: {
              knowledgeObject: {
                select: {
                  id: true,
                  name: true,
                  discipline: {
                    select: {
                      id: true,
                      name: true,
                      area: {
                        select: {
                          id: true,
                          code: true,
                          name: true,
                        },
                      },
                    },
                  },
                },
              },
            },
          },
        },
      }),
      this.prisma.question.count({ where }),
    ]);

    return buildPaginatedResponse(items, total, page, limit);
  }

  private buildWhere(query: QueryQuestionsDto): Prisma.QuestionWhereInput {
    const and: Prisma.QuestionWhereInput[] = [];

    const normalizedSkillCode = this.normalizeSkillCode(
      (query.skillCode ?? query.code)?.toString(),
    );

    const normalizedCompetencyCode = this.parseCompetencyCode(
      query.competencyCode?.toString(),
    );

    /**
     * FILTROS DIRETOS DA QUESTÃO
     */
    if (query.area) {
      and.push({ area: query.area });
    }

    if (query.tpLingua !== undefined) {
      and.push({ tpLingua: query.tpLingua });
    }

    if (query.number !== undefined) {
      and.push({ number: query.number });
    }

    if (query.inepItemCode) {
      and.push({ inepItemCode: query.inepItemCode.trim() });
    }

    if (query.missingInepMicrodata) {
      and.push({ inepItemMicrodataId: null });
    }

    /**
     * FILTROS DE EXAME
     */
    if (query.examId) {
      and.push({ examId: query.examId });
    } else if (query.year || query.day || query.type) {
      and.push({
        exam: {
          is: {
            ...(query.year ? { year: query.year } : {}),
            ...(query.day ? { day: query.day } : {}),
            ...(query.type ? { type: query.type } : {}),
          },
        },
      });
    }

    /**
     * FILTROS DE SKILL / COMPETÊNCIA
     */
    if (query.missingSkill) {
      and.push({ skillId: null });
    } else {
      if (query.skillId) {
        and.push({ skillId: query.skillId });
      }

      if (normalizedSkillCode) {
        and.push({
          skill: {
            is: {
              code: normalizedSkillCode,
            },
          },
        });
      }

      if (query.competencyId) {
        and.push({
          skill: {
            is: {
              competencyId: query.competencyId,
            },
          },
        });
      }

      if (normalizedCompetencyCode !== undefined) {
        and.push({
          skill: {
            is: {
              competency: {
                is: {
                  code: normalizedCompetencyCode,
                  area: {
                    is: {
                      code: query.area!,
                    },
                  },
                },
              },
            },
          },
        });
      }
    }

    /**
     * FILTROS DE DISCIPLINA
     */
    if (query.missingDiscipline) {
      and.push({
        questionDisciplines: {
          none: {},
        },
      });
    } else if (query.disciplineId) {
      and.push({
        questionDisciplines: {
          some: {
            disciplineId: query.disciplineId,
          },
        },
      });
    }

    /**
     * FILTROS DE KNOWLEDGE OBJECT / CONTENT
     */
    if (query.missingKnowledgeObject) {
      and.push({
        questionKnowledgeObjects: {
          none: {},
        },
      });
    } else {
      if (query.knowledgeObjectId) {
        and.push({
          questionKnowledgeObjects: {
            some: {
              knowledgeObjectId: query.knowledgeObjectId,
            },
          },
        });
      }

      if (query.contentId) {
        and.push({
          questionKnowledgeObjects: {
            some: {
              knowledgeObject: {
                objectContents: {
                  some: {
                    contentId: query.contentId,
                  },
                },
              },
            },
          },
        });
      }
    }

    if (and.length === 0) {
      return {};
    }

    return { AND: and };
  }

  private buildOrderBy(): Prisma.QuestionOrderByWithRelationInput[] {
    return [
      { exam: { year: 'desc' } },
      { exam: { day: 'asc' } },
      { number: 'asc' },
      { tpLingua: 'asc' },
    ];
  }

  private validateQuery(query: QueryQuestionsDto) {
    const hasSkillId = !!query.skillId;
    const hasSkillCode = !!(query.skillCode ?? query.code);
    const hasCompetencyId = !!query.competencyId;
    const hasCompetencyCode = !!query.competencyCode;

    if (
      query.missingSkill &&
      (hasSkillId || hasSkillCode || hasCompetencyId || hasCompetencyCode)
    ) {
      throw new BadRequestException(
        'missingSkill não pode ser combinado com skillId, skillCode, competencyId ou competencyCode.',
      );
    }

    if (hasCompetencyId && hasCompetencyCode) {
      throw new BadRequestException(
        'Use apenas um: competencyId OU competencyCode.',
      );
    }

    if (hasCompetencyCode && !query.area) {
      throw new BadRequestException(
        'Para usar competencyCode, informe também area.',
      );
    }

    if (query.examId && (query.year || query.day || query.type)) {
      throw new BadRequestException(
        'Use examId sozinho ou use year/day/type. Evite combinar ambos.',
      );
    }

    if (query.missingDiscipline && query.disciplineId) {
      throw new BadRequestException(
        'missingDiscipline não pode ser combinado com disciplineId.',
      );
    }

    if (
      query.missingKnowledgeObject &&
      (query.knowledgeObjectId || query.contentId)
    ) {
      throw new BadRequestException(
        'missingKnowledgeObject não pode ser combinado com knowledgeObjectId ou contentId.',
      );
    }
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
}
