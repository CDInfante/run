// run-cdinfante/src/lib/utils.ts
/** @author Harry Vasanth (harryvasanth.com) */
import { type ClassValue, clsx } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

// Helper to convert meteorological degrees to readable compass directions
export const getDirection = (degrees: number | null): string => {
  if (degrees === null) return '--'
  const val = Math.floor(degrees / 22.5 + 0.5)
  const arr = [
    'N',
    'NNE',
    'NE',
    'ENE',
    'E',
    'ESE',
    'SE',
    'SSE',
    'S',
    'SSW',
    'SW',
    'WSW',
    'W',
    'WNW',
    'NW',
    'NNW',
  ]
  return arr[val % 16]
}
