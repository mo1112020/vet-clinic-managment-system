
import React, { createContext, useState, useContext, ReactNode, useCallback, useMemo } from 'react';
import { allTranslations } from '@/translations/merge-translations';
import type { Language } from '@/translations/merge-translations';

interface LanguageContextType {
  language: Language;
  setLanguage: (language: Language) => void;
  t: (key: string) => string;
}

const LanguageContext = createContext<LanguageContextType | null>(null);

export const LanguageProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [language, setLanguage] = useState<Language>('en');

  const t = useCallback((key: string): string => {
    if (allTranslations[key] && allTranslations[key][language]) {
      return allTranslations[key][language];
    }
    return key;
  }, [language]);
  const value = useMemo(() => ({ language, setLanguage, t }), [language, t]);

  return (
    <LanguageContext.Provider value={value}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
};


export type { Language };
