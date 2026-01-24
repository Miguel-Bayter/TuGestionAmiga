import type { BookPayload } from '@/types';

export interface IBookRepository {
  getAll(available?: boolean): Promise<object[]>;
  getById(id: number): Promise<object>;
  create(data: BookPayload): Promise<object>;
  update(id: number, data: BookPayload): Promise<object>;
  delete(id: number): Promise<{ ok: boolean }>;
}
