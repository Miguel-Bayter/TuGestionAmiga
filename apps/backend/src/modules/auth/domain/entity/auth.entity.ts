/**
 * Internal representation of authenticated user
 * Used within the application with English field names
 */
export type AuthUser = {
  userId: number;
  roleId: number;
  roleName: string;
  isAdmin: boolean;
};

/**
 * API response representation of authenticated user
 * Used for API responses with Spanish field names for backward compatibility
 */
export type AuthUserResponse = {
  id: number;
  email: string;
  name: string;
  roleId: number;
};
