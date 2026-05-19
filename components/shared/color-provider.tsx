'use client'

import * as React from 'react'
import { useTheme } from 'next-themes'
import { colorStore, applyTheme } from '@/hooks/use-color-store'

export function ColorProvider({ children }: { children: React.ReactNode }) {
  const { theme, resolvedTheme } = useTheme()
  
  const currentTheme = theme === 'system' ? resolvedTheme || 'light' : theme || 'light'
  
  // Subscribe directly to userColor — stable, precise, no function ref issues
  const userColor = colorStore((state) => state.userColor)

  React.useEffect(() => {
    applyTheme(currentTheme, userColor)
  }, [currentTheme, userColor]) // ✅ Both are stable primitive values

  return <>{children}</>
}