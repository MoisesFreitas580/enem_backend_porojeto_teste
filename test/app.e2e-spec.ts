import { INestApplication, ValidationPipe } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import request from 'supertest';
import { App } from 'supertest/types';
import { PrismaService } from 'src/prisma/prisma.service';

process.env.JWT_SECRET = 'test-secret';

type UserRecord = {
  id: string;
  name: string;
  email: string;
  role: 'STUDENT';
  passwordHash: string | null;
  deletedAt: Date | null;
  createdAt: Date;
  updatedAt: Date;
};

type QuestionRecord = {
  id: string;
  number: number;
  area: string;
  alternatives: Array<{
    id: string;
    questionId: string;
    letter: string;
    text: string;
  }>;
  inepMicrodata: {
    txGabarito: string | null;
    inItemAban: number;
  };
};

type AttemptSessionRecord = {
  id: string;
  userId: string;
  type: 'AVULSO';
  title: string | null;
  status: 'IN_PROGRESS' | 'CORRECTED' | 'ABANDONED';
  totalQuestions: number;
  answeredQuestions: number;
  correctQuestions: number;
  wrongQuestions: number;
  skippedQuestions: number;
  totalTimeSpentMs: number;
  rawScore: number | null;
  scoreMethod: string | null;
  metadata: Record<string, unknown> | null;
  correctedAt: Date | null;
  abandonedAt: Date | null;
  createdAt: Date;
  updatedAt: Date;
};

type AttemptAnswerRecord = {
  id: string;
  attemptSessionId: string;
  questionId: string;
  questionOrder: number;
  selectedAlternativeId: string | null;
  selectedLetter: string | null;
  isSkipped: boolean;
  timeSpentMs: number;
  reviewCount: number;
  confidenceLevel: number | null;
  answeredAt: Date | null;
  isCorrect: boolean | null;
  correctLetter: string | null;
  correctionStatus: string | null;
  correctedAt: Date | null;
};

