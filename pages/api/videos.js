import prisma from '../../src/lib/prisma'
import { requireApiUser } from '../../src/lib/auth'
import { logActivity } from '../../src/lib/social'

export default async function videosHandler(request, response) {
  if (request.method === 'GET') {
    const { ownerId } = request.query
    const videos = await prisma.video.findMany({
      where: ownerId ? { ownerId } : undefined,
      orderBy: { createdAt: 'desc' },
      take: 40,
    })
    return response.status(200).json({ data: videos })
  }

  const me = await requireApiUser(request, response)
  if (!me) return

  if (request.method === 'POST') {
    const { title, url } = request.body
    if (!title || !url) return response.status(400).json({ error: 'Missing fields' })
    const video = await prisma.video.create({ data: { ownerId: me, title, url } })
    await logActivity({ actorId: me, type: 'video', targetId: video.id, targetName: title })
    return response.status(201).json({ data: video })
  }

  return response.status(405).json({ error: 'Method not allowed' })
}
