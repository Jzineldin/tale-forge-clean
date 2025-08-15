
import React, { createContext, useContext, useState, ReactNode } from 'react';

interface HeaderVisibilityContextType {
  isHeaderVisible: boolean;
  showHeader: () => void;
  hideHeader: () => void;
}

const HeaderVisibilityContext = createContext<HeaderVisibilityContextType | undefined>(undefined);

export const useHeaderVisibility = () => {
  const context = useContext(HeaderVisibilityContext);
  if (context === undefined) {
    throw new Error('useHeaderVisibility must be used within a HeaderVisibilityProvider');
  }
  return context;
};

interface HeaderVisibilityProviderProps {
  children: ReactNode;
}

export const HeaderVisibilityProvider: React.FC<HeaderVisibilityProviderProps> = ({ children }) => {
  const [isHeaderVisible, setIsHeaderVisible] = useState(false);

  const showHeader = () => setIsHeaderVisible(true);
  const hideHeader = () => setIsHeaderVisible(false);

  return (
    <HeaderVisibilityContext.Provider value={{ isHeaderVisible, showHeader, hideHeader }}>
      {children}
    </HeaderVisibilityContext.Provider>
  );
};
