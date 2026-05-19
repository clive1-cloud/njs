'use client'

import { ChevronDownIcon, Moon, Sun } from 'lucide-react'
import { useTheme } from 'next-themes'
import * as React from 'react'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'

import useColorStore, { availableColors, applyTheme } from '@/hooks/use-color-store'
import useIsMounted from '@/hooks/use-is-mounted'

export default function ThemeSwitcher() {
  const { theme, setTheme } = useTheme()
  const isMounted = useIsMounted()

  const currentTheme = theme === 'system' ? 'light' : theme || 'light'
  const { color, setColor } = useColorStore(currentTheme)

  const getDotColor = (name: string) => {
    switch (name) {
      case 'Gold': return '#eab308'
      case 'Green': return '#22c55e'
      case 'Red': return '#ef4444'
      default: return '#000'
    }
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger className='header-button h-[41px]'>
        <div className='flex items-center gap-1'>
          {isMounted && theme === 'dark' ? <Moon className='h-4 w-4' /> : <Sun className='h-4 w-4' />}
          {isMounted ? (theme === 'dark' ? 'Dark' : 'Light') : 'Theme'}
          <ChevronDownIcon className='h-4 w-4' />
        </div>
      </DropdownMenuTrigger>

      <DropdownMenuContent className='w-56'>
        <DropdownMenuLabel>Theme</DropdownMenuLabel>

        {/* ✅ Fixed: also re-apply color variables when switching dark/light */}
        <DropdownMenuRadioGroup
          value={theme}
          onValueChange={(newTheme) => {
            setTheme(newTheme)
            applyTheme(newTheme === 'system' ? 'light' : newTheme, color.name)
          }}
        >
          <DropdownMenuRadioItem value='dark'>Dark</DropdownMenuRadioItem>
          <DropdownMenuRadioItem value='light'>Light</DropdownMenuRadioItem>
        </DropdownMenuRadioGroup>

        <DropdownMenuSeparator />
        <DropdownMenuLabel>Color</DropdownMenuLabel>

        <DropdownMenuRadioGroup
          value={isMounted ? color.name : 'Gold'}
          onValueChange={(value) => {
            setColor(value)
            applyTheme(currentTheme, value)
          }}
        >
          {availableColors.map((c) => (
            <DropdownMenuRadioItem key={c.name} value={c.name} className="flex items-center">
              <span
                className='h-4 w-4 mr-2 rounded-full border border-black/10'
                style={{ backgroundColor: getDotColor(c.name) }}
              />
              {c.name}
            </DropdownMenuRadioItem>
          ))}
        </DropdownMenuRadioGroup>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}