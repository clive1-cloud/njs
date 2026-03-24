import { Resend } from 'resend'
import PurchaseReceiptEmail from './purchase-receipt'
import { IOrder } from '@/lib/db/models/order.models'
import { SENDER_EMAIL, SENDER_NAME } from '@/lib/constant'
import { format } from 'path/posix'
import { formatId } from '@/lib/utils'


const resend = new Resend(process.env.RESEND_API_KEY as string)

export const sendPurchaseReceipt = async ({ order }: { order: IOrder }) => {
  await resend.emails.send({
    from: `${SENDER_NAME} <${SENDER_EMAIL}>`,
    to: (order.user as { email: string }).email,
    subject: `Order ${formatId(order._id)} Confirmation`,
    react: <PurchaseReceiptEmail order={order} />,
  })
}