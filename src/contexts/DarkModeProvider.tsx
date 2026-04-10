/** @author Harry Vasanth (harryvasanth.com) */
import type React from 'react'
import { useEffect } from 'react'
import { useLocalStorage } from '../hooks/useLocalStorage'
import { DarkModeContext } from './DarkModeContext'

export const DarkModeProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  // Determine initial system preference safely
  const getSystemTheme = () => {
    if (typeof window === 'undefined') return 'light'
    return window.matchMedia('(prefers-color-scheme: dark)').matches
      ? 'dark'
      : 'light'
  }

  const [theme, setTheme] = useLocalStorage<'dark' | 'light'>(
    'theme',
    getSystemTheme(),
  )

  const isDark = theme === 'dark'

  useEffect(() => {
    const root = window.document.documentElement
    if (isDark) {
      root.classList.add('dark')
    } else {
      root.classList.remove('dark')
    }
  }, [isDark])

  const toggleDarkMode = () => setTheme(isDark ? 'light' : 'dark')

  return (
    <DarkModeContext.Provider value={{ isDark, toggleDarkMode }}>
      {children}
    </DarkModeContext.Provider>
  )
}
