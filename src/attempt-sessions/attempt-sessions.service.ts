import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import {
  AttemptCorrectionStatus,
  AttemptSessionStatus,
  AttemptSessionType,
  Prisma,
} from '@prisma/client';
import { PrismaService } from 'src/prisma/prisma.service';

import { CreateAvulsoAttemptSessionDto } from './dto/create-avulso-attempt-session.dto';
import { CreateSimulationAttemptSessionDto } from './dto/create-simulation-attempt-session.dto';
import { CreateExamAttemptSessionDto } from './dto/create-exam-attempt-session.dto';
import { SubmitAttemptAnswerDto } from './dto/submit-attempt-answer.dto';

@Injectable()
export class AttemptSessionsService {
  constructor(private readonly prisma: PrismaService) {}

  async createAvulsoSession(
    userId: string,
    dto: CreateAvulsoAttemptSessionDto,
  ) {
    const questionsArgs = {
      where: {
        id: {
          in: dto.questionIds,
        },
      },
      select: {
        id: true,
      },
    } satisfies Prisma.QuestionFindManyArgs;

    const questions = await this.prisma.question.findMany(questionsArgs);

    if (questions.length !== dto.questionIds.length) {
      throw new BadRequestException(
        'Uma ou mais questões informadas não existem.',
      );
    }

    const createSessionArgs = {
      data: {
        userId,
        type: AttemptSessionType.AVULSO,
        title: dto.title,
        totalQuestions: dto.questionIds.length,
        answers: {
          create: dto.questionIds.map((questionId, index) => ({
            questionId,
            questionOrder: index + 1,
          })),
        },
      },
      include: {
        answers: {
          include: {
            question: {
              include: {
                exam: true,
                skill: {
                  include: {
                    competency: {
                      include: {
                        area: true,
                      },
                    },
                  },
                },
              },
            },
          },
        },
      },
    } satisfies Prisma.AttemptSessionCreateArgs;

    const session = await this.prisma.attemptSession.create(createSessionArgs);

    // Alteracao Codex: sessoes em andamento nunca devem expor gabarito ao aluno.
    return this.sanitizeInProgressPayload(session, session.status);
  }

  async createSimulationSession(
    userId: string,
    dto: CreateSimulationAttemptSessionDto,
  ) {
    const simulationArgs = {
      where: {
        id: dto.simulationId,
        userId,
      },
      include: {
        simulationQuestions: {
          orderBy: {
            order: 'asc',
          },
          select: {
            questionId: true,
            order: true,
          },
        },
      },
    } satisfies Prisma.SimulationFindFirstArgs;

    const simulation = await this.prisma.simulation.findFirst(simulationArgs);

    if (!simulation) {
      throw new NotFoundException(
        'Simulado não encontrado ou não pertence ao usuário informado.',
      );
    }

    if (simulation.simulationQuestions.length === 0) {
      throw new BadRequestException('Este simulado não possui questões.');
    }

    const createSessionArgs = {
      data: {
        userId,
        type: AttemptSessionType.SIMULATION,
        simulationId: simulation.id,
        title: dto.title ?? simulation.title ?? 'Resolução de simulado',
        totalQuestions: simulation.simulationQuestions.length,
        metadata: {
          source: 'simulation',
          filters: simulation.filters,
        },
        answers: {
          create: simulation.simulationQuestions.map((item) => ({
            questionId: item.questionId,
            questionOrder: item.order,
          })),
        },
      },
      include: {
        answers: {
          orderBy: {
            questionOrder: 'asc',
          },
          include: {
            question: {
              include: {
                exam: true,
                alternatives: true,
                blocks: true,
                skill: {
                  include: {
                    competency: {
                      include: {
                        area: true,
                      },
                    },
                  },
                },
              },
            },
          },
        },
      },
    } satisfies Prisma.AttemptSessionCreateArgs;

    const session = await this.prisma.attemptSession.create(createSessionArgs);

    // Alteracao Codex: remove isCorrect/correctLetter/txGabarito enquanto a sessao esta em andamento.
    return this.sanitizeInProgressPayload(session, session.status);
  }

