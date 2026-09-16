import { Test, TestingModule } from '@nestjs/testing';
import {
  AttemptCorrectionStatus,
  AttemptSessionStatus,
  AttemptSessionType,
} from '@prisma/client';
import { PrismaService } from 'src/prisma/prisma.service';
import { AttemptSessionsService } from './attempt-sessions.service';

describe('AttemptSessionsService', () => {
  let service: AttemptSessionsService;
  let prisma: {
    attemptSession: {
      findFirst: jest.Mock;
      update: jest.Mock;
    };
    attemptAnswer: {
      update: jest.Mock;
    };
    $transaction: jest.Mock;
  };

  beforeEach(async () => {
    prisma = {
      attemptSession: {
        findFirst: jest.fn(),
        update: jest.fn(),
      },
      attemptAnswer: {
        update: jest.fn(),
      },
      $transaction: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AttemptSessionsService,
        { provide: PrismaService, useValue: prisma },
      ],
    }).compile();

    service = module.get<AttemptSessionsService>(AttemptSessionsService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('corrects answers using the official INEP answer key and stores correction metadata', async () => {
    const session = {
      id: 'session-id',
      userId: 'user-id',
      type: AttemptSessionType.AVULSO,
      status: AttemptSessionStatus.IN_PROGRESS,
      totalQuestions: 5,
      answers: [
        buildAnswer({
          id: 'answer-correct',
          selectedLetter: 'A',
          txGabarito: 'A',
          timeSpentMs: 10,
        }),
        buildAnswer({
          id: 'answer-wrong',
          selectedLetter: 'B',
          txGabarito: 'C',
          timeSpentMs: 20,
        }),
        buildAnswer({
          id: 'answer-skipped',
          selectedLetter: null,
          txGabarito: 'D',
          isSkipped: true,
          timeSpentMs: 30,
        }),
        buildAnswer({
          id: 'answer-missing-key',
          selectedLetter: 'A',
          txGabarito: null,
          timeSpentMs: 40,
        }),
        buildAnswer({
          id: 'answer-annulled',
          selectedLetter: 'A',
          txGabarito: 'B',
          inItemAban: 1,
          timeSpentMs: 50,
        }),
      ],
    };

    const tx = {
      attemptAnswer: {
        update: jest.fn(),
      },
      attemptSession: {
        update: jest.fn((args) => ({
          id: session.id,
          type: session.type,
          status: args.data.status,
          totalQuestions: session.totalQuestions,
          answeredQuestions: args.data.answeredQuestions,
          correctQuestions: args.data.correctQuestions,
          wrongQuestions: args.data.wrongQuestions,
          skippedQuestions: args.data.skippedQuestions,
          rawScore: args.data.rawScore,
          scoreMethod: args.data.scoreMethod,
          totalTimeSpentMs: args.data.totalTimeSpentMs,
          correctedAt: args.data.correctedAt,
          metadata: args.data.metadata,
          answers: session.answers.map((answer) => ({
            ...answer,
            correctLetter: null,
            isCorrect: null,
            correctionStatus: null,
            selectedAlternative: null,
          })),
        })),
      },
    };

    prisma.attemptSession.findFirst.mockResolvedValue(session);
    prisma.$transaction.mockImplementation((callback) => callback(tx));

    const result = await service.correctSession('user-id', 'session-id');

    expect(prisma.$transaction).toHaveBeenCalledTimes(1);
    expect(tx.attemptAnswer.update).toHaveBeenCalledTimes(5);

    expect(tx.attemptAnswer.update).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { id: 'answer-correct' },
        data: expect.objectContaining({
          isCorrect: true,
          correctLetter: 'A',
          correctionStatus: AttemptCorrectionStatus.CORRECT,
        }),
      }),
    );

    expect(tx.attemptAnswer.update).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { id: 'answer-wrong' },
        data: expect.objectContaining({
          isCorrect: false,
          correctLetter: 'C',
          correctionStatus: AttemptCorrectionStatus.WRONG,
        }),
      }),
    );

    expect(tx.attemptAnswer.update).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { id: 'answer-skipped' },
        data: expect.objectContaining({
          isCorrect: false,
          correctLetter: 'D',
          correctionStatus: AttemptCorrectionStatus.SKIPPED,
        }),
      }),
    );

    expect(tx.attemptAnswer.update).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { id: 'answer-missing-key' },
        data: expect.objectContaining({
          isCorrect: null,
          correctLetter: null,
          correctionStatus: AttemptCorrectionStatus.MISSING_ANSWER_KEY,
        }),
      }),
    );

    expect(tx.attemptAnswer.update).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { id: 'answer-annulled' },
        data: expect.objectContaining({
          isCorrect: null,
          correctLetter: 'B',
          correctionStatus: AttemptCorrectionStatus.ANNULLED,
        }),
      }),
    );

    expect(tx.attemptSession.update).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { id: 'session-id' },
        data: expect.objectContaining({
          status: AttemptSessionStatus.CORRECTED,
          correctQuestions: 1,
          wrongQuestions: 1,
          skippedQuestions: 1,
          answeredQuestions: 2,
          totalTimeSpentMs: 150,
          rawScore: 1,
          scoreMethod: 'SIMPLE',
          metadata: {
            correction: {
              missingAnswerKeyQuestions: 1,
              annulledQuestions: 1,
              rule: 'Pontuação simples: correta = 1, errada = 0, branco = 0',
              answerKeySource: 'InepItemMicrodata.txGabarito',
            },
          },
        }),
      }),
    );

    expect(result).toEqual(
      expect.objectContaining({
        id: 'session-id',
        status: AttemptSessionStatus.CORRECTED,
        correctQuestions: 1,
        wrongQuestions: 1,
        skippedQuestions: 1,
        rawScore: 1,
      }),
    );
  });

  it('removes answer key fields from in-progress session payloads', async () => {
    prisma.attemptSession.findFirst.mockResolvedValue({
      id: 'session-id',
      userId: 'user-id',
      status: AttemptSessionStatus.IN_PROGRESS,
      answers: [
        {
          id: 'answer-id',
          isCorrect: true,
          correctLetter: 'A',
          question: {
            id: 'question-id',
            alternatives: [{ id: 'alt-id', letter: 'A', isCorrect: true }],
            inepMicrodata: {
              txGabarito: 'A',
            },
          },
        },
      ],
    });

    const result = await service.findOne('user-id', 'session-id');
    const serialized = JSON.stringify(result);

    expect(serialized).not.toContain('isCorrect');
    expect(serialized).not.toContain('correctLetter');
    expect(serialized).not.toContain('txGabarito');
  });
});

function buildAnswer({
  id,
  selectedLetter,
  txGabarito,
  isSkipped = false,
  inItemAban = 0,
  timeSpentMs,
}: {
  id: string;
  selectedLetter: string | null;
  txGabarito: string | null;
  isSkipped?: boolean;
  inItemAban?: number;
  timeSpentMs: number;
}) {
  return {
    id,
    questionId: `${id}-question`,
    selectedLetter,
    isSkipped,
    timeSpentMs,
    question: {
      id: `${id}-question`,
      number: 1,
      area: 'MT',
      skill: null,
      inepMicrodata: {
        txGabarito,
        inItemAban,
      },
    },
  };
}
