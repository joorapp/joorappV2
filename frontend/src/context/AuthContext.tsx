import React, { createContext, useContext, useState, useEffect } from 'react';
import type { ReactNode } from 'react';

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
}

// Create the context
const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Auth provider component
interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Check for existing session on mount
  useEffect(() => {
    const checkAuth = async () => {
      try {
        // TODO: Replace with actual API call to validate token
        const token = localStorage.getItem('authToken');
        if (token) {
          // For demo purposes, determine user based on token
          if (token === 'mock-token-superadmin') {
            const mockUser: User = {
              id: '1',
              email: 'superadmin@example.com',
              role: 'superadmin',
              name: 'Super Admin'
            };
            setUser(mockUser);
          } else if (token === 'mock-token-company') {
            const mockUser: User = {
              id: '2',
              email: 'company@example.com',
              role: 'company',
              name: 'Company User',
              companyId: 'company-1'
            };
            setUser(mockUser);
          } else {
            // Invalid token, remove it
            localStorage.removeItem('authToken');
          }
        }
      } catch (error) {
        console.error('Auth check failed:', error);
        localStorage.removeItem('authToken');
      } finally {
        setIsLoading(false);
      }
    };

    checkAuth();
  }, []);

  const login = async (email: string, password: string): Promise<{ success: boolean; user?: User; error?: string }> => {
    try {
      setIsLoading(true);
      
      // TODO: Replace with actual API call
      // This is a mock implementation
      if (email === 'superadmin@example.com' && password === 'admin123') {
        const mockUser: User = {
          id: '1',
          email: email,
          role: 'superadmin',
          name: 'Super Admin'
        };
        
        setUser(mockUser);
        localStorage.setItem('authToken', 'mock-token-superadmin');
        return { success: true, user: mockUser };
      } else if (email === 'company@example.com' && password === 'company123') {
        const mockUser: User = {
          id: '2',
          email: email,
          role: 'company',
          name: 'Company User',
          companyId: 'company-1'
        };
        
        setUser(mockUser);
        localStorage.setItem('authToken', 'mock-token-company');
        return { success: true, user: mockUser };
      } else {
        return { success: false, error: 'Invalid credentials' };
      }
    } catch (error) {
      console.error('Login failed:', error);
      return { success: false, error: 'Login failed. Please try again.' };
    } finally {
      setIsLoading(false);
    }
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('authToken');
    // TODO: Call logout API endpoint
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
