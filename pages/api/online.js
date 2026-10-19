import prisma from '../../src/lib/prisma'
import { requireApiUser } from '../../src/lib/auth'

export default async function onlineHandler(request, response) {
  const me = await requireApiUser(request, response)
  if (!me) return
  if (request.method !== 'GET') return response.status(405).json({ error: 'Method not allowed' })
  const since = new Date(Date.now() - 15 * 60 * 1000)
  const friends = await prisma.follow.findMany({ where: { followerId: me } })
  const ids = friends.map((f) => f.followingId)
  const users = await prisma.user.findMany({
    where: {
      username: { in: ids },
      lastSeen: { gte: since },
    },
  })
  return response.status(200).json({ data: users.map((u) => ({ username: u.username, displayName: u.displayName, lastSeen: u.lastSeen })) })
}
