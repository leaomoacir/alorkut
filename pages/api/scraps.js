import prisma from '../../src/lib/prisma'
import { requireApiUser } from '../../src/lib/auth'
import { logActivity, notify } from '../../src/lib/social'

export default async function scrapsHandler(request, response) {
  if (request.method === 'GET') {
    const { receiverId } = request.query
    if (!receiverId) return response.status(400).json({ error: 'Missing receiverId' })
    const scraps = await prisma.scrap.findMany({
      where: { receiverId },
      orderBy: { createdAt: 'desc' },
      take: 20,
    })
    return response.status(200).json({ data: scraps })
  }

  if (request.method === 'POST') {
    const me = await requireApiUser(request, response)
    if (!me) return
    const { receiverId, text, parentId } = request.body
    if (!receiverId || !text) {
      return response.status(400).json({ error: 'Missing required fields' })
    }
    const newScrap = await prisma.scrap.create({
      data: { senderId: me, receiverId, text, parentId: parentId || null },
    })
    await logActivity({
      actorId: me,
      type: 'scrap',
      targetId: receiverId,
      targetName: receiverId,
    })
    await notify({
      userId: receiverId,
      actorId: me,
      type: 'scrap',
      message: `${me} deixou um recado no seu mural`,
      link: `/profile/${receiverId}`,
    })
    return response.status(201).json({ data: newScrap })
  }

  response.status(405).json({ error: 'Method not allowed' })
}
