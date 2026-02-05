import { ShoppingCartIcon, UserIcon } from 'lucide-react'
import Link from 'next/link'
export default function Menu() {
  return (
    <div className='flex justify-end'>
      <nav className='flex gap-3 w-full'>
        <link href='/signin' className='header-button'>
          <UserIcon className='h-8 w-8' />
          <span className='font-bold'>sign in</span>
        </link>

        <link href='/cart' className='header-button'>
          <ShoppingCartIcon className='h-8 w-8' />
          <span className='font-bold'>cart</span>
        </link>
      </nav>
    </div>
  )
}
