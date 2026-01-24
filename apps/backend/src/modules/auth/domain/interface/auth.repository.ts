import type { AuthUser, AuthUserResponse } from '../entity/auth.entity';

export interface IAuthRepository {
  /**
   * Register a new user with email, name, and password
   * @param email User email address
   * @param name User full name
   * @param password User password (will be hashed)
   * @returns User data and JWT tokens
   */
  register(
    email: string,
    name: string,
    password: string
  ): Promise<{
    user: AuthUserResponse;
    accessToken: string;
    refreshToken: string;
  }>;

  /**
   * Authenticate user with email and password
   * @param email User email address
   * @param password User password
   * @returns User data and JWT tokens
   */
  login(
    email: string,
    password: string
  ): Promise<{
    user: AuthUserResponse;
    accessToken: string;
    refreshToken: string;
  }>;

  /**
   * Refresh access token using a valid refresh token
   * @param refreshToken Valid refresh token
   * @returns New access token
   * @throws ApiError if token is invalid, expired, or user not found
   */
  refreshToken(refreshToken: string): Promise<{ accessToken: string }>;

  /**
   * Validate and decode JWT access token
   * @param token JWT access token
   * @returns Decoded user information
   * @throws ApiError if token is invalid, expired, or user not found
   */
  validateToken(token: string): Promise<AuthUser>;
}
