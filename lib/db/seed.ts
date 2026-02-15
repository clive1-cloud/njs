import data from '@/lib/data'
import { connectToDatabase } from '.'
import Product from './models/product.models'
import { cwd } from 'process'
import { loadEnvConfig } from '@next/env'
loadEnvConfig(cwd())

const main = async () => {
  try {
    const { products } = data
    await connectToDatabase(process.env.MONGODB_URI)

    await Product.deleteMany()
    const CreatedProducts = await Product.insertMany(products)

    console.log({
      CreatedProducts,
      message: 'seeded database successfully',
    })
    process.exit(0)
  } catch (error) {
    console.error(error)
    throw new Error('failed to seed database')
  }
}

main()
