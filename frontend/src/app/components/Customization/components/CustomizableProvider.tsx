"use client";
import React, { createContext, useContext } from 'react';
import { useServerCustomization } from '../hooks/useServerCustomization';
import { CustomizationContextType } from '../types/customization.types';

const CustomizationContext = createContext<CustomizationContextType | null>(null);

export function CustomizationProvider({ children }: { children: React.ReactNode }) {
  const customizationHook = useServerCustomization();

  return (
    <CustomizationContext.Provider value={customizationHook}>
      {children}
    </CustomizationContext.Provider>
  );
}

export function useCustomizationContext() {
  const context = useContext(CustomizationContext);
  if (!context) {
    throw new Error('useCustomizationContext must be used within CustomizationProvider');
  }
  return context;
}