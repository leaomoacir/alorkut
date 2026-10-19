import prisma from '../../src/lib/prisma'
import { requireApiUser } from '../../src/lib/auth'

export default async function followersHandler(request, response) {
  if (request.method === 'GET') {
    const { followerId, followingId } = request.query
    if (followingId) {
      const followers = await prisma.follow.findMany({ where: { followingId } })
      return response.status(200).json({ data: { followers } })
    }
    if (!followerId) {
      return response.status(400).json({ error: 'Missing followerId query param' })
    }
    const follows = await prisma.follow.findMany({
      where: { followerId },
    })
    return response.status(200).json({ data: { following: follows } })
  }

  const me = await requireApiUser(request, response)
  if (!me) return

  if (request.method === 'DELETE') {
    const { followingId } = request.query
    if (!followingId) return response.status(400).json({ error: 'Missing params' })
    await prisma.follow.deleteMany({
      where: {
        OR: [
          { followerId: me, followingId },
          { followerId: followingId, followingId: me },
        ],
      },
    })
    await prisma.friendRequest.deleteMany({
      where: {
        OR: [
          { fromId: me, toId: followingId },
          { fromId: followingId, toId: me },
        ],
      },
    })
    return response.status(200).json({ success: true })
  }

  response.status(405).json({ error: 'Use /api/friends para pedidos de amizade' })
}