describe('Auth and users profile flow (e2e)', () => {
  let app: INestApplication<App>;
  let users: UserRecord[];
  let questions: QuestionRecord[];
  let attemptSessions: AttemptSessionRecord[];
  let attemptAnswers: AttemptAnswerRecord[];
  let idSequence: number;

  beforeEach(async () => {
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    const { AppModule } = require('./../src/app.module');

    users = [];
    questions = createQuestionFixtures();
    attemptSessions = [];
    attemptAnswers = [];
    idSequence = 1;

    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    })
      .overrideProvider(PrismaService)
      .useValue(
        createPrismaMock(
          () => users,
          () => questions,
          () => attemptSessions,
          () => attemptAnswers,
          () => idSequence++,
        ),
      )
      .compile();

    app = moduleFixture.createNestApplication();
    app.useGlobalPipes(
      new ValidationPipe({
        whitelist: true,
        transform: true,
        forbidNonWhitelisted: false,
        transformOptions: { enableImplicitConversion: true },
      }),
    );
    await app.init();
  });

  afterEach(async () => {
    await app?.close();
  });

  it('returns the public welcome route', async () => {
    await request(app.getHttpServer())
      .get('/')
      .expect(200)
      .expect('Bem vindo a API de Provas do ENEM - Gratuito e sempre será !');
  });

  it('registers, authenticates, updates profile, soft deletes and blocks old access', async () => {
    const email = 'e2e.usuario@example.com';

    const registerResponse = await request(app.getHttpServer())
      .post('/auth/register')
      .send({
        name: 'Usuário E2E',
        email,
        password: 'Senha123',
      })
      .expect(201);

    expect(registerResponse.body).toEqual({
      accessToken: expect.any(String),
      user: {
        id: expect.any(String),
        name: 'Usuário E2E',
        email,
        role: 'STUDENT',
      },
    });
    expect(JSON.stringify(registerResponse.body)).not.toContain('passwordHash');

    const token = registerResponse.body.accessToken as string;

    await request(app.getHttpServer()).get('/users/me').expect(401);

    const profileResponse = await request(app.getHttpServer())
      .get('/users/me')
      .set('Authorization', `Bearer ${token}`)
      .expect(200);

    expect(profileResponse.body).toEqual({
      id: registerResponse.body.user.id,
      name: 'Usuário E2E',
      email,
      role: 'STUDENT',
      createdAt: expect.any(String),
      updatedAt: expect.any(String),
    });

    await request(app.getHttpServer())
      .patch('/users/me')
      .set('Authorization', `Bearer ${token}`)
      .send({ name: 'AB' })
      .expect(400);

    const updateResponse = await request(app.getHttpServer())
      .patch('/users/me')
      .set('Authorization', `Bearer ${token}`)
      .send({
        name: 'Usuário Atualizado',
        email: 'tentativa-de-troca@example.com',
        role: 'ADMIN',
      })
      .expect(200);

    expect(updateResponse.body).toEqual(
      expect.objectContaining({
        name: 'Usuário Atualizado',
        email,
        role: 'STUDENT',
      }),
    );

    await request(app.getHttpServer())
      .delete('/users/me')
      .set('Authorization', `Bearer ${token}`)
      .expect(200)
      .expect({ message: 'Conta desativada com sucesso.' });

    await request(app.getHttpServer())
      .get('/users/me')
      .set('Authorization', `Bearer ${token}`)
      .expect(401);

    await request(app.getHttpServer())
      .post('/auth/login')
      .send({ email, password: 'Senha123' })
      .expect(401);

    await request(app.getHttpServer())
      .post('/auth/register')
      .send({
        name: 'Outro Usuário',
        email,
        password: 'Senha123',
      })
      .expect(400);
  });

  it('runs a complete avulso attempt flow without leaking answer keys before correction', async () => {
    const registerResponse = await request(app.getHttpServer())
      .post('/auth/register')
      .send({
        name: 'Aluno Tentativa',
        email: 'tentativa.e2e@example.com',
        password: 'Senha123',
      })
      .expect(201);

    const token = registerResponse.body.accessToken as string;

    const createResponse = await request(app.getHttpServer())
      .post('/attempt-sessions/avulso')
      .set('Authorization', `Bearer ${token}`)
      .send({
        title: 'Lista avulsa E2E',
        questionIds: [questions[0].id, questions[1].id],
      })
      .expect(201);

    expect(createResponse.body).toEqual(
      expect.objectContaining({
        id: expect.any(String),
        type: 'AVULSO',
        status: 'IN_PROGRESS',
        title: 'Lista avulsa E2E',
        totalQuestions: 2,
      }),
    );
    expect(JSON.stringify(createResponse.body)).not.toContain('isCorrect');
    expect(JSON.stringify(createResponse.body)).not.toContain('correctLetter');
    expect(JSON.stringify(createResponse.body)).not.toContain('txGabarito');

    const sessionId = createResponse.body.id as string;

    const submitResponse = await request(app.getHttpServer())
      .patch(`/attempt-sessions/${sessionId}/answers/${questions[0].id}`)
      .set('Authorization', `Bearer ${token}`)
      .send({
        selectedAlternativeId: questions[0].alternatives[0].id,
        timeSpentMs: 45000,
        reviewCount: 1,
        confidenceLevel: 4,
      })
      .expect(200);

    expect(submitResponse.body).toEqual(
      expect.objectContaining({
        questionId: questions[0].id,
        selectedAlternativeId: questions[0].alternatives[0].id,
        selectedLetter: 'A',
        isSkipped: false,
      }),
    );
    expect(JSON.stringify(submitResponse.body)).not.toContain('isCorrect');
    expect(JSON.stringify(submitResponse.body)).not.toContain('correctLetter');
    expect(JSON.stringify(submitResponse.body)).not.toContain('txGabarito');

    await request(app.getHttpServer())
      .patch(`/attempt-sessions/${sessionId}/answers/${questions[1].id}`)
      .set('Authorization', `Bearer ${token}`)
      .send({
        isSkipped: true,
        timeSpentMs: 30000,
      })
      .expect(200);

    const inProgressResponse = await request(app.getHttpServer())
      .get(`/attempt-sessions/${sessionId}`)
      .set('Authorization', `Bearer ${token}`)
      .expect(200);

    expect(inProgressResponse.body).toEqual(
      expect.objectContaining({
        status: 'IN_PROGRESS',
        answeredQuestions: 2,
        skippedQuestions: 1,
        totalTimeSpentMs: 75000,
      }),
    );
    expect(JSON.stringify(inProgressResponse.body)).not.toContain('isCorrect');
    expect(JSON.stringify(inProgressResponse.body)).not.toContain(
      'correctLetter',
    );
    expect(JSON.stringify(inProgressResponse.body)).not.toContain('txGabarito');

    const correctionResponse = await request(app.getHttpServer())
      .post(`/attempt-sessions/${sessionId}/correct`)
      .set('Authorization', `Bearer ${token}`)
      .expect(201);

    expect(correctionResponse.body).toEqual(
      expect.objectContaining({
        id: sessionId,
        status: 'CORRECTED',
        totalQuestions: 2,
        answeredQuestions: 1,
        correctQuestions: 1,
        wrongQuestions: 0,
        skippedQuestions: 1,
        rawScore: 1,
        scoreMethod: 'SIMPLE',
      }),
    );
    expect(correctionResponse.body.answers).toEqual([
      expect.objectContaining({
        questionId: questions[0].id,
        selectedLetter: 'A',
        correctLetter: 'A',
        isCorrect: true,
        correctionStatus: 'CORRECT',
      }),
      expect.objectContaining({
        questionId: questions[1].id,
        selectedLetter: null,
        correctLetter: 'C',
        isCorrect: false,
        correctionStatus: 'SKIPPED',
      }),
    ]);

    await request(app.getHttpServer())
      .patch(`/attempt-sessions/${sessionId}/answers/${questions[0].id}`)
      .set('Authorization', `Bearer ${token}`)
      .send({
        selectedAlternativeId: questions[0].alternatives[1].id,
      })
      .expect(400);

    const statisticsResponse = await request(app.getHttpServer())
      .get('/statistics/overview')
      .set('Authorization', `Bearer ${token}`)
      .expect(200);

    expect(statisticsResponse.body).toEqual({
      userId: registerResponse.body.user.id,
      totalSessions: 1,
      totalQuestions: 2,
      answeredQuestions: 1,
      correctQuestions: 1,
      wrongQuestions: 0,
      skippedQuestions: 1,
      totalTimeSpentMs: 75000,
      accuracy: 50,
      answeredAccuracy: 100,
      blankRate: 50,
      averageTimePerQuestionMs: 37500,
    });
  });
});

