import { CartSchema, OrderInputSchema, OrderItemSchema, ProductInputSchema, ReviewInputSchema, ShippingAddressSchema, UserInputSchema, UserNameSchema, UserSignInSchema, UserSignUpSchema } from '@/lib/validator'
import { z } from 'zod'

export type IReviewInput = z.infer<typeof ReviewInputSchema>
export type IReviewDetails = IReviewInput & {
  _id: string
  createdAt: string
  user: {
    name: string
  }
}

export type IProductInput = z.infer<typeof ProductInputSchema> & {
  avgRating: number
  numReviews: number
  ratingDistribution: Array<{ rating: number; count: number }>
}

export type Data = {
  users: IUserInput[]
  products: IProductInput[]
  reviews: {
    title: string
    rating: number
    comment: string
  }[]
  headerMenus: {
    name: string
    href: string
  }[]
  carousels: {
    image: string
    url: string
    title: string
    buttonCaption: string
    isPublished: boolean
  }[]
}
export type IOrderInput = z.infer<typeof OrderInputSchema>
export type OrderItem = z.infer<typeof OrderItemSchema>
export type Cart = z.infer<typeof CartSchema>
export type ShippingAddress = z.infer<typeof ShippingAddressSchema>

// user
export type IUserInput = z.infer<typeof UserInputSchema>
export type IUserSignin = z.infer<typeof UserSignInSchema>
export type IUserSignUP = z.infer<typeof UserSignUpSchema>
export type IUserName = z.infer<typeof UserNameSchema>

