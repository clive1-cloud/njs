'use client'

import { SearchIcon } from 'lucide-react'
import { Input } from '@/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { APP_NAME } from '@/lib/constant'

// 1. Define the TypeScript interface to accept the categories passed from the Header
interface SearchProps {
  categories: string[]
}

// 2. REMOVED 'async' -> This is now a clean, synchronous client component
export default function Search({ categories }: SearchProps) {
  return (
    <form action='/search' method='get' className='flex items-stretch h-10'>
      <Select name='category'>
        <SelectTrigger className='w-auto h-full dark:border-gray-200 bg-gray-100 text-black border-r rounded-r-none'>
          <SelectValue placeholder='All' />
        </SelectTrigger>
        <SelectContent position='popper'>
          <SelectItem value='all'>All</SelectItem>
          
          {/* 3. Safely map over the categories passed from the server */}
          {categories?.map((category) => (
            <SelectItem key={category} value={category}>
              {category.charAt(0).toUpperCase() + category.slice(1)}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      <Input
        name='q'
        type='text'
        placeholder={`Search ${APP_NAME}...`}
        className='flex-grow rounded-none bg-white text-black border-none focus-visible:ring-0 focus-visible:ring-offset-0'
      />
      <button
  type='submit'
  className='flex items-center justify-center px-4 bg-primary text-primary-foreground rounded-r-md hover:bg-primary/80 transition-colors duration-200'
>
  <SearchIcon size={20} />
    </button>
    </form>
  )
}