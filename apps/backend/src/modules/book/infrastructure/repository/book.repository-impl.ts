import { PrismaClient } from '@prisma/client';
import { ApiError } from '@/middleware/error';
import type { BookPayload } from '@/modules/book/domain/entity/book.entity';
import type { IBookRepository } from '@/modules/book/domain/interface/book.repository';

export class BookRepository implements IBookRepository {
  constructor(private prisma: PrismaClient) {}

  async getAll(available?: boolean) {
    return this.prisma.book.findMany({
      where: available ? { available: true } : undefined,
      include: { category: true },
      orderBy: { id: 'desc' },
    });
  }

  async getById(id: number) {
    const book = await this.prisma.book.findUnique({
      where: { id },
      include: { category: true },
    });

    if (!book) {
      throw new ApiError(404, 'Book not found');
    }

    return book;
  }

  async create(data: BookPayload) {
    return this.prisma.book.create({
      data: {
        title: data.title,
        author: data.author,
        description: data.description,
        categoryId: data.categoryId,
        price: data.price,
        purchaseStock: data.purchaseStock || 0,
        rentalStock: data.rentalStock || 0,
        available: data.available || false,
      },
      include: { category: true },
    });
  }

  async update(id: number, data: BookPayload) {
    const book = await this.prisma.book.findUnique({ where: { id } });
    if (!book) {
      throw new ApiError(404, 'Book not found');
    }

    return this.prisma.book.update({
      where: { id },
      data,
      include: { category: true },
    });
  }

  async delete(id: number) {
    const book = await this.prisma.book.findUnique({ where: { id } });
    if (!book) {
      throw new ApiError(404, 'Book not found');
    }

    await this.prisma.book.delete({ where: { id } });
    return { ok: true };
  }
}