  async createExamSession(userId: string, dto: CreateExamAttemptSessionDto) {
    const examArgs = {
      where: {
        id: dto.examId,
      },
      include: {
        questions: {
          orderBy: {
            number: 'asc',
          },
          select: {
            id: true,
            number: true,
            tpLingua: true,
          },
        },
      },
    } satisfies Prisma.ExamFindUniqueArgs;

    const exam = await this.prisma.exam.findUnique(examArgs);

    if (!exam) {
      throw new NotFoundException('Prova ENEM não encontrada.');
    }

    if (exam.questions.length === 0) {
      throw new BadRequestException(
        'Esta prova ENEM não possui questões cadastradas.',
      );
    }

    const createSessionArgs = {
      data: {
        userId,
        type: AttemptSessionType.EXAM,
        examId: exam.id,
        title: dto.title ?? `ENEM ${exam.year} ${exam.type} ${exam.day}`,
        totalQuestions: exam.questions.length,
        metadata: {
          source: 'exam',
          exam: {
            id: exam.id,
            year: exam.year,
            type: exam.type,
            day: exam.day,
          },
        },
        answers: {
          create: exam.questions.map((question, index) => ({
            questionId: question.id,
            questionOrder: index + 1,
          })),
        },
      },
      include: {
        answers: {
          orderBy: {
            questionOrder: 'asc',
          },
          include: {
            question: {
              include: {
                exam: true,
                alternatives: true,
                blocks: true,
                inepMicrodata: {
                  select: {
                    id: true,
                    year: true,
                    application: true,
                    day: true,
                    coPosicao: true,
                    sgArea: true,
                    coHabilidade: true,
                    txCor: true,
                    tpLingua: true,
                  },
                },
                skill: {
                  include: {
                    competency: {
                      include: {
                        area: true,
                      },
                    },
                  },
                },
              },
            },
          },
        },
      },
    } satisfies Prisma.AttemptSessionCreateArgs;

    const session = await this.prisma.attemptSession.create(createSessionArgs);

    // Alteracao Codex: remove isCorrect/correctLetter/txGabarito enquanto a sessao esta em andamento.
    return this.sanitizeInProgressPayload(session, session.status);
  }

  async findOne(userId: string, sessionId: string) {
    const sessionArgs = {
      where: {
        id: sessionId,
        userId,
      },
      include: {
        answers: {
          orderBy: {
            questionOrder: 'asc',
          },
          include: {
            selectedAlternative: true,
            question: {
              include: {
                exam: true,
                skill: {
                  include: {
                    competency: {
                      include: {
                        area: true,
                      },
                    },
                  },
                },
                alternatives: true,
                blocks: true,
              },
            },
          },
        },
      },
    } satisfies Prisma.AttemptSessionFindFirstArgs;

    const session = await this.prisma.attemptSession.findFirst(sessionArgs);

    if (!session) {
      throw new NotFoundException('Sessão não encontrada.');
    }

    // Alteracao Codex: a leitura da sessao respeita o status antes de devolver dados sensiveis.
    return this.sanitizeInProgressPayload(session, session.status);
  }

