// app/pages/admin/functions.ts
import { authClient } from "@/lib/auth-client";

export interface User {
  id: string;
  name?: string;
  email?: string;
  role?: string;
  banned?: boolean;
  banReason?: string;
  banExpires?: Date;
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateUserData {
  name?: string;
  email: string;
  password: string;
  role?: string;
}

export interface ListUsersQuery {
  limit?: number;
  offset?: number;
  searchField?: "email" | "name";
  searchOperator?: "contains" | "starts_with" | "ends_with";
  searchValue?: string;
  sortBy?: string;
  sortDirection?: "asc" | "desc";
  filterField?: string;
  filterOperator?: "eq" | "contains" | "starts_with" | "ends_with";
  filterValue?: string;
}

export interface ListUsersResponse {
  users: User[];
  total: number;
  limit?: number;
  offset?: number;
}

// Create a new user
export const createUser = async (userData: CreateUserData): Promise<User> => {
  try {
    const result = await authClient.admin.createUser({
      name: userData.name,
      email: userData.email,
      password: userData.password,
      role: userData.role || "user",
    });
    return result;
  } catch (error) {
    console.error("Error creating user:", error);
    throw error;
  }
};

// List all users with pagination and filtering
export const listUsers = async (query: ListUsersQuery = {}): Promise<ListUsersResponse> => {
  try {
    const result = await authClient.admin.listUsers({
      query: {
        limit: query.limit || 10,
        offset: query.offset || 0,
        searchField: query.searchField,
        searchOperator: query.searchOperator,
        searchValue: query.searchValue,
        sortBy: query.sortBy || "createdAt",
        sortDirection: query.sortDirection || "desc",
        filterField: query.filterField,
        filterOperator: query.filterOperator,
        filterValue: query.filterValue,
      }
    });
    return result;
  } catch (error) {
    console.error("Error listing users:", error);
    throw error;
  }
};

// Set user role
export const setUserRole = async (userId: string, role: string): Promise<User> => {
  try {
    const result = await authClient.admin.setRole({
      userId,
      role,
    });
    return result;
  } catch (error) {
    console.error("Error setting user role:", error);
    throw error;
  }
};

// Ban a user
export const banUser = async (
  userId: string, 
  banReason?: string, 
  banExpiresIn?: number
): Promise<User> => {
  try {
    const result = await authClient.admin.banUser({
      userId,
      banReason,
      banExpiresIn,
    });
    return result;
  } catch (error) {
    console.error("Error banning user:", error);
    throw error;
  }
};

// Unban a user
export const unbanUser = async (userId: string): Promise<User> => {
  try {
    const result = await authClient.admin.unbanUser({
      userId,
    });
    return result;
  } catch (error) {
    console.error("Error unbanning user:", error);
    throw error;
  }
};

// List user sessions
export const listUserSessions = async (userId: string) => {
  try {
    const result = await authClient.admin.listUserSessions({
      userId,
    });
    return result;
  } catch (error) {
    console.error("Error listing user sessions:", error);
    throw error;
  }
};

// Revoke user session
export const revokeUserSession = async (sessionToken: string) => {
  try {
    const result = await authClient.admin.revokeUserSession({
      sessionToken,
    });
    return result;
  } catch (error) {
    console.error("Error revoking user session:", error);
    throw error;
  }
};

// Revoke all user sessions
export const revokeAllUserSessions = async (userId: string) => {
  try {
    const result = await authClient.admin.revokeUserSessions({
      userId,
    });
    return result;
  } catch (error) {
    console.error("Error revoking all user sessions:", error);
    throw error;
  }
};

// Impersonate user
export const impersonateUser = async (userId: string) => {
  try {
    const result = await authClient.admin.impersonateUser({
      userId,
    });
    return result;
  } catch (error) {
    console.error("Error impersonating user:", error);
    throw error;
  }
};

// Stop impersonating
export const stopImpersonating = async () => {
  try {
    const result = await authClient.admin.stopImpersonating();
    return result;
  } catch (error) {
    console.error("Error stopping impersonation:", error);
    throw error;
  }
};

// Remove user (hard delete)
export const removeUser = async (userId: string): Promise<User> => {
  try {
    const result = await authClient.admin.removeUser({
      userId,
    });
    return result;
  } catch (error) {
    console.error("Error removing user:", error);
    throw error;
  }
};