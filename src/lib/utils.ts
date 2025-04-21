import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

// Get the package version from the environment
export const getPackageVersion = () => {
  return import.meta.env.VITE_APP_VERSION || '0.0.0'
}
