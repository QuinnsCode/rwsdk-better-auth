// app/pages/user/better-auth-functions.ts
import { authClient } from "@/lib/auth-client";

export interface SignUpData {
  email: string;
  password: string;
  name?: string;
}

export interface SignInData {
  email: string;
  password: string;
}

export interface User {
  id: string;
  email: string;
  name?: string;
  role?: string;
  emailVerified: boolean;
  image?: string;
  createdAt: Date;
  updatedAt: Date;
  banned?: boolean;
  banReason?: string;
  banExpires?: Date;
}

export interface Session {
  id: string;
  userId: string;
  expiresAt: Date;
  token: string;
  ipAddress?: string;
  userAgent?: string;
  user: User;
}

// Sign up with email and password
export const signUp = async (data: SignUpData) => {
  try {
    const result = await authClient.signUp.email({
      email: data.email,
      password: data.password,
      name: data.name,
    });
    
    if (result.error) {
      throw new Error(result.error.message);
    }
    
    return result.data;
  } catch (error) {
    console.error("Sign up error:", error);
    throw error;
  }
};

// Sign in with email and password
export const signIn = async (data: SignInData) => {
  try {
    const result = await authClient.signIn.email({
      email: data.email,
      password: data.password,
    });
    
    if (result.error) {
      throw new Error(result.error.message);
    }
    
    return result.data;
  } catch (error) {
    console.error("Sign in error:", error);
    throw error;
  }
};

// Sign out
export const signOut = async () => {
  try {
    const result = await authClient.signOut();
    
    if (result.error) {
      throw new Error(result.error.message);
    }
    
    return result.data;
  } catch (error) {
    console.error("Sign out error:", error);
    throw error;
  }
};

// Get current session
export const getCurrentSession = async (): Promise<Session | null> => {
  try {
    const result = await authClient.getSession();
    
    if (result.error) {
      console.error("Session error:", result.error);
      return null;
    }
    
    return result.data;
  } catch (error) {
    console.error("Get session error:", error);
    return null;
  }
};

// Get current user
export const getCurrentUser = async (): Promise<User | null> => {
  try {
    const session = await getCurrentSession();
    return session?.user || null;
  } catch (error) {
    console.error("Get user error:", error);
    return null;
  }
};

// Update user profile
export const updateUser = async (data: Partial<User>) => {
  try {
    const result = await authClient.updateUser(data);
    
    if (result.error) {
      throw new Error(result.error.message);
    }
    
    return result.data;
  } catch (error) {
    console.error("Update user error:", error);
    throw error;
  }
};

// Change password
export const changePassword = async (currentPassword: string, newPassword: string) => {
  try {
    const result = await authClient.changePassword({
      currentPassword,
      newPassword,
    });
    
    if (result.error) {
      throw new Error(result.error.message);
    }
    
    return result.data;
  } catch (error) {
    console.error("Change password error:", error);
    throw error;
  }
};

// Forgot password
export const forgotPassword = async (email: string) => {
  try {
    const result = await authClient.forgetPassword({
      email,
      redirectTo: "/user/reset-password",
    });
    
    if (result.error) {
      throw new Error(result.error.message);
    }
    
    return result.data;
  } catch (error) {
    console.error("Forgot password error:", error);
    throw error;
  }
};

// Reset password
export const resetPassword = async (token: string, password: string) => {
  try {
    const result = await authClient.resetPassword({
      token,
      password,
    });
    
    if (result.error) {
      throw new Error(result.error.message);
    }
    
    return result.data;
  } catch (error) {
    console.error("Reset password error:", error);
    throw error;
  }
};

// List user sessions
export const listSessions = async () => {
  try {
    const result = await authClient.listSessions();
    
    if (result.error) {
      throw new Error(result.error.message);
    }
    
    return result.data;
  } catch (error) {
    console.error("List sessions error:", error);
    throw error;
  }
};

// Revoke session
export const revokeSession = async (sessionToken: string) => {
  try {
    const result = await authClient.revokeSession({
      token: sessionToken,
    });
    
    if (result.error) {
      throw new Error(result.error.message);
    }
    
    return result.data;
  } catch (error) {
    console.error("Revoke session error:", error);
    throw error;
  }
};

// Revoke all other sessions (keep current)
export const revokeOtherSessions = async () => {
  try {
    const result = await authClient.revokeOtherSessions();
    
    if (result.error) {
      throw new Error(result.error.message);
    }
    
    return result.data;
  } catch (error) {
    console.error("Revoke other sessions error:", error);
    throw error;
  }
};