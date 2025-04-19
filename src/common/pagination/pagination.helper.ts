import { SelectQueryBuilder } from 'typeorm';
import { ObjectLiteral } from 'typeorm/common/ObjectLiteral';
import { PaginationDto } from '../dto/pagination.dto';

// Enforce T to be of ObjectLiteral type (valid TypeORM entities)
export function applyPagination<T extends ObjectLiteral>(
  qb: SelectQueryBuilder<T>,
  { page = 1, limit = 10 }: PaginationDto,
): SelectQueryBuilder<T> {
  const skip = (page - 1) * limit;
  return qb.skip(skip).take(limit);
}
