/** @author Harry Vasanth (harryvasanth.com) */
import { useEffect, useState } from 'react'

export function useLocalStorage<T>(key: string, initialValue: T) {
  const [value, setValue] = useState<T>(() => {
    if (typeof window === 'undefined') return initialValue

    const saved = localStorage.getItem(key)
    if (saved !== null) {
      try {
        return JSON.parse(saved)
      } catch {
        // Fallback for values previously saved as simple strings (e.g. "true" instead of "true")
        if (saved === 'true') return true as unknown as T
        if (saved === 'false') return false as unknown as T
        if (!Number.isNaN(Number(saved))) return Number(saved) as unknown as T
        return saved as unknown as T
      }
    }
    return initialValue
  })

  useEffect(() => {
    if (typeof window !== 'undefined') {
      localStorage.setItem(
        key,
        typeof value === 'string' ? value : JSON.stringify(value),
      )
    }
  }, [key, value])

  return [value, setValue] as const
}
