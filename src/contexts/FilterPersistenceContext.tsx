import React, { createContext, useContext, useState, useEffect } from 'react';

interface FilterPersistenceContextType {
  isPersistent: boolean;
  togglePersistence: () => void;
  getFilters: (key: string) => Record<string, string>;
  setFilters: (key: string, filters: Record<string, string>) => void;
}

const FilterPersistenceContext = createContext<FilterPersistenceContextType | null>(null);

export function FilterPersistenceProvider({ children }: { children: React.ReactNode }) {
  const [isPersistent, setIsPersistent] = useState(() => {
    const stored = localStorage.getItem('filterPersistence');
    return stored ? JSON.parse(stored) : false;
  });

  const [filters, setFilters] = useState<Record<string, Record<string, string>>>({});

  useEffect(() => {
    localStorage.setItem('filterPersistence', JSON.stringify(isPersistent));
  }, [isPersistent]);

  const togglePersistence = () => {
    setIsPersistent(prev => !prev);
    if (!isPersistent) {
      setFilters({});
    }
  };

  const getFilters = (key: string) => {
    return isPersistent ? filters[key] || {} : {};
  };

  const setPageFilters = (key: string, pageFilters: Record<string, string>) => {
    if (isPersistent) {
      setFilters(prev => ({
        ...prev,
        [key]: pageFilters
      }));
    }
  };

  return (
    <FilterPersistenceContext.Provider 
      value={{
        isPersistent,
        togglePersistence,
        getFilters,
        setFilters: setPageFilters
      }}
    >
      {children}
    </FilterPersistenceContext.Provider>
  );
}

export function useFilterPersistence() {
  const context = useContext(FilterPersistenceContext);
  if (!context) {
    throw new Error('useFilterPersistence must be used within a FilterPersistenceProvider');
  }
  return context;
}