import prisma from '../../src/lib/prisma'
import { requireApiUser } from '../../src/lib/auth'

export default async function photoCommentsHandler(request, response) {
  if (request.method === 'GET') {
    const { photoId } = request.query
    if (!photoId) return response.status(400).json({ error: 'Missing photoId' })
    const comments = await prisma.photoComment.findMany({
      where: { photoId },
      orderBy: { createdAt: 'asc' },
    })
    return response.status(200).json({ data: comments })
  }

  if (request.method === 'POST') {
    const me = await requireApiUser(request, response)
    if (!me) return
    const { photoId, text } = request.body
    if (!photoId || !text) return response.status(400).json({ error: 'Missing fields' })
    const comment = await prisma.photoComment.create({
      data: { photoId, authorId: me, text },
    })
    return response.status(201).json({ data: comment })
  }

  return response.status(405).json({ error: 'Method not allowed' })
}
