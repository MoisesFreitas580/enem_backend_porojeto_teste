import { Injectable } from '@nestjs/common';
import { PrismaService } from './prisma/prisma.service';
import { Discipline } from '@prisma/client';

@Injectable()
export class AppService {
  constructor(private prisma: PrismaService) {}
  getHello(): string {
    return `Bem vindo a API de Provas do ENEM - Gratuito e sempre será ! ${process.env.AWS_ENDPOINT_URL} ${process.env.AWS_S3_BUCKET_NAME} ${process.env.AWS_ACCESS_KEY_ID} ${process.env.AWS_SECRET_ACCESS_KEY}`;
  }

  async getDisciplinas(): Promise<Discipline[]> {
    return await this.prisma.discipline.findMany();
  }
}
