import { HomeCard } from '@/components/shared/home/home-card'
import { HomeCarousel } from '@/components/shared/home/home-carousel'
import ProductSlider from '@/components/shared/product/product-slider'
import {
  getAllCategories,
  getProductsByTag,
  getProductsForCard,
} from '@/lib/actions/product.actions'
import data from '@/lib/data'
import { toSlug } from '@/lib/utils'
import {Card, CardContent } from '@/components/ui/card'
import BrowsingHistoryList from '@/components/shared/browsing-history-list'

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
        href: '/search?tag=new-arrival',
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

  const todaysDeals = await getProductsByTag({ tag: 'todays-deal'})
  const bestSellingProducts = await getProductsByTag({ tag: 'best-seller'})

  return (
    <>
      <HomeCarousel items={data.carousels} />
      <div className='md:p-4 md:space-y-4 bg-border'>
        <HomeCard cards={cards} />

        <Card className='w-full rounded-none'>
            <CardContent className='p-4 items-center gap-3'>
              <ProductSlider title={"today's Deals"} products={todaysDeals} />
          </CardContent>

        </Card>

        <Card className='w-full rounded-none'>
          <CardContent className='p-4 items-center gap-3'>
            <ProductSlider
              title='best selling products'
              products={bestSellingProducts}
              hideDetails
            />
          </CardContent>
        </Card>
      </div>
      <div className='p-4 bg-background'>
        <BrowsingHistoryList/>
      </div>
    </>
  )
}
