import { createContext, useContext, useState, useEffect } from 'react';
import type { ReactNode } from 'react';
import LoginService from '../core/service/LoginService';

// Define user roles
export type UserRole = 'superadmin' | 'company';

// Define user interface
export interface User {
  id: string;
  email: string;
  role: UserRole;
  name: string;
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

export const AuthProvider = ({ children }: AuthProviderProps) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

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
              setUser(response.data.data.user);
            } else {
              localStorage.removeItem('accessToken');
              localStorage.removeItem('refreshToken');
              localStorage.removeItem('authToken'); // Clean up old key
            }
          } catch (error) {
            // API call failed, clear tokens
            localStorage.removeItem('accessToken');
            localStorage.removeItem('refreshToken');
            localStorage.removeItem('authToken'); // Clean up old key
          }
        }
      } catch (error) {
        console.error('Auth check failed:', error);
        localStorage.removeItem('accessToken');
        localStorage.removeItem('refreshToken');
        localStorage.removeItem('authToken'); // Clean up old key
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
    }
  };

  const hasRole = (role: UserRole): boolean => {
    return user?.role === role;
  };

  const hasAnyRole = (roles: UserRole[]): boolean => {
    return user ? roles.includes(user.role) : false;
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
