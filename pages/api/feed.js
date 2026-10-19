import prisma from '../../src/lib/prisma'
import { activityLink, formatActivity } from '../../src/lib/social'

export default async function feedHandler(request, response) {
  if (request.method !== 'GET') {
    return response.status(405).json({ error: 'Method not allowed' })
  }

  const { userId } = request.query
  if (!userId) return response.status(400).json({ error: 'Missing userId' })

  const follows = await prisma.follow.findMany({
    where: { followerId: userId },
  })
  const followingIds = follows.map((f) => f.followingId)
  followingIds.push(userId)

  const [activities, scraps] = await Promise.all([
    prisma.activity.findMany({
      where: { actorId: { in: followingIds } },
      orderBy: { createdAt: 'desc' },
      take: 40,
    }),
    prisma.scrap.findMany({
      where: { senderId: { in: followingIds } },
      orderBy: { createdAt: 'desc' },
      take: 20,
    }),
  ])

  const items = [
    ...activities.map((item) => ({
      id: `act-${item.id}`,
      kind: 'activity',
      actorId: item.actorId,
      type: item.type,
      title: formatActivity(item),
      text: item.extra || '',
      link: activityLink(item),
      createdAt: item.createdAt,
    })),
    ...scraps.map((scrap) => ({
      id: `scrap-${scrap.id}`,
      kind: 'scrap',
      actorId: scrap.senderId,
      type: 'scrap',
      title: `${scrap.senderId} escreveu no mural de ${scrap.receiverId}`,
      text: scrap.text,
      link: `/profile/${scrap.receiverId}`,
      createdAt: scrap.createdAt,
    })),
  ]
    .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
    .slice(0, 40)

  return response.status(200).json({ data: items })
}
