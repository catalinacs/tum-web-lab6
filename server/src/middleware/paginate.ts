import { Request, Response } from 'express';

export interface PaginatedResult<T> {
  data: T[];
  total: number;
  limit: number;
  offset: number;
  hasMore: boolean;
}

export function paginate<T>(
  req: Request,
  res: Response,
  items: T[]
): PaginatedResult<T> | null {
  const rawLimit  = req.query.limit  ?? '10';
  const rawOffset = req.query.offset ?? '0';

  const limit  = Number(rawLimit);
  const offset = Number(rawOffset);

  if (!Number.isInteger(limit)  || limit  < 0 || limit  > 100 ||
      !Number.isInteger(offset) || offset < 0) {
    res.status(400).json({ error: 'limit must be 0–100 and offset must be a non-negative integer' });
    return null;
  }

  const data = items.slice(offset, offset + limit);
  return { data, total: items.length, limit, offset, hasMore: offset + limit < items.length };
}
