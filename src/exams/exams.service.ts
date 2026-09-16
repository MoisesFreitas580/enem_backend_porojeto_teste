import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { ListExamsQueryDto } from './dto/list-exams.query.dto';
import { Prisma } from '@prisma/client';
import { ListExamQuestionsQueryDto } from './dto/list-exam-questions.query.dto';

@Injectable()
export class ExamsService {
  constructor(private readonly prisma: PrismaService) {}

  async listExams(query: ListExamsQueryDto) {
    const where: Prisma.ExamWhereInput = {
      type: query.type,
      year: query.year,
    };

    if (query.day) {
      where.day = query.day;
    }

    const data = await this.prisma.exam.findMany({
      where,
      select: {
        id: true,
        year: true,
        type: true,
        day: true,
        createdAt: true,
        updatedAt: true,
        _count: {
          select: {
            questions: true,
          },
        },
      },
      orderBy: [{ day: 'asc' }],
    });

    return {
      data,
      meta: {
        total: data.length,
      },
    };
  }

  async listExamQuestions(query: ListExamQuestionsQueryDto) {
    const examWhere: Prisma.ExamWhereInput = {
      type: query.type,
      year: query.year,
    };

    if (query.day) {
      examWhere.day = query.day;
    }

    const questions = await this.prisma.question.findMany({
      where: {
        //exam: examWhere,
        exam: {
          is: examWhere,
        },
      },
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
            type: true,
            day: true,
          },
        },
        blocks: {
          select: {
            id: true,
            type: true,
            order: true,
            text: true,
            imageUrl: true,
          },
          orderBy: [{ order: 'asc' }],
        },
        alternatives: {
          select: {
            id: true,
            letter: true,
            text: true,
          },
          orderBy: [{ letter: 'asc' }],
        },
      },
      orderBy: [
        { exam: { day: 'asc' } },
        { number: 'asc' },
        { tpLingua: 'asc' },
      ],
    });
    return {
      data: questions,
      meta: {
        total: questions.length,
      },
    };
  }

  async listQuestionsByExamId(examId: string) {
    const examExists = await this.prisma.exam.findUnique({
      where: { id: examId },
      select: { id: true },
    });

    if (!examExists) {
      throw new NotFoundException('Exame não encontrado.');
    }

    const data = await this.prisma.question.findMany({
      where: {
        examId,
      },
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
            type: true,
            day: true,
          },
        },
        blocks: {
          select: {
            id: true,
            type: true,
            order: true,
            text: true,
            imageUrl: true,
          },
          orderBy: [{ order: 'asc' }],
        },
        alternatives: {
          select: {
            id: true,
            letter: true,
            text: true,
          },
          orderBy: [{ letter: 'asc' }],
        },
      },
      orderBy: [{ number: 'asc' }, { tpLingua: 'asc' }],
    });

    return {
      data,
      meta: {
        total: data.length,
      },
    };
  }
}
