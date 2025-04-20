import { useTheme } from '@/components/theme-provider'
import { useMemo } from 'react'

export const useDarkMode = () => {
  const { theme } = useTheme()

  return useMemo(() => {
    return (
      theme === 'dark' ||
      (theme === 'system' &&
        window.matchMedia('(prefers-color-scheme: dark)').matches)
    )
  }, [theme])
}
