'use client'
import { ChevronUp } from 'lucide-react'
import { Button } from '../ui/button'
import Link from 'next/link'
import { APP_NAME } from '@/lib/constant'

export default function Footer() {
  return (
    <footer className='bg-black text-white underline-link'>
      <div className='w-full'>
        <Button
          variant='ghost'
          className='bg-black text-white underline-link'
          onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
        >
          <ChevronUp className='mr-2 h-4 w-4' />
          Back to top
        </Button>
      </div>
      <div className='p-4'>
        <div className='flex justify-center  gap-3 test-sm'>
          <Link href='page/conditions-of-use'>conditions of Use</Link>
          <Link href='/page/privacy-policy'>Privacy Notice</Link>
          <Link href='/page/help'>Help</Link>
        </div>
        <div className='flex justify-center text-sm'>
          <p>© 2026, {APP_NAME}. inc. or its affiliates </p>
        </div>
        <div className='mt-8 flex justify-center text-sm text-gray-400'>
          45, schhol road, elelenwo, port harcourt, rivers state, nigeria.
        </div>
      </div>
    </footer>
  )
}