  async submitAnswer(
    userId: string,
    sessionId: string,
    questionId: string,
    dto: SubmitAttemptAnswerDto,
  ) {
    const sessionArgs = {
      where: {
        id: sessionId,
        userId,
      },
    } satisfies Prisma.AttemptSessionFindFirstArgs;

    const session = await this.prisma.attemptSession.findFirst(sessionArgs);

    if (!session) {
      throw new NotFoundException('Sessão não encontrada.');
    }

    if (session.status !== AttemptSessionStatus.IN_PROGRESS) {
      throw new BadRequestException('Esta sessão já foi finalizada.');
    }

    const answerArgs = {
      where: {
        attemptSessionId: sessionId,
        questionId,
      },
      include: {
        question: {
          include: {
            alternatives: true,
          },
        },
      },
    } satisfies Prisma.AttemptAnswerFindFirstArgs;

    const answer = await this.prisma.attemptAnswer.findFirst(answerArgs);

    if (!answer) {
      throw new NotFoundException('Questão não pertence à sessão.');
    }

    let selectedLetter: string | null = null;

    if (!dto.isSkipped && dto.selectedAlternativeId) {
      const alternative = answer.question.alternatives.find(
        (alt) => alt.id === dto.selectedAlternativeId,
      );

      if (!alternative) {
        throw new BadRequestException('Alternativa não pertence à questão.');
      }

      selectedLetter = alternative.letter;
    }

    if (dto.isSkipped) {
      selectedLetter = null;
    }

    const updateAnswerArgs = {
      where: {
        id: answer.id,
      },
      data: {
        selectedAlternativeId: dto.isSkipped ? null : dto.selectedAlternativeId,
        selectedLetter,
        isSkipped: dto.isSkipped ?? false,
        timeSpentMs: dto.timeSpentMs ?? 0,
        reviewCount: dto.reviewCount ?? 0,
        confidenceLevel: dto.confidenceLevel,
        answeredAt: new Date(),
      },
      include: {
        selectedAlternative: true,
        question: {
          include: {
            alternatives: true,
            exam: true,
            skill: {
              include: {
                competency: {
                  include: {
                    area: true,
                  },
                },
              },
            },
          },
        },
      },
    } satisfies Prisma.AttemptAnswerUpdateArgs;

    const updatedAnswer =
      await this.prisma.attemptAnswer.update(updateAnswerArgs);

    const sessionAnswersArgs = {
      where: {
        attemptSessionId: sessionId,
      },
      select: {
        selectedAlternativeId: true,
        isSkipped: true,
        timeSpentMs: true,
      },
    } satisfies Prisma.AttemptAnswerFindManyArgs;

    const sessionAnswers =
      await this.prisma.attemptAnswer.findMany(sessionAnswersArgs);

    const answeredQuestions = sessionAnswers.filter(
      (answerItem) => answerItem.selectedAlternativeId || answerItem.isSkipped,
    ).length;

    const skippedQuestions = sessionAnswers.filter(
      (answerItem) => answerItem.isSkipped,
    ).length;

    const totalTimeSpentMs = sessionAnswers.reduce(
      (acc, current) => acc + current.timeSpentMs,
      0,
    );

    const updateSessionMetricsArgs = {
      where: {
        id: sessionId,
      },
      data: {
        answeredQuestions,
        skippedQuestions,
        totalTimeSpentMs,
      },
    } satisfies Prisma.AttemptSessionUpdateArgs;

    await this.prisma.attemptSession.update(updateSessionMetricsArgs);

    // Alteracao Codex: submitAnswer ocorre sempre em IN_PROGRESS, entao o retorno tambem e sanitizado.
    return this.sanitizeInProgressPayload(
      updatedAnswer,
      AttemptSessionStatus.IN_PROGRESS,
    );
  }

