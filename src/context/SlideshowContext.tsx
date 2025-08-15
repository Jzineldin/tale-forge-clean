import React, { createContext, useContext, useState, ReactNode } from 'react';

interface SlideshowContextType {
  isSlideshowOpen: boolean;
  openSlideshow: () => void;
  closeSlideshow: () => void;
}

const SlideshowContext = createContext<SlideshowContextType | undefined>(undefined);

export const useSlideshow = () => {
  const context = useContext(SlideshowContext);
  if (context === undefined) {
    throw new Error('useSlideshow must be used within a SlideshowProvider');
  }
  return context;
};

interface SlideshowProviderProps {
  children: ReactNode;
}

export const SlideshowProvider: React.FC<SlideshowProviderProps> = ({ children }) => {
  const [isSlideshowOpen, setIsSlideshowOpen] = useState(false);

  const openSlideshow = () => {
    setIsSlideshowOpen(true);
  };

  const closeSlideshow = () => {
    setIsSlideshowOpen(false);
  };

  return (
    <SlideshowContext.Provider value={{
      isSlideshowOpen,
      openSlideshow,
      closeSlideshow
    }}>
      {children}
    </SlideshowContext.Provider>
  );
}; 