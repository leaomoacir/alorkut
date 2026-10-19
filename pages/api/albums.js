import prisma from '../../src/lib/prisma'
import { requireApiUser } from '../../src/lib/auth'
import { logActivity } from '../../src/lib/social'

export default async function albumsHandler(request, response) {
  if (request.method === 'GET') {
    const { ownerId, albumId } = request.query
    if (albumId) {
      const album = await prisma.album.findUnique({ where: { id: albumId } })
      const photos = await prisma.photo.findMany({
        where: { albumId },
        orderBy: { createdAt: 'desc' },
      })
      return response.status(200).json({ data: { album, photos } })
    }
    if (!ownerId) return response.status(400).json({ error: 'Missing ownerId' })
    const albums = await prisma.album.findMany({
      where: { ownerId },
      orderBy: { createdAt: 'desc' },
    })
    const withPhotos = await Promise.all(albums.map(async (album) => {
      const photos = await prisma.photo.findMany({
        where: { albumId: album.id },
        orderBy: { createdAt: 'desc' },
      })
      return { ...album, photos, count: photos.length }
    }))
    return response.status(200).json({ data: withPhotos })
  }

  if (request.method === 'POST') {
    const me = await requireApiUser(request, response)
    if (!me) return
    const { type, title, albumId, imageUrl, caption } = request.body
    if (type === 'album') {
      if (!title) return response.status(400).json({ error: 'Missing fields' })
      const album = await prisma.album.create({ data: { ownerId: me, title } })
      return response.status(201).json({ data: album })
    }
    if (type === 'photo') {
      if (!albumId || !imageUrl) return response.status(400).json({ error: 'Missing fields' })
      const album = await prisma.album.findUnique({ where: { id: albumId } })
      if (!album || album.ownerId !== me) return response.status(403).json({ error: 'Album nao e seu' })
      const photo = await prisma.photo.create({
        data: { albumId, imageUrl, caption: caption || '' },
      })
      await logActivity({
        actorId: me,
        type: 'photo',
        targetId: album.id,
        targetName: album.title,
      })
      return response.status(201).json({ data: photo })
    }
    return response.status(400).json({ error: 'Invalid type' })
  }

  return response.status(405).json({ error: 'Method not allowed' })
}
