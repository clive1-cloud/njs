'use server'
import { connectToDatabase } from '@/lib/db'
import Product, { IProduct } from '@/lib/db/models/product.models'
import { PAGE_SIZE } from '../constant'

export async function getAllCategories() {
  await connectToDatabase()
  const categories = await Product.find({ isPublished: true }).distinct(
    'category',
  )
  return categories
}

export async function getProductsForCard({
  tag,
  limit = 4,
}: {
  tag: string
  limit?: number
}) {
  await connectToDatabase()
  const products = await Product.find(
    { tags: { $in: [tag] }, isPublished: true },
    {
      name: 1,
      href: { $concat: ['/product/', '$slug'] },
      image: { $arrayElemAt: ['$images', 0] },
    },
  )

    .sort({ createdAt: 'desc' })
    .limit(limit)
  return JSON.parse(JSON.stringify(products)) as {
    name: string
    href: string
    image: string
  }[]
}

// GET PRODUCTS BY TAG
export async function getProductsByTag({
  tag,
  limit = 10,
}: {
  tag: string
  limit?: number
}) {
  await connectToDatabase()
  const products = await Product.find({
    tags: { $in: [tag] },
    isPublished: true,
  })
    .sort({ createdAt: 'desc' })
    .limit(limit)
  return JSON.parse(JSON.stringify(products)) as IProduct[]
}
// GT PRODUCT BY SLUG
export async function getProductBySlug(slug: string) {
  await connectToDatabase()
  const product = await Product.findOne({ slug, isPublished: true})
  if (!product) throw new Error('product not found')
  return JSON.parse(JSON.stringify(product)) as IProduct
 }

 export async function getRelatedProductsByCategory({
  category,
  productId,
  product_Id,
  limit = 4,
  page = 1,
}: {
  category: string
  productId?: string
  product_Id?: string
  limit?: number
  page?: number

}) {
  await connectToDatabase()
  const skipAmount = (Number(page) - 1) * limit
  const resolvedProductId = productId ?? product_Id
  const conditions: any = {
    isPublished: true,
    category,
  }
  if (resolvedProductId) {
    conditions._id = { $ne: resolvedProductId }
  }

   const products = await Product.find(conditions)
    .sort({ numSales: 'desc' })
    .skip(skipAmount)
    .limit(limit)
   const productsCount = await Product.countDocuments(conditions)
   return {
    data: JSON.parse(JSON.stringify(products)) as IProduct[],
    totalPages: Math.ceil(productsCount / limit),
   }

 }

 