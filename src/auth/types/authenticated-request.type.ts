import { Request } from 'express';
import { UserRole } from '@prisma/client';

export type AuthenticatedUser = {
  id: string;
  name: string;
  email: string;
  role: UserRole;
};

export type AuthenticatedRequest = Request & {
  user: AuthenticatedUser;
};
