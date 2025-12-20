import { createContext, useContext, useState, useEffect } from 'react';
import type { ReactNode } from 'react';

// Define company role interface
export interface CompanyRole {
  id: string;
  name: string;
  code: string;
  description: string;
}

// Define company user interface
export interface CompanyUser {
  id: string;
  isActive: boolean;
}

// Define company interface
export interface Company {
  id: string;
  name: string;
  isActive: boolean;
  role: CompanyRole;
  companyUser: CompanyUser;
}

// Define companies context interface
interface CompaniesContextType {
  companies: Company[];
  isLoading: boolean;
  setCompanies: (companies: Company[]) => void;
  clearCompanies: () => void;
}

// Create the context
const CompaniesContext = createContext<CompaniesContextType | undefined>(undefined);

// Companies provider component
interface CompaniesProviderProps {
  children: ReactNode;
}

const STORAGE_KEY = 'companies';

export const CompaniesProvider = ({ children }: CompaniesProviderProps) => {
  // Initialize state from localStorage on mount
  const [companies, setCompaniesState] = useState<Company[]>(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        return JSON.parse(stored);
      }
    } catch (error) {
      console.error('Failed to parse companies from localStorage:', error);
      // Clear invalid data
      localStorage.removeItem(STORAGE_KEY);
    }
    return [];
  });
  
  const [isLoading, setIsLoading] = useState(false);

  // Sync to localStorage whenever companies change
  useEffect(() => {
    try {
      if (companies.length > 0) {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(companies));
      } else {
        localStorage.removeItem(STORAGE_KEY);
      }
    } catch (error) {
      console.error('Failed to save companies to localStorage:', error);
    }
  }, [companies]);

  // Wrapper function to update companies state
  const setCompanies = (newCompanies: Company[]) => {
    setCompaniesState(newCompanies);
  };

  const clearCompanies = () => {
    setCompaniesState([]);
    // localStorage will be cleared automatically by useEffect
    // But we can also clear it explicitly for immediate effect
    try {
      localStorage.removeItem(STORAGE_KEY);
    } catch (error) {
      console.error('Failed to clear companies from localStorage:', error);
    }
  };

  const value: CompaniesContextType = {
    companies,
    isLoading,
    setCompanies,
    clearCompanies,
  };

  return (
    <CompaniesContext.Provider value={value}>
      {children}
    </CompaniesContext.Provider>
  );
};

// Custom hook to use companies context
export const useCompanies = (): CompaniesContextType => {
  const context = useContext(CompaniesContext);
  if (context === undefined) {
    throw new Error('useCompanies must be used within a CompaniesProvider');
  }
  return context;
};

export default CompaniesContext;
