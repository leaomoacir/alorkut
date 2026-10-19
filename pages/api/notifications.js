import prisma from '../../src/lib/prisma'
import { requireApiUser } from '../../src/lib/auth'

export default async function notificationsHandler(request, response) {
  const me = await requireApiUser(request, response)
  if (!me) return

  if (request.method === 'GET') {
    try {
      const items = await prisma.notification.findMany({
        where: { userId: me },
        orderBy: { createdAt: 'desc' },
        take: 30,
      })
      const unread = items.filter((n) => !n.read).length
      return response.status(200).json({ data: { items, unread } })
    } catch (err) {
      return response.status(200).json({ data: { items: [], unread: 0 } })
    }
  }

  if (request.method === 'POST') {
    try {
      await prisma.notification.updateMany({
        where: { userId: me, read: false },
        data: { read: true },
      })
    } catch (err) {
      return response.status(200).json({ success: true })
    }
    return response.status(200).json({ success: true })
  }

  return response.status(405).json({ error: 'Method not allowed' })
}
