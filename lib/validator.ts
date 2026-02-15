import { z } from 'zod'
import { formatNumberWithDecimal } from './utils'

const Price = (field: string) =>
  z.coerce
    .number()
    .refine(
      (value) => /^\d+(\.\d{2})?$/.test(formatNumberWithDecimal(value)),
      `${field} must be a valid price with up to two decimal places`,
    )
export const ProductInputSchema = z.object({
  name: z.string().min(3, 'Name must be at least 3 characters long'),
  slug: z.string().min(3, 'slug must be at least 3 characters'),
  category: z.string().min(1, 'category is required'),
  images: z.array(z.string().min(1, 'product must have at least one image')),
  brand: z.string().min(1, 'description is required'),
  description: z.string().min(1, 'description is required'),
  isPublished: z.boolean(),
  price: Price('price'),
  listPrice: Price('List price'),
  countInStock: z.coerce
    .number()
    .int()
    .nonnegative('count in stock must be a non-negative number'),
  tags: z.array(z.string()).default([]),
  sizes: z.array(z.string()).default([]),
  colors: z.array(z.string()).default([]),
  avgRating: z.coerce
    .number()
    .min(0, 'Average rating must be at least 0')
    .max(5, 'Average rating must be at most 5'),
  numReviews: z.coerce
    .number()
    .int()
    .nonnegative('Number of reviews must be a non-negative integer'),
  ratingDistribution: z
    .array(z.object({ rating: z.number, count: z.number() }))
    .max(5),
  reviews: z.array(z.string()).default([]),
  numSales: z.coerce
    .number()
    .int()
    .nonnegative('Number of sales must be a non-negative number'),
})