  async correctSession(userId: string, sessionId: string) {
    const sessionArgs = {
      where: {
        id: sessionId,
        userId,
      },
      include: {
        answers: {
          include: {
            question: {
              include: {
                inepMicrodata: true,
              },
            },
          },
        },
      },
    } satisfies Prisma.AttemptSessionFindFirstArgs;

    const session = await this.prisma.attemptSession.findFirst(sessionArgs);

    if (!session) {
      throw new NotFoundException('Sessão não encontrada.');
    }

    if (session.status !== AttemptSessionStatus.IN_PROGRESS) {
      throw new BadRequestException(
        'Esta sessão já foi finalizada e não pode ser corrigida novamente.',
      );
    }

    if (session.answers.length === 0) {
      throw new BadRequestException(
        'Esta sessão não possui questões para corrigir.',
      );
    }

    let correctQuestions = 0;
    let wrongQuestions = 0;
    let skippedQuestions = 0;
    let missingAnswerKeyQuestions = 0;
    let annulledQuestions = 0;
    let totalTimeSpentMs = 0;

    // Alteracao Codex: a correcao inteira e atomica e usa apenas o gabarito oficial do INEP.
    const correctedSession = await this.prisma.$transaction(async (tx) => {
      const correctedAt = new Date();

      for (const answer of session.answers) {
        const question = answer.question;
        const inep = question.inepMicrodata;

        const selectedLetter = answer.selectedLetter;
        const officialAnswer = inep?.txGabarito?.trim().toUpperCase() ?? null;

        totalTimeSpentMs += answer.timeSpentMs ?? 0;

        if (inep?.inItemAban === 1) {
          annulledQuestions++;

          const updateAnnulledAnswerArgs = {
            where: {
              id: answer.id,
            },
            data: {
              isCorrect: null,
              correctLetter: officialAnswer,
              correctionStatus: AttemptCorrectionStatus.ANNULLED,
              correctedAt,
            },
          } satisfies Prisma.AttemptAnswerUpdateArgs;

          await tx.attemptAnswer.update(updateAnnulledAnswerArgs);

          continue;
        }

        if (answer.isSkipped || !selectedLetter) {
          skippedQuestions++;

          const updateSkippedAnswerArgs = {
            where: {
              id: answer.id,
            },
            data: {
              isCorrect: false,
              correctLetter: officialAnswer,
              correctionStatus: AttemptCorrectionStatus.SKIPPED,
              correctedAt,
            },
          } satisfies Prisma.AttemptAnswerUpdateArgs;

          await tx.attemptAnswer.update(updateSkippedAnswerArgs);

          continue;
        }

        if (!officialAnswer) {
          missingAnswerKeyQuestions++;

          const updateMissingAnswerKeyArgs = {
            where: {
              id: answer.id,
            },
            data: {
              isCorrect: null,
              correctLetter: null,
              correctionStatus: AttemptCorrectionStatus.MISSING_ANSWER_KEY,
              correctedAt,
            },
          } satisfies Prisma.AttemptAnswerUpdateArgs;

          await tx.attemptAnswer.update(updateMissingAnswerKeyArgs);

          continue;
        }

        const normalizedSelectedLetter = selectedLetter.trim().toUpperCase();
        const isCorrect = normalizedSelectedLetter === officialAnswer;

        if (isCorrect) {
          correctQuestions++;
        } else {
          wrongQuestions++;
        }

        const updateCorrectedAnswerArgs = {
          where: {
            id: answer.id,
          },
          data: {
            isCorrect,
            correctLetter: officialAnswer,
            correctionStatus: isCorrect
              ? AttemptCorrectionStatus.CORRECT
              : AttemptCorrectionStatus.WRONG,
            correctedAt,
          },
        } satisfies Prisma.AttemptAnswerUpdateArgs;

        await tx.attemptAnswer.update(updateCorrectedAnswerArgs);
      }

      const rawScore = correctQuestions;

      const updateCorrectedSessionArgs = {
        where: {
          id: session.id,
        },
        data: {
          status: AttemptSessionStatus.CORRECTED,
          correctedAt,
          correctQuestions,
          wrongQuestions,
          skippedQuestions,
          answeredQuestions: correctQuestions + wrongQuestions,
          totalTimeSpentMs,
          rawScore,
          scoreMethod: 'SIMPLE',
          metadata: {
            correction: {
              missingAnswerKeyQuestions,
              annulledQuestions,
              rule: 'Pontuação simples: correta = 1, errada = 0, branco = 0',
              answerKeySource: 'InepItemMicrodata.txGabarito',
            },
          },
        },
        include: {
          answers: {
            orderBy: {
              questionOrder: 'asc',
            },
            include: {
              question: {
                include: {
                  exam: true,
                  inepMicrodata: true,
                  skill: {
                    include: {
                      competency: {
                        include: {
                          area: true,
                        },
                      },
                    },
                  },
                },
              },
              selectedAlternative: true,
            },
          },
        },
      } satisfies Prisma.AttemptSessionUpdateArgs;

      return tx.attemptSession.update(updateCorrectedSessionArgs);
    });

    return {
      id: correctedSession.id,
      type: correctedSession.type,
      status: correctedSession.status,
      totalQuestions: correctedSession.totalQuestions,
      answeredQuestions: correctedSession.answeredQuestions,
      correctQuestions: correctedSession.correctQuestions,
      wrongQuestions: correctedSession.wrongQuestions,
      skippedQuestions: correctedSession.skippedQuestions,
      rawScore: correctedSession.rawScore,
      scoreMethod: correctedSession.scoreMethod,
      totalTimeSpentMs: correctedSession.totalTimeSpentMs,
      correctedAt: correctedSession.correctedAt,
      metadata: correctedSession.metadata,
      answers: correctedSession.answers.map((answer) => ({
        id: answer.id,
        questionId: answer.questionId,
        questionNumber: answer.question.number,
        area: answer.question.area,
        selectedLetter: answer.selectedLetter,
        correctLetter: answer.correctLetter,
        isCorrect: answer.isCorrect,
        correctionStatus: answer.correctionStatus,
        isSkipped: answer.isSkipped,
        timeSpentMs: answer.timeSpentMs,
        skill: answer.question.skill
          ? {
              id: answer.question.skill.id,
              code: answer.question.skill.code,
              description: answer.question.skill.description,
              competency: {
                id: answer.question.skill.competency.id,
                code: answer.question.skill.competency.code,
              },
            }
          : null,
      })),
    };
  }

