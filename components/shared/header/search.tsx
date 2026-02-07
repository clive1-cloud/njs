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
const categories = ['men', 'women', 'kids', 'accessories']

export default function Search() {
  return (
    <form action='/search' method='get' className='flex items-stretch h-10'>
      <Select name='category'>
        <SelectTrigger className='w-auto h-full dark:border-gray-200 bg-gray-100 text-black border-r rounded-r-none'>
          <SelectValue placeholder='All' />
        </SelectTrigger>
        <SelectContent position='popper'>
          <SelectItem value='all'>All</SelectItem>
          {categories.map((category) => (
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
        className='flex-grow rounded-none bg-white border-none focus-visible:ring-0 focus-visible:ring-offset-0'
      />
      <button
        type='submit'
        className='flex items-center justify-center px-4 bg-yellow-400 text-black rounded-r-md hover:bg-gray-200 transition-colors duration-200'
      >
        <SearchIcon size={20} />
      </button>
    </form>
  )
}
