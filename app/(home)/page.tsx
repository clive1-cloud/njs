import { HomeCard } from '@/components/shared/home/home-card'
import { HomeCarousel } from '@/components/shared/home/home-carousel'
import {
  getAllCategories,
  getProductsForCard,
} from '@/lib/actions/product.actions'
import data from '@/lib/data'
import { toSlug } from '@/lib/utils'

export default async function page() {
  const categories = (await getAllCategories()).slice(0, 4)
  const newArrivals = await getProductsForCard({
    tag: 'new-arrival',
    limit: 4,
  })

  const featureds = await getProductsForCard({
    tag: 'featured',
    limit: 4,
  })
  const bestSellers = await getProductsForCard({
    tag: 'best-seller',
    limit: 4,
  })

  const cards = [
    {
      title: 'categories to explore',
      link: {
        text: 'See More',
        href: '/search',
      },
      items: categories.map((category) => ({
        name: category,
        image: `/images/${toSlug(category)}.jpg`,
        href: `/search?category=${category}`,
      })),
    },

    {
      title: 'Explore New Arrivals',
      items: newArrivals,
      link: {
        text: 'view All',
        href: '/search?tag=new-arrival',
      },
    },

    {
      title: 'Discover best sellers',
      items: bestSellers,
      link: {
        text: 'view-all',
        href: '/search?tag=new-arrrival',
      },
    },

    {
      title: 'Featured Products',
      items: featureds,
      link: {
        text: 'shop now',
        href: '/search?tag=new-arrival',
      },
    },
  ]
  return (
    <>
      <HomeCarousel items={data.carousels} />
      <div className='md:p-4 md:space-y-4 bg-border'>
        <HomeCard cards={cards} />
      </div>
    </>
  )
}
