/** @author Harry Vasanth (harryvasanth.com) */
import type React from 'react'
import { useCallback, useEffect, useMemo } from 'react'
import { useLocalStorage } from '../hooks/useLocalStorage'
import { I18nContext } from './I18nContext'
import type { Language } from './I18nTranslations'
import { translations } from './I18nTranslations'

export const I18nProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [language, setLanguage] = useLocalStorage<Language>('language', 'pt-PT')

  useEffect(() => {
    document.documentElement.lang = language
  }, [language])

  // OPTIMIZATION: Memoize the translation function so it doesn't get a new reference on every render
  const t = useCallback(
    (key: string, defaultValue?: string) => {
      // Cast to any/record to safely query dynamic keys without strict Biome indexing errors
      const langDict = translations[language] as Record<string, string>
      return langDict[key] || defaultValue || key
    },
    [language],
  )

  // OPTIMIZATION: Memoize the context value object.
  // This prevents EVERY component in the app from pointlessly re-rendering
  // whenever a non-related state in a higher component changes.
  const contextValue = useMemo(
    () => ({ language, setLanguage, t }),
    [language, setLanguage, t],
  )

  return (
    <I18nContext.Provider value={contextValue}>{children}</I18nContext.Provider>
  )
}
