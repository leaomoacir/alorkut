import prisma from '../../src/lib/prisma'
import { requireApiUser } from '../../src/lib/auth'
import { logActivity, notify } from '../../src/lib/social'

export default async function giftsHandler(request, response) {
  const me = await requireApiUser(request, response)
  if (!me) return

  if (request.method === 'GET') {
    const { userId } = request.query
    const target = userId || me
    const gifts = await prisma.gift.findMany({
      where: { receiverId: target },
      orderBy: { createdAt: 'desc' },
      take: 40,
    })
    return response.status(200).json({ data: gifts })
  }

  if (request.method === 'POST') {
    const { receiverId, giftType, message } = request.body
    if (!receiverId || !giftType) return response.status(400).json({ error: 'Missing fields' })
    const gift = await prisma.gift.create({
      data: { senderId: me, receiverId, giftType, message: message || '' },
    })
    await logActivity({ actorId: me, type: 'gift', targetId: receiverId, targetName: receiverId, extra: giftType })
    await notify({
      userId: receiverId,
      actorId: me,
      type: 'gift',
      message: `${me} te enviou um presente: ${giftType}`,
      link: `/profile/${receiverId}`,
    })
    return response.status(201).json({ data: gift })
  }

  return response.status(405).json({ error: 'Method not allowed' })
}
