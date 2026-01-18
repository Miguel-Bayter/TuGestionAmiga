import prisma from '../config/database';
import { ApiError } from '../middleware/error';

export class BookService {
  async getAll(available?: boolean) {
    return prisma.book.findMany({
      where: available ? { available: true } : undefined,
      include: { category: true },
      orderBy: { id: 'desc' }
    });
  }

  async getById(id: number) {
    const book = await prisma.book.findUnique({
      where: { id },
      include: { category: true }
    });

    if (!book) {
      throw new ApiError(404, 'Book not found');
    }

    return book;
  }

  async create(data: any) {
    return prisma.book.create({
      data: {
        title: data.title,
        author: data.author,
        description: data.description,
        categoryId: data.categoryId,
        price: data.price,
        purchaseStock: data.purchaseStock || 0,
        rentalStock: data.rentalStock || 0,
        available: data.available || false
      },
      include: { category: true }
    });
  }

  async update(id: number, data: any) {
    const book = await prisma.book.findUnique({ where: { id } });
    if (!book) {
      throw new ApiError(404, 'Book not found');
    }

    return prisma.book.update({
      where: { id },
      data,
      include: { category: true }
    });
  }

  async delete(id: number) {
    const book = await prisma.book.findUnique({ where: { id } });
    if (!book) {
      throw new ApiError(404, 'Book not found');
    }

    await prisma.book.delete({ where: { id } });
    return { ok: true };
  }
}

export const bookService = new BookService();
