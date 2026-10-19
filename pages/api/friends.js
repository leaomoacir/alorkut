import prisma from '../../src/lib/prisma'
import { requireApiUser } from '../../src/lib/auth'
import { logActivity, notify } from '../../src/lib/social'

export default async function friendsHandler(request, response) {
  const me = await requireApiUser(request, response)
  if (!me) return

  if (request.method === 'GET') {
    const [incoming, outgoing, friends] = await Promise.all([
      prisma.friendRequest.findMany({ where: { toId: me, status: 'pending' }, orderBy: { createdAt: 'desc' } }),
      prisma.friendRequest.findMany({ where: { fromId: me, status: 'pending' }, orderBy: { createdAt: 'desc' } }),
      prisma.follow.findMany({ where: { followerId: me } }),
    ])
    return response.status(200).json({ data: { incoming, outgoing, friends } })
  }

  if (request.method === 'POST') {
    const { action, toId, requestId } = request.body
    if (action === 'request') {
      if (!toId || toId === me) return response.status(400).json({ error: 'Usuario invalido' })
      const already = await prisma.follow.findFirst({ where: { followerId: me, followingId: toId } })
      if (already) return response.status(400).json({ error: 'Voces ja sao amigos' })
      const pending = await prisma.friendRequest.findFirst({
        where: {
          OR: [
            { fromId: me, toId, status: 'pending' },
            { fromId: toId, toId: me, status: 'pending' },
          ],
        },
      })
      if (pending) return response.status(200).json({ data: pending, already: true })
      const created = await prisma.friendRequest.create({ data: { fromId: me, toId } })
      await notify({
        userId: toId,
        actorId: me,
        type: 'friend_request',
        message: `${me} quer ser seu amigo`,
        link: '/amigos',
      })
      return response.status(201).json({ data: created })
    }
    if (action === 'accept') {
      const item = await prisma.friendRequest.findUnique({ where: { id: requestId } })
      if (!item || item.toId !== me) return response.status(403).json({ error: 'Pedido nao encontrado' })
      await prisma.friendRequest.update({ where: { id: requestId }, data: { status: 'accepted' } })
      await prisma.follow.upsert({
        where: { followerId_followingId: { followerId: me, followingId: item.fromId } },
        update: {},
        create: { followerId: me, followingId: item.fromId },
      })
      await prisma.follow.upsert({
        where: { followerId_followingId: { followerId: item.fromId, followingId: me } },
        update: {},
        create: { followerId: item.fromId, followingId: me },
      })
      await logActivity({ actorId: me, type: 'follow', targetId: item.fromId, targetName: item.fromId })
      await notify({
        userId: item.fromId,
        actorId: me,
        type: 'friend_accept',
        message: `${me} aceitou seu pedido de amizade`,
        link: `/profile/${me}`,
      })
      return response.status(200).json({ success: true })
    }
    if (action === 'reject') {
      const item = await prisma.friendRequest.findUnique({ where: { id: requestId } })
      if (!item || item.toId !== me) return response.status(403).json({ error: 'Pedido nao encontrado' })
      await prisma.friendRequest.update({ where: { id: requestId }, data: { status: 'rejected' } })
      return response.status(200).json({ success: true })
    }
    return response.status(400).json({ error: 'Acao invalida' })
  }

  return response.status(405).json({ error: 'Method not allowed' })
}
