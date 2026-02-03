import { PrismaClient } from '@prisma/client';
import type { IUserRepository } from '@/modules/user/domain/interface/user.repository';
import type { UserEntity } from '@/modules/user/domain/entity/user.entity';

export class UserRepository implements IUserRepository {
  constructor(private prisma: PrismaClient) {}

  async getAll(): Promise<UserEntity[]> {
    const users = await this.prisma.user.findMany({
      include: { role: true },
      orderBy: { id: 'desc' },
    });

    // Map to exclude password field
    return users.map((user) => ({
      id: user.id,
      email: user.email,
      name: user.name,
      roleId: user.roleId,
      role: {
        id: user.role.id,
        name: user.role.name,
      },
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
    }));
  }
}
