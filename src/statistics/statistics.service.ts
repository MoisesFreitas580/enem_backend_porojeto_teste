import { Injectable } from '@nestjs/common';
import { AttemptSessionStatus, Prisma } from '@prisma/client';
import { PrismaService } from 'src/prisma/prisma.service';
import { StatisticsQueryDto } from './dto/statistics-query.dto';

@Injectable()
export class StatisticsService {
  constructor(private readonly prisma: PrismaService) {}

  async getOverview(userId: string, query: StatisticsQueryDto) {
    const where: Prisma.AttemptSessionWhereInput = {
      userId,
      status: AttemptSessionStatus.CORRECTED,
      ...(query.type && {
        type: query.type,
      }),
      ...(query.from || query.to
        ? {
            correctedAt: {
              ...(query.from && { gte: new Date(query.from) }),
              ...(query.to && { lte: new Date(query.to) }),
            },
          }
        : {}),
    };

    const sessions = await this.prisma.attemptSession.findMany({
      where,
      select: {
        id: true,
        type: true,
        totalQuestions: true,
        answeredQuestions: true,
        correctQuestions: true,
        wrongQuestions: true,
        skippedQuestions: true,
        totalTimeSpentMs: true,
        rawScore: true,
        correctedAt: true,
      },
    });

    const totalSessions = sessions.length;

    const totalQuestions = sessions.reduce(
      (acc, session) => acc + session.totalQuestions,
      0,
    );

    const answeredQuestions = sessions.reduce(
      (acc, session) => acc + session.answeredQuestions,
      0,
    );

    const correctQuestions = sessions.reduce(
      (acc, session) => acc + session.correctQuestions,
      0,
    );

    const wrongQuestions = sessions.reduce(
      (acc, session) => acc + session.wrongQuestions,
      0,
    );

    const skippedQuestions = sessions.reduce(
      (acc, session) => acc + session.skippedQuestions,
      0,
    );

    const totalTimeSpentMs = sessions.reduce(
      (acc, session) => acc + session.totalTimeSpentMs,
      0,
    );

    const accuracy =
      totalQuestions > 0 ? (correctQuestions / totalQuestions) * 100 : 0;

    const answeredAccuracy =
      answeredQuestions > 0 ? (correctQuestions / answeredQuestions) * 100 : 0;

    const blankRate =
      totalQuestions > 0 ? (skippedQuestions / totalQuestions) * 100 : 0;

    const averageTimePerQuestionMs =
      totalQuestions > 0 ? totalTimeSpentMs / totalQuestions : 0;

    return {
      userId,
      totalSessions,
      totalQuestions,
      answeredQuestions,
      correctQuestions,
      wrongQuestions,
      skippedQuestions,
      totalTimeSpentMs,
      accuracy: Number(accuracy.toFixed(2)),
      answeredAccuracy: Number(answeredAccuracy.toFixed(2)),
      blankRate: Number(blankRate.toFixed(2)),
      averageTimePerQuestionMs: Math.round(averageTimePerQuestionMs),
    };
  }

