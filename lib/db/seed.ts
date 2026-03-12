import data from '@/lib/data'
import { connectToDatabase } from '.'
import Product from './models/product.models'
import { cwd } from 'process'
import { loadEnvConfig } from '@next/env'
import User from './models/user.model'

loadEnvConfig(cwd())

const main = async () => {
  try {
    const { products, users } = data
    await connectToDatabase(process.env.MONGODB_URI)

    await User.deleteMany()
    const createdUser = await User.insertMany(users)

    await Product.deleteMany()
    const CreatedProducts = await Product.insertMany(products)

    console.log({
      createdUser,
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
