import React from 'react'
import { Star }from 'lucide-react'

export default function Rating({
    rating = 0,
    size = 6,
  }: {
    rating?: number
    size?: number

}) {
    const fullstars = Math.floor(rating)
    const partialstar = rating % 1
    const emptyStars = 5 - Math.ceil(rating)
    return (
        <div 
            className='flex items-center'
            aria-label={`Rating: ${rating} out of 5`}
        >
            {[...Array(fullstars)].map((_, i) => (
                <Star 
                    key={`full-${i}`}
                    className={`w-${size} h-${size} fill-primary text-primary`}
                />
            ))}
            {partialstar > 0 && (
                <div className='relative'>
                    <Star className={`w-${size} text-primary`} />
                    <div
                        className='absolute top-0 left-0 overflow-hidden'
                        style={{ width: `${partialstar * 100}%` }}
                    >
                        <Star className='w-6 h-6 fill-primary text-rimary' />
                    
                    </div>
                </div>
            )}
            {[...Array(emptyStars)].map((_, i) => (
                <Star 
                    key={`empty-${i}`}
                    className={`w-${size} h-${size} text-primary`}
                />
            ))}
        </div>
    )
}