  async getByArea(userId: string, query: StatisticsQueryDto) {
    const where: Prisma.AttemptSessionWhereInput = {
      userId,
      status: AttemptSessionStatus.CORRECTED,

      ...(query.type && {
        type: query.type,
      }),

      ...(query.from || query.to
        ? {
            correctedAt: {
              ...(query.from && {
                gte: new Date(query.from),
              }),

              ...(query.to && {
                lte: new Date(query.to),
              }),
            },
          }
        : {}),
    };

    const answers = await this.prisma.attemptAnswer.findMany({
      where: {
        attemptSession: where,
      },

      select: {
        isCorrect: true,
        isSkipped: true,
        timeSpentMs: true,

        question: {
          select: {
            area: true,
          },
        },
      },
    });

    const grouped = new Map<
      string,
      {
        area: string;
        totalQuestions: number;
        correctQuestions: number;
        wrongQuestions: number;
        skippedQuestions: number;
        totalTimeSpentMs: number;
      }
    >();

    for (const answer of answers) {
      const area = answer.question.area;

      if (!grouped.has(area)) {
        grouped.set(area, {
          area,
          totalQuestions: 0,
          correctQuestions: 0,
          wrongQuestions: 0,
          skippedQuestions: 0,
          totalTimeSpentMs: 0,
        });
      }

      const current = grouped.get(area)!;

      current.totalQuestions++;

      current.totalTimeSpentMs += answer.timeSpentMs ?? 0;

      if (answer.isSkipped) {
        current.skippedQuestions++;
      }

      if (answer.isCorrect === true) {
        current.correctQuestions++;
      }

      if (answer.isCorrect === false) {
        current.wrongQuestions++;
      }
    }

    return Array.from(grouped.values()).map((item) => {
      const accuracy =
        item.totalQuestions > 0
          ? (item.correctQuestions / item.totalQuestions) * 100
          : 0;

      const blankRate =
        item.totalQuestions > 0
          ? (item.skippedQuestions / item.totalQuestions) * 100
          : 0;

      const averageTimePerQuestionMs =
        item.totalQuestions > 0
          ? item.totalTimeSpentMs / item.totalQuestions
          : 0;

      return {
        area: item.area,
        totalQuestions: item.totalQuestions,
        correctQuestions: item.correctQuestions,
        wrongQuestions: item.wrongQuestions,
        skippedQuestions: item.skippedQuestions,

        accuracy: Number(accuracy.toFixed(2)),

        blankRate: Number(blankRate.toFixed(2)),

        averageTimePerQuestionMs: Math.round(averageTimePerQuestionMs),
      };
    });
  }

