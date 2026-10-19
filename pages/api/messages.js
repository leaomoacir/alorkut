import prisma from '../../src/lib/prisma'
import { requireApiUser } from '../../src/lib/auth'
import { notify } from '../../src/lib/social'

export default async function messagesHandler(request, response) {
  const me = await requireApiUser(request, response)
  if (!me) return

  if (request.method === 'GET') {
    const { withUser } = request.query
    if (withUser) {
      const thread = await prisma.directMessage.findMany({
        where: {
          OR: [
            { fromId: me, toId: withUser },
            { fromId: withUser, toId: me },
          ],
        },
        orderBy: { createdAt: 'asc' },
      })
      await prisma.directMessage.updateMany({
        where: { fromId: withUser, toId: me, read: false },
        data: { read: true },
      })
      return response.status(200).json({ data: thread })
    }
    const all = await prisma.directMessage.findMany({
      where: { OR: [{ fromId: me }, { toId: me }] },
      orderBy: { createdAt: 'desc' },
      take: 80,
    })
    const map = new Map()
    all.forEach((msg) => {
      const other = msg.fromId === me ? msg.toId : msg.fromId
      if (!map.has(other)) map.set(other, msg)
    })
    return response.status(200).json({ data: Array.from(map.entries()).map(([user, last]) => ({ user, last })) })
  }

  if (request.method === 'POST') {
    const { toId, text } = request.body
    if (!toId || !text) return response.status(400).json({ error: 'Missing fields' })
    const msg = await prisma.directMessage.create({ data: { fromId: me, toId, text } })
    await notify({
      userId: toId,
      actorId: me,
      type: 'message',
      message: `${me} te enviou uma mensagem`,
      link: `/mensagens?with=${me}`,
    })
    return response.status(201).json({ data: msg })
  }

  return response.status(405).json({ error: 'Method not allowed' })
}
