export interface IAuthRepository {
  register(
    email: string,
    name: string,
    password: string
  ): Promise<{
    user: {
      id_usuario: number;
      email: string;
      name: string;
      roleId: number;
    };
    accessToken: string;
    refreshToken: string;
  }>;

  login(
    email: string,
    password: string
  ): Promise<{
    user: {
      id_usuario: number;
      email: string;
      name: string;
      roleId: number;
    };
    accessToken: string;
    refreshToken: string;
  }>;
}
