/** @author Harry Vasanth (harryvasanth.com) */
import type React from 'react'
import { useEffect } from 'react'
import { useLocalStorage } from '../hooks/useLocalStorage'
import { DarkModeContext } from './DarkModeContext'

// OPTIMIZATION: Hoisted outside the component to prevent recreation
const getSystemTheme = () => {
  if (typeof window === 'undefined') return 'light'
  return window.matchMedia('(prefers-color-scheme: dark)').matches
    ? 'dark'
    : 'light'
}

export const DarkModeProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [theme, setTheme] = useLocalStorage<'dark' | 'light'>(
    'theme',
    getSystemTheme(),
  )

  const isDark = theme === 'dark'

  useEffect(() => {
    const root = window.document.documentElement
    const metaThemeColor = document.querySelector('meta[name="theme-color"]')

    if (isDark) {
      root.classList.add('dark')
      // Update mobile status bar to match dark mode (Tailwind slate-950)
      if (metaThemeColor) metaThemeColor.setAttribute('content', '#020617')
    } else {
      root.classList.remove('dark')
      // Update mobile status bar to match light mode (Brand Navy)
      if (metaThemeColor) metaThemeColor.setAttribute('content', '#001e40')
    }
  }, [isDark])

  const toggleDarkMode = () => setTheme(isDark ? 'light' : 'dark')

  return (
    <DarkModeContext.Provider value={{ isDark, toggleDarkMode }}>
      {children}
    </DarkModeContext.Provider>
  )
}
