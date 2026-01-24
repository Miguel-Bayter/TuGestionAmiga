import { PrismaClient } from '@prisma/client';
import { ApiError } from '@/middleware/error';
import type { BookPayload } from '@/modules/book/domain/entity/book.entity';
import type { IBookRepository } from '@/modules/book/domain/interface/book.repository';

export class BookRepository implements IBookRepository {
  constructor(private prisma: PrismaClient) {}

  async getAll(available?: boolean) {
    const books = await this.prisma.book.findMany({
      where: available ? { available: true } : undefined,
      include: { category: true },
      orderBy: { id: 'desc' },
    });

    return books.map((book) => ({
      ...book,
      price: book.price.toNumber(),
    }));
  }

  async getById(id: number) {
    const book = await this.prisma.book.findUnique({
      where: { id },
      include: { category: true },
    });

    if (!book) {
      throw new ApiError(404, 'Book not found');
    }

    return {
      ...book,
      price: book.price.toNumber(),
    };
  }

  async create(data: BookPayload) {
    const book = await this.prisma.book.create({
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

    return {
      ...book,
      price: book.price.toNumber(),
    };
  }

  async update(id: number, data: BookPayload) {
    const book = await this.prisma.book.findUnique({ where: { id } });
    if (!book) {
      throw new ApiError(404, 'Book not found');
    }

    const updatedBook = await this.prisma.book.update({
      where: { id },
      data,
      include: { category: true },
    });

    return {
      ...updatedBook,
      price: updatedBook.price.toNumber(),
    };
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
