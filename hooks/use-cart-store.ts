import { create } from 'zustand' // Fixed typo 'Import'
import { persist } from 'zustand/middleware'

import { Cart, OrderItem, ShippingAddress } from '@/types'
import { calcDeliveryDateAndPrice } from '@/lib/actions/order.actions'

const initialState: Cart = {
  items: [],
  itemsPrice: 0,
  taxPrice: undefined,
  ShippingPrice: undefined, // Changed to camelCase
  totalPrice: 0,
  paymentMethod: undefined,
  ShippingAddress: undefined, // Changed to camelCase
  deliveryDateIndex: undefined,
}

interface CartState {
  cart: Cart
  addItem: (item: OrderItem, quantity: number) => Promise<string>
  updateItem: (item: OrderItem, quantity: number) => Promise<void>
  removeItem: (item: OrderItem) => Promise<void> // Changed to Promise<void> because it's async
  clearCart: () => void
  setShippingAddress: (shippingAddress: ShippingAddress) => Promise<void>
  setPaymentMethod: (paymentMethod: string) => void
  setDeliveryDateIndex: (index: number) => Promise<void>
}

const useCartStore = create(
  persist<CartState>(
    (set, get) => ({
      cart: initialState,

      addItem: async (item: OrderItem, quantity: number) => {
        const { items, ShippingAddress } = get().cart // Fixed casing
        const existItem = items.find(
          (x) =>
            x.product === item.product &&
            x.color === item.color &&
            x.size === item.size
        )

        if (existItem) {
          if (existItem.countInStock < quantity + existItem.quantity) {
            throw new Error('Not enough items in stock')
          }
        } else {
          if (item.countInStock < quantity) { // Fixed: check against the passed quantity
            throw new Error('Not enough items in stock')
          }
        }

        const updatedCartItems = existItem
          ? items.map((x) =>
              x.product === item.product &&
              x.color === item.color &&
              x.size === item.size
                ? { ...existItem, quantity: existItem.quantity + quantity }
                : x
            )
          : [...items, { ...item, quantity }]

        set({
          cart: {
            ...get().cart,
            items: updatedCartItems,
            ...(await calcDeliveryDateAndPrice({
              items: updatedCartItems,
              ShippingAddress,
            })),
          },
        })
        
        const foundItem = updatedCartItems.find(
          (x) =>
            x.product === item.product &&
            x.color === item.color &&
            x.size === item.size
        )
        if (!foundItem) {
          throw new Error('Item not found in cart')
        }
        return foundItem.clientId
      },

      updateItem: async (item: OrderItem, quantity: number) => {
        const { items, ShippingAddress } = get().cart
        const exist = items.find(
          (x) =>
            x.product === item.product &&
            x.color === item.color &&
            x.size === item.size
        )
        if (!exist) return
        
        const updatedCartItems = items.map((x) =>
          x.product === item.product &&
          x.color === item.color &&
          x.size === item.size
            ? { ...exist, quantity: quantity }
            : x
        )
        
        set({
          cart: {
            ...get().cart,
            items: updatedCartItems,
            ...(await calcDeliveryDateAndPrice({
              items: updatedCartItems,
              ShippingAddress,
            })),
          },
        })
      },

      removeItem: async (item: OrderItem) => {
        const { items, ShippingAddress } = get().cart
        // Logic fix: keep items that DON'T match product + color + size
        const updatedCartItems = items.filter(
          (x) =>
            !(x.product === item.product &&
              x.color === item.color &&
              x.size === item.size)
        )
        
        set({
          cart: {
            ...get().cart,
            items: updatedCartItems,
            ...(await calcDeliveryDateAndPrice({
              items: updatedCartItems,
              ShippingAddress,
            })),
          },
        })
      },

      setShippingAddress: async (ShippingAddress: ShippingAddress) => {
        const { items } = get().cart
        set({
          cart: {
            ...get().cart,
            ShippingAddress,
            ...(await calcDeliveryDateAndPrice({
              items,
              ShippingAddress,
            })),
          },
        })
      },

      setPaymentMethod: (paymentMethod: string) => {
        set({
          cart: {
            ...get().cart,
            paymentMethod,
          },
        })
      },

      setDeliveryDateIndex: async (index: number) => {
        const { items, ShippingAddress } = get().cart

        set({
          cart: {
            ...get().cart,
            ...(await calcDeliveryDateAndPrice({
              items,
              ShippingAddress,
              deliveryDateIndex: index,
            })),
          },
        })
      },

      clearCart: () => {
        set({
          cart: initialState,
        })
      },
    }),
    {
      name: 'cart-store',
    }
  )
)

export default useCartStore