function createPrismaMock(
  getUsers: () => UserRecord[],
  getQuestions: () => QuestionRecord[],
  getAttemptSessions: () => AttemptSessionRecord[],
  getAttemptAnswers: () => AttemptAnswerRecord[],
  nextId: () => number,
) {
  const database = {
    user: {
      findUnique: jest.fn(({ where, select }) => {
        const user = where.email
          ? getUsers().find((item) => item.email === where.email)
          : getUsers().find((item) => item.id === where.id);

        return Promise.resolve(applySelect(user ?? null, select));
      }),
      findFirst: jest.fn(({ where, select }) => {
        const user = getUsers().find((item) => {
          if (where.id && item.id !== where.id) return false;
          if (where.deletedAt === null && item.deletedAt !== null) return false;
          return true;
        });

        return Promise.resolve(applySelect(user ?? null, select));
      }),
      create: jest.fn(({ data, select }) => {
        const now = new Date();
        const user: UserRecord = {
          id: `user-${nextId()}`,
          name: data.name,
          email: data.email,
          role: 'STUDENT',
          passwordHash: data.passwordHash,
          deletedAt: null,
          createdAt: now,
          updatedAt: now,
        };

        getUsers().push(user);

        return Promise.resolve(applySelect(user, select));
      }),
      update: jest.fn(({ where, data, select }) => {
        const user = getUsers().find((item) => item.id === where.id);

        if (!user) {
          throw new Error('User not found in test mock.');
        }

        Object.assign(user, data, { updatedAt: new Date() });

        return Promise.resolve(applySelect(user, select));
      }),
    },
    question: {
      findMany: jest.fn(({ where }) => {
        const ids = where?.id?.in as string[] | undefined;

        return Promise.resolve(
          ids
            ? getQuestions()
                .filter((question) => ids.includes(question.id))
                .map((question) => ({ id: question.id }))
            : getQuestions(),
        );
      }),
    },
    attemptSession: {
      create: jest.fn(({ data }) => {
        const now = new Date();
        const session: AttemptSessionRecord = {
          id: `session-${nextId()}`,
          userId: data.userId,
          type: data.type,
          title: data.title ?? null,
          status: 'IN_PROGRESS',
          totalQuestions: data.totalQuestions,
          answeredQuestions: 0,
          correctQuestions: 0,
          wrongQuestions: 0,
          skippedQuestions: 0,
          totalTimeSpentMs: 0,
          rawScore: null,
          scoreMethod: null,
          metadata: data.metadata ?? null,
          correctedAt: null,
          abandonedAt: null,
          createdAt: now,
          updatedAt: now,
        };

        getAttemptSessions().push(session);

        data.answers.create.forEach(
          (answerData: { questionId: string; questionOrder: number }) => {
            getAttemptAnswers().push({
              id: `answer-${nextId()}`,
              attemptSessionId: session.id,
              questionId: answerData.questionId,
              questionOrder: answerData.questionOrder,
              selectedAlternativeId: null,
              selectedLetter: null,
              isSkipped: false,
              timeSpentMs: 0,
              reviewCount: 0,
              confidenceLevel: null,
              answeredAt: null,
              isCorrect: null,
              correctLetter: null,
              correctionStatus: null,
              correctedAt: null,
            });
          },
        );

        return Promise.resolve(hydrateSession(session));
      }),
      findFirst: jest.fn(({ where, include }) => {
        const session = getAttemptSessions().find((item) => {
          if (where.id && item.id !== where.id) return false;
          if (where.userId && item.userId !== where.userId) return false;
          return true;
        });

        if (!session) {
          return Promise.resolve(null);
        }

        return Promise.resolve(include ? hydrateSession(session) : session);
      }),
      findMany: jest.fn(({ where }) => {
        const sessions = getAttemptSessions().filter((session) => {
          if (where?.userId && session.userId !== where.userId) return false;
          if (where?.status && session.status !== where.status) return false;
          if (where?.type && session.type !== where.type) return false;
          return true;
        });

        return Promise.resolve(sessions);
      }),
      update: jest.fn(({ where, data, include }) => {
        const session = getAttemptSessions().find((item) => item.id === where.id);

        if (!session) {
          throw new Error('Attempt session not found in test mock.');
        }

        Object.assign(session, data, { updatedAt: new Date() });

        return Promise.resolve(include ? hydrateSession(session) : session);
      }),
    },
    attemptAnswer: {
      findFirst: jest.fn(({ where, include }) => {
        const answer = getAttemptAnswers().find((item) => {
          if (
            where.attemptSessionId &&
            item.attemptSessionId !== where.attemptSessionId
          ) {
            return false;
          }
          if (where.questionId && item.questionId !== where.questionId) {
            return false;
          }
          return true;
        });

        if (!answer) {
          return Promise.resolve(null);
        }

        return Promise.resolve(include ? hydrateAnswer(answer) : answer);
      }),
      findMany: jest.fn(({ where }) => {
        const answers = getAttemptAnswers().filter((answer) => {
          if (
            where?.attemptSessionId &&
            answer.attemptSessionId !== where.attemptSessionId
          ) {
            return false;
          }
          return true;
        });

        return Promise.resolve(answers);
      }),
      update: jest.fn(({ where, data, include }) => {
        const answer = getAttemptAnswers().find((item) => item.id === where.id);

        if (!answer) {
          throw new Error('Attempt answer not found in test mock.');
        }

        Object.assign(answer, data);

        return Promise.resolve(include ? hydrateAnswer(answer) : answer);
      }),
    },
  };

  return {
    ...database,
    $transaction: jest.fn((callback) => callback(database)),
  };

  function hydrateSession(session: AttemptSessionRecord) {
    return {
      ...session,
      answers: getAttemptAnswers()
        .filter((answer) => answer.attemptSessionId === session.id)
        .sort((left, right) => left.questionOrder - right.questionOrder)
        .map((answer) => hydrateAnswer(answer)),
    };
  }

  function hydrateAnswer(answer: AttemptAnswerRecord) {
    const question = getQuestions().find((item) => item.id === answer.questionId);
    const selectedAlternative =
      question?.alternatives.find(
        (alternative) => alternative.id === answer.selectedAlternativeId,
      ) ?? null;

    return {
      ...answer,
      selectedAlternative,
      question: question
        ? {
            ...question,
            exam: null,
            skill: null,
            blocks: [],
          }
        : null,
    };
  }
}

