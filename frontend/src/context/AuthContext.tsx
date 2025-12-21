import { createContext, useContext, useState, useEffect } from 'react';
import type { ReactNode } from 'react';
import LoginService from '../core/service/LoginService';

// Define user roles
export type UserRole = 'superadmin' | 'company';

// Define user interface
export interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role?: UserRole; // Optional, can be derived from other data
  companyId?: string; // For company users
}

// Define auth context interface
interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<{ success: boolean; user?: User; error?: string }>;
  logout: () => void;
  hasRole: (role: UserRole) => boolean;
  hasAnyRole: (roles: UserRole[]) => boolean;
  setUser: (user: User | null) => void;
}

// Create the context
const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Auth provider component
interface AuthProviderProps {
  children: ReactNode;
}

const STORAGE_KEY = 'user';

export const AuthProvider = ({ children }: AuthProviderProps) => {
  // Initialize user from localStorage on mount
  const [user, setUserState] = useState<User | null>(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        return JSON.parse(stored);
      }
    } catch (error) {
      console.error('Failed to parse user from localStorage:', error);
      localStorage.removeItem(STORAGE_KEY);
    }
    return null;
  });
  const [isLoading, setIsLoading] = useState(true);

  // Sync user to localStorage whenever it changes
  useEffect(() => {
    try {
      if (user) {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(user));
      } else {
        localStorage.removeItem(STORAGE_KEY);
      }
    } catch (error) {
      console.error('Failed to save user to localStorage:', error);
    }
  }, [user]);

  // Wrapper function to update user state
  const setUser = (newUser: User | null) => {
    setUserState(newUser);
  };

  // Check for existing session on mount
  useEffect(() => {
    const checkAuth = async () => {
      try {
        const token = localStorage.getItem('accessToken') || localStorage.getItem('authToken'); // Support both for migration
        if (token) {
          // Use LoginService to get profile and validate token
          try {
            const response = await LoginService.getProfile();
            if (response.data?.success && response.data?.data?.user) {
              // Map keycloak_global_role to user role if available
              const keycloakRole = localStorage.getItem('keycloak_global_role');
              const userData = {
                ...response.data.data.user,
                role: keycloakRole === 'SUPER_ADMIN' ? 'superadmin' : (keycloakRole ? 'company' : undefined) as UserRole | undefined,
              };
              setUser(userData);
            } else {
              setUser(null);
              localStorage.removeItem('accessToken');
              localStorage.removeItem('refreshToken');
              localStorage.removeItem('authToken'); // Clean up old key
              localStorage.removeItem('keycloak_global_role'); // Clear role from localStorage
            }
          } catch (error) {
            // API call failed, clear tokens
            setUser(null);
            localStorage.removeItem('accessToken');
            localStorage.removeItem('refreshToken');
            localStorage.removeItem('authToken'); // Clean up old key
            localStorage.removeItem('keycloak_global_role'); // Clear role from localStorage
          }
        } else {
          setUser(null);
        }
      } catch (error) {
        console.error('Auth check failed:', error);
        setUser(null);
        localStorage.removeItem('accessToken');
        localStorage.removeItem('refreshToken');
        localStorage.removeItem('authToken'); // Clean up old key
        localStorage.removeItem('keycloak_global_role'); // Clear role from localStorage
      } finally {
        setIsLoading(false);
      }
    };

    checkAuth();
  }, []);

  const login = async (email: string, password: string): Promise<{ success: boolean; user?: User; error?: string }> => {
    try {
      setIsLoading(true);
      
      // Use LoginService following API architecture pattern
      const response = await LoginService.login({ email, password });
      
      if (response.data?.success && response.data?.data) {
        const { access_token, refresh_token } = response.data.data;
        
        if (access_token && refresh_token) {
          // Store tokens separately
          localStorage.setItem('accessToken', access_token);
          localStorage.setItem('refreshToken', refresh_token);
          localStorage.removeItem('authToken'); // Clean up old key
          
          return { success: true };
        } else {
          // Tokens missing in response
          return { success: false, error: response.data?.message || 'Login failed. Tokens not received.' };
        }
      } else {
        // API call failed
        return { success: false, error: response.data?.message || 'Login failed. Unexpected error occurred.' };
      }
      
    } catch (error: any) {
      // Interceptor already shows error toast, just extract message for return value
      const errorMessage = error?.response?.data?.error || error?.response?.data?.message || 'Login failed. Please try again.';
      return { success: false, error: errorMessage };
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async () => {
    try {
      // Use LoginService following API architecture pattern
      await LoginService.logout();
    } catch (error) {
      // Interceptor already shows error toast, continue with logout anyway
      console.error('Logout API error:', error);
    } finally {
      setUser(null);
      localStorage.removeItem('accessToken');
      localStorage.removeItem('refreshToken');
      localStorage.removeItem('authToken'); // Clean up old key
      localStorage.removeItem(STORAGE_KEY); // Clear user from localStorage
      localStorage.removeItem('keycloak_global_role'); // Clear role from localStorage
    }
  };

  const hasRole = (role: UserRole): boolean => {
    // Check user.role first
    if (user?.role) {
      return user.role === role;
    }
    // Fallback to keycloak_global_role from localStorage if user.role is not set
    const keycloakRole = localStorage.getItem('keycloak_global_role');
    if (keycloakRole === 'SUPER_ADMIN' && role === 'superadmin') {
      return true;
    }
    if (keycloakRole && keycloakRole !== 'SUPER_ADMIN' && role === 'company') {
      return true;
    }
    return false;
  };

  const hasAnyRole = (roles: UserRole[]): boolean => {
    return user?.role ? roles.includes(user.role) : false;
  };

  const value: AuthContextType = {
    user,
    isAuthenticated: !!user,
    isLoading,
    login,
    logout,
    hasRole,
    hasAnyRole,
    setUser,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

// Custom hook to use auth context
export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export default AuthContext;
