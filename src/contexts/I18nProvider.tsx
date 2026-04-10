/** @author Harry Vasanth (harryvasanth.com) */
import type React from 'react'
import { useEffect } from 'react'
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

  const t = (key: string, defaultValue?: string) => {
    return translations[language][key] || defaultValue || key
  }

  return (
    <I18nContext.Provider value={{ language, setLanguage, t }}>
      {children}
    </I18nContext.Provider>
  )
}
