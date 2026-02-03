import type { LoanEntity } from '@/modules/loan/domain/entity/loan.entity';
import type { ILoanRepository } from '@/modules/loan/domain/interface/loan.repository';
import type { PrismaClient } from '@prisma/client';

export class LoanRepository implements ILoanRepository {
  constructor(private prisma: PrismaClient) {}

  async getAll(searchQuery?: string): Promise<LoanEntity[]> {
    const where = searchQuery
      ? {
          OR: [
            {
              user: {
                name: {
                  contains: searchQuery,
                  mode: 'insensitive' as const,
                },
              },
            },
            {
              user: {
                email: {
                  contains: searchQuery,
                  mode: 'insensitive' as const,
                },
              },
            },
          ],
        }
      : {};

    const loans = await this.prisma.loan.findMany({
      where,
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
        book: {
          select: {
            id: true,
            title: true,
            author: true,
          },
        },
      },
      orderBy: { id: 'desc' },
    });

    return loans.map((loan) => ({
      id: loan.id,
      userId: loan.userId,
      bookId: loan.bookId,
      loanDate: loan.loanDate,
      dueDate: loan.dueDate,
      returnedDate: loan.returnedDate,
      status: loan.status,
      extensions: loan.extensions,
      createdAt: loan.createdAt,
      updatedAt: loan.updatedAt,
      user: loan.user,
      book: loan.book,
    }));
  }
}
