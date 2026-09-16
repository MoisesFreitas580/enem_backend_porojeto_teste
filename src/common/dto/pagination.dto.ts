import { Type } from 'class-transformer';
import { IsInt, IsOptional, Max, Min } from 'class-validator';

export class PaginationDto {
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  page: number = 1;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(100)
  limit: number = 20;
}

export type PaginationMeta = {
  total: number;
  page: number;
  perPage: number;
  totalPages: number;
};

export function buildPaginationMeta(
  total: number,
  page: number,
  perPage: number,
): PaginationMeta {
  return {
    total,
    page,
    perPage,
    totalPages: Math.ceil(total / perPage),
  };
}

export function buildPaginatedResponse<T>(
  data: T[],
  total: number,
  page: number,
  perPage: number,
) {
  return {
    data,
    meta: buildPaginationMeta(total, page, perPage),
  };
}
