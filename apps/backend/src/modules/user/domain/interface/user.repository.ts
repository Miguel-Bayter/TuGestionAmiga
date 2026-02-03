import type { UserEntity } from '@/modules/user/domain/entity/user.entity';

export interface IUserRepository {
  getAll(): Promise<UserEntity[]>;
}
