import { HomeCarousel } from '@/components/shared/home/home-carousel'
import data from '@/lib/data'

export default async function page() {
  return <HomeCarousel items={data.carousels} />
}