  async getBySkill(userId: string, query: StatisticsQueryDto) {
    const where: Prisma.AttemptSessionWhereInput = {
      userId,
      status: AttemptSessionStatus.CORRECTED,

      ...(query.type && {
        type: query.type,
      }),

      ...(query.from || query.to
        ? {
            correctedAt: {
              ...(query.from && { gte: new Date(query.from) }),
              ...(query.to && { lte: new Date(query.to) }),
            },
          }
        : {}),
    };

    const answers = await this.prisma.attemptAnswer.findMany({
      where: {
        attemptSession: where,
        question: {
          skillId: {
            not: null,
          },
        },
      },
      select: {
        isCorrect: true,
        isSkipped: true,
        timeSpentMs: true,
        question: {
          select: {
            skill: {
              select: {
                id: true,
                code: true,
                description: true,
                competency: {
                  select: {
                    id: true,
                    code: true,
                    area: {
                      select: {
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
    });

    const grouped = new Map<
      string,
      {
        skillId: string;
        skillCode: string;
        skillDescription: string | null;
        competencyId: string;
        competencyCode: number;
        areaCode: string;
        areaName: string;
        totalQuestions: number;
        correctQuestions: number;
        wrongQuestions: number;
        skippedQuestions: number;
        totalTimeSpentMs: number;
      }
    >();

    for (const answer of answers) {
      const skill = answer.question.skill;

      if (!skill) {
        continue;
      }

      if (!grouped.has(skill.id)) {
        grouped.set(skill.id, {
          skillId: skill.id,
          skillCode: skill.code,
          skillDescription: skill.description,
          competencyId: skill.competency.id,
          competencyCode: skill.competency.code,
          areaCode: skill.competency.area.code,
          areaName: skill.competency.area.name,
          totalQuestions: 0,
          correctQuestions: 0,
          wrongQuestions: 0,
          skippedQuestions: 0,
          totalTimeSpentMs: 0,
        });
      }

      const current = grouped.get(skill.id)!;

      current.totalQuestions++;
      current.totalTimeSpentMs += answer.timeSpentMs ?? 0;

      if (answer.isSkipped) {
        current.skippedQuestions++;
      }

      if (answer.isCorrect === true) {
        current.correctQuestions++;
      }

      if (answer.isCorrect === false) {
        current.wrongQuestions++;
      }
    }

    return Array.from(grouped.values())
      .map((item) => {
        const accuracy =
          item.totalQuestions > 0
            ? (item.correctQuestions / item.totalQuestions) * 100
            : 0;

        const blankRate =
          item.totalQuestions > 0
            ? (item.skippedQuestions / item.totalQuestions) * 100
            : 0;

        const averageTimePerQuestionMs =
          item.totalQuestions > 0
            ? item.totalTimeSpentMs / item.totalQuestions
            : 0;

        return {
          ...item,
          accuracy: Number(accuracy.toFixed(2)),
          blankRate: Number(blankRate.toFixed(2)),
          averageTimePerQuestionMs: Math.round(averageTimePerQuestionMs),
        };
      })
      .sort((a, b) => a.accuracy - b.accuracy);
  }

  async getByCompetency(userId: string, query: StatisticsQueryDto) {
    const where: Prisma.AttemptSessionWhereInput = {
      userId,
      status: AttemptSessionStatus.CORRECTED,

      ...(query.type && {
        type: query.type,
      }),

      ...(query.from || query.to
        ? {
            correctedAt: {
              ...(query.from && { gte: new Date(query.from) }),
              ...(query.to && { lte: new Date(query.to) }),
            },
          }
        : {}),
    };

    const answers = await this.prisma.attemptAnswer.findMany({
      where: {
        attemptSession: where,
        question: {
          skillId: {
            not: null,
          },
        },
      },
      select: {
        isCorrect: true,
        isSkipped: true,
        timeSpentMs: true,
        question: {
          select: {
            skill: {
              select: {
                competency: {
                  select: {
                    id: true,
                    code: true,
                    description: true,
                    area: {
                      select: {
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
    });

    const grouped = new Map<
      string,
      {
        competencyId: string;
        competencyCode: number;
        competencyDescription: string | null;
        areaCode: string;
        areaName: string;
        totalQuestions: number;
        correctQuestions: number;
        wrongQuestions: number;
        skippedQuestions: number;
        totalTimeSpentMs: number;
      }
    >();

    for (const answer of answers) {
      const competency = answer.question.skill?.competency;

      if (!competency) {
        continue;
      }

      if (!grouped.has(competency.id)) {
        grouped.set(competency.id, {
          competencyId: competency.id,
          competencyCode: competency.code,
          competencyDescription: competency.description,
          areaCode: competency.area.code,
          areaName: competency.area.name,
          totalQuestions: 0,
          correctQuestions: 0,
          wrongQuestions: 0,
          skippedQuestions: 0,
          totalTimeSpentMs: 0,
        });
      }

      const current = grouped.get(competency.id)!;

      current.totalQuestions++;
      current.totalTimeSpentMs += answer.timeSpentMs ?? 0;

      if (answer.isSkipped) {
        current.skippedQuestions++;
      }

      if (answer.isCorrect === true) {
        current.correctQuestions++;
      }

      if (answer.isCorrect === false) {
        current.wrongQuestions++;
      }
    }

    return Array.from(grouped.values())
      .map((item) => {
        const accuracy =
          item.totalQuestions > 0
            ? (item.correctQuestions / item.totalQuestions) * 100
            : 0;

        const blankRate =
          item.totalQuestions > 0
            ? (item.skippedQuestions / item.totalQuestions) * 100
            : 0;

        const averageTimePerQuestionMs =
          item.totalQuestions > 0
            ? item.totalTimeSpentMs / item.totalQuestions
            : 0;

        return {
          ...item,
          accuracy: Number(accuracy.toFixed(2)),
          blankRate: Number(blankRate.toFixed(2)),
          averageTimePerQuestionMs: Math.round(averageTimePerQuestionMs),
        };
      })
      .sort((a, b) => a.accuracy - b.accuracy);
  }

  async getMostWrong(userId: string, query: StatisticsQueryDto) {
    const where: Prisma.AttemptSessionWhereInput = {
      userId,
      status: AttemptSessionStatus.CORRECTED,

      ...(query.type && {
        type: query.type,
      }),

      ...(query.from || query.to
        ? {
            correctedAt: {
              ...(query.from && { gte: new Date(query.from) }),
              ...(query.to && { lte: new Date(query.to) }),
            },
          }
        : {}),
    };

    const answers = await this.prisma.attemptAnswer.findMany({
      where: {
        attemptSession: where,
        isCorrect: false,
      },
      select: {
        questionId: true,
        isSkipped: true,
        timeSpentMs: true,
        question: {
          select: {
            id: true,
            number: true,
            area: true,
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
                    area: {
                      select: {
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
    });

    const grouped = new Map<
      string,
      {
        questionId: string;
        number: number;
        area: string;
        exam: {
          id: string;
          year: number;
          day: string;
          type: string;
        };
        skill: {
          id: string;
          code: string;
          description: string | null;
          competency: {
            id: string;
            code: number;
            area: {
              code: string;
              name: string;
            };
          };
        } | null;
        wrongCount: number;
        skippedCount: number;
        totalTimeSpentMs: number;
      }
    >();

    for (const answer of answers) {
      const question = answer.question;

      if (!grouped.has(question.id)) {
        grouped.set(question.id, {
          questionId: question.id,
          number: question.number,
          area: question.area,
          exam: {
            id: question.exam.id,
            year: question.exam.year,
            day: question.exam.day,
            type: question.exam.type,
          },
          skill: question.skill,
          wrongCount: 0,
          skippedCount: 0,
          totalTimeSpentMs: 0,
        });
      }

      const current = grouped.get(question.id)!;

      current.wrongCount++;
      current.totalTimeSpentMs += answer.timeSpentMs ?? 0;

      if (answer.isSkipped) {
        current.skippedCount++;
      }
    }

    return Array.from(grouped.values())
      .map((item) => ({
        ...item,
        averageTimeMs:
          item.wrongCount > 0
            ? Math.round(item.totalTimeSpentMs / item.wrongCount)
            : 0,
      }))
      .sort((a, b) => b.wrongCount - a.wrongCount);
  }

  async getContextComparison(userId: string, query: StatisticsQueryDto) {
    const where: Prisma.AttemptSessionWhereInput = {
      userId,
      status: AttemptSessionStatus.CORRECTED,

      ...(query.from || query.to
        ? {
            correctedAt: {
              ...(query.from && { gte: new Date(query.from) }),
              ...(query.to && { lte: new Date(query.to) }),
            },
          }
        : {}),
    };

    const sessions = await this.prisma.attemptSession.findMany({
      where,
      select: {
        type: true,
        totalQuestions: true,
        answeredQuestions: true,
        correctQuestions: true,
        wrongQuestions: true,
        skippedQuestions: true,
        totalTimeSpentMs: true,
      },
    });

    const grouped = new Map<
      string,
      {
        type: string;
        totalSessions: number;
        totalQuestions: number;
        answeredQuestions: number;
        correctQuestions: number;
        wrongQuestions: number;
        skippedQuestions: number;
        totalTimeSpentMs: number;
      }
    >();

    for (const session of sessions) {
      if (!grouped.has(session.type)) {
        grouped.set(session.type, {
          type: session.type,
          totalSessions: 0,
          totalQuestions: 0,
          answeredQuestions: 0,
          correctQuestions: 0,
          wrongQuestions: 0,
          skippedQuestions: 0,
          totalTimeSpentMs: 0,
        });
      }

      const current = grouped.get(session.type)!;

      current.totalSessions++;
      current.totalQuestions += session.totalQuestions;
      current.answeredQuestions += session.answeredQuestions;
      current.correctQuestions += session.correctQuestions;
      current.wrongQuestions += session.wrongQuestions;
      current.skippedQuestions += session.skippedQuestions;
      current.totalTimeSpentMs += session.totalTimeSpentMs;
    }

    return Array.from(grouped.values()).map((item) => {
      const accuracy =
        item.totalQuestions > 0
          ? (item.correctQuestions / item.totalQuestions) * 100
          : 0;

      const answeredAccuracy =
        item.answeredQuestions > 0
          ? (item.correctQuestions / item.answeredQuestions) * 100
          : 0;

      const blankRate =
        item.totalQuestions > 0
          ? (item.skippedQuestions / item.totalQuestions) * 100
          : 0;

      const averageTimePerQuestionMs =
        item.totalQuestions > 0
          ? item.totalTimeSpentMs / item.totalQuestions
          : 0;

      return {
        ...item,
        accuracy: Number(accuracy.toFixed(2)),
        answeredAccuracy: Number(answeredAccuracy.toFixed(2)),
        blankRate: Number(blankRate.toFixed(2)),
        averageTimePerQuestionMs: Math.round(averageTimePerQuestionMs),
      };
    });
  }

  async getEvolution(userId: string, query: StatisticsQueryDto) {
    const where: Prisma.AttemptSessionWhereInput = {
      userId,
      status: AttemptSessionStatus.CORRECTED,

      ...(query.type && {
        type: query.type,
      }),

      ...(query.from || query.to
        ? {
            correctedAt: {
              ...(query.from && { gte: new Date(query.from) }),
              ...(query.to && { lte: new Date(query.to) }),
            },
          }
        : {}),
    };

    const sessions = await this.prisma.attemptSession.findMany({
      where,
      select: {
        correctedAt: true,
        totalQuestions: true,
        answeredQuestions: true,
        correctQuestions: true,
        wrongQuestions: true,
        skippedQuestions: true,
        totalTimeSpentMs: true,
        type: true,
      },
      orderBy: {
        correctedAt: 'asc',
      },
    });

    const grouped = new Map<
      string,
      {
        date: string;
        totalSessions: number;
        totalQuestions: number;
        answeredQuestions: number;
        correctQuestions: number;
        wrongQuestions: number;
        skippedQuestions: number;
        totalTimeSpentMs: number;
      }
    >();

    for (const session of sessions) {
      if (!session.correctedAt) {
        continue;
      }

      const dateKey = session.correctedAt.toISOString().slice(0, 10);

      if (!grouped.has(dateKey)) {
        grouped.set(dateKey, {
          date: dateKey,
          totalSessions: 0,
          totalQuestions: 0,
          answeredQuestions: 0,
          correctQuestions: 0,
          wrongQuestions: 0,
          skippedQuestions: 0,
          totalTimeSpentMs: 0,
        });
      }

      const current = grouped.get(dateKey)!;

      current.totalSessions++;
      current.totalQuestions += session.totalQuestions;
      current.answeredQuestions += session.answeredQuestions;
      current.correctQuestions += session.correctQuestions;
      current.wrongQuestions += session.wrongQuestions;
      current.skippedQuestions += session.skippedQuestions;
      current.totalTimeSpentMs += session.totalTimeSpentMs;
    }

    return Array.from(grouped.values()).map((item) => {
      const accuracy =
        item.totalQuestions > 0
          ? (item.correctQuestions / item.totalQuestions) * 100
          : 0;

      const answeredAccuracy =
        item.answeredQuestions > 0
          ? (item.correctQuestions / item.answeredQuestions) * 100
          : 0;

      const blankRate =
        item.totalQuestions > 0
          ? (item.skippedQuestions / item.totalQuestions) * 100
          : 0;

      const averageTimePerQuestionMs =
        item.totalQuestions > 0
          ? item.totalTimeSpentMs / item.totalQuestions
          : 0;

      return {
        date: item.date,
        totalSessions: item.totalSessions,
        totalQuestions: item.totalQuestions,
        answeredQuestions: item.answeredQuestions,
        correctQuestions: item.correctQuestions,
        wrongQuestions: item.wrongQuestions,
        skippedQuestions: item.skippedQuestions,
        accuracy: Number(accuracy.toFixed(2)),
        answeredAccuracy: Number(answeredAccuracy.toFixed(2)),
        blankRate: Number(blankRate.toFixed(2)),
        averageTimePerQuestionMs: Math.round(averageTimePerQuestionMs),
      };
    });
  }
}
