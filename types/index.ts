import { CartSchema, OrderItemSchema, ProductInputSchema, UserInputSchema, UserSignInSchema, UserSignUpSchema } from '@/lib/validator'
import { z } from 'zod'
export type IProductInput = z.infer<typeof ProductInputSchema>

export type Data = {
  users: IUserInput[]
  products: IProductInput[]
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

export type OrderItem = z.infer<typeof OrderItemSchema>
export type Cart = z.infer<typeof CartSchema>

// user
export type IUserInput = z.infer<typeof UserInputSchema>
export type IUserSignin = z.infer<typeof UserSignInSchema>
export type IUserSignUP = z.infer<typeof UserSignUpSchema>

