import type { BookPayload } from '@/types';
import { BookEntity } from '@/modules/book/domain/entity/book.entity';

export interface IBookRepository {
  getAll(available?: boolean): Promise<BookEntity[]>;
  getById(id: number): Promise<BookEntity>;
  create(data: BookPayload): Promise<BookEntity>;
  update(id: number, data: BookPayload): Promise<BookEntity>;
  delete(id: number): Promise<{ ok: boolean }>;
}