  async abandonSession(userId: string, sessionId: string) {
    const sessionArgs = {
      where: {
        id: sessionId,
        userId,
      },
    } satisfies Prisma.AttemptSessionFindFirstArgs;

    const session = await this.prisma.attemptSession.findFirst(sessionArgs);

    if (!session) {
      throw new NotFoundException('Sessão não encontrada.');
    }

    if (session.status !== AttemptSessionStatus.IN_PROGRESS) {
      throw new BadRequestException(
        'Somente sessões em andamento podem ser abandonadas.',
      );
    }

    const abandonSessionArgs = {
      where: {
        id: session.id,
      },
      data: {
        status: AttemptSessionStatus.ABANDONED,
        abandonedAt: new Date(),
      },
    } satisfies Prisma.AttemptSessionUpdateArgs;

    return this.prisma.attemptSession.update(abandonSessionArgs);
  }

  private sanitizeInProgressPayload<T>(
    payload: T,
    status: AttemptSessionStatus,
  ) {
    if (status !== AttemptSessionStatus.IN_PROGRESS) {
      return payload;
    }

    // Alteracao Codex: limpeza defensiva de campos sensiveis antes de responder ao aluno.
    return this.removeSensitiveAnswerKeyFields(payload) as T;
  }

  private removeSensitiveAnswerKeyFields(value: unknown): unknown {
    if (Array.isArray(value)) {
      return value.map((item) => this.removeSensitiveAnswerKeyFields(item));
    }

    if (value === null || typeof value !== 'object') {
      return value;
    }

    const out: Record<string, unknown> = {};

    for (const [key, nestedValue] of Object.entries(value)) {
      if (
        key === 'isCorrect' ||
        key === 'correctLetter' ||
        key === 'txGabarito'
      ) {
        continue;
      }

      out[key] = this.removeSensitiveAnswerKeyFields(nestedValue);
    }

    return out;
  }
}
