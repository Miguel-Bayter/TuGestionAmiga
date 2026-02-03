export type UserEntity = {
  id: number;
  email: string;
  name: string;
  roleId: number;
  role: {
    id: number;
    name: string;
  };
  createdAt: Date;
  updatedAt: Date;
};