function createQuestionFixtures(): QuestionRecord[] {
  return [
    createQuestionFixture(
      '11111111-1111-4111-8111-111111111111',
      1,
      'MATEMATICA',
      'A',
    ),
    createQuestionFixture(
      '22222222-2222-4222-8222-222222222222',
      2,
      'MATEMATICA',
      'C',
    ),
  ];
}

function createQuestionFixture(
  id: string,
  number: number,
  area: string,
  correctLetter: string,
): QuestionRecord {
  return {
    id,
    number,
    area,
    alternatives: ['A', 'B', 'C', 'D', 'E'].map((letter) => ({
      id: `${id.slice(0, 8)}-${letter.toLowerCase()}111-4111-8111-111111111111`,
      questionId: id,
      letter,
      text: `Alternativa ${letter}`,
    })),
    inepMicrodata: {
      txGabarito: correctLetter,
      inItemAban: 0,
    },
  };
}

function applySelect<T extends Record<string, unknown> | null>(
  record: T,
  select?: Record<string, boolean>,
) {
  if (!record || !select) {
    return record;
  }

  return Object.entries(select).reduce<Record<string, unknown>>(
    (selected, [key, enabled]) => {
      if (enabled) {
        selected[key] = record[key];
      }

      return selected;
    },
    {},
  );
}
