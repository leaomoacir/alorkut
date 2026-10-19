import prisma from '../../src/lib/prisma'
import { requireApiUser } from '../../src/lib/auth'

export default async function blockHandler(request, response) {
  const me = await requireApiUser(request, response)
  if (!me) return

  if (request.method === 'GET') {
    const items = await prisma.block.findMany({
      where: { blockerId: me },
      orderBy: { createdAt: 'desc' },
    })
    return response.status(200).json({ data: items })
  }

  if (request.method === 'POST') {
    const { blockedId } = request.body
    if (!blockedId || blockedId === me) return response.status(400).json({ error: 'Usuario invalido' })
    const existing = await prisma.block.findUnique({
      where: { blockerId_blockedId: { blockerId: me, blockedId } },
    })
    if (existing) {
      await prisma.block.delete({ where: { id: existing.id } })
      return response.status(200).json({ data: { action: 'removed' } })
    }
    await prisma.follow.deleteMany({
      where: {
        OR: [
          { followerId: me, followingId: blockedId },
          { followerId: blockedId, followingId: me },
        ],
      },
    })
    const created = await prisma.block.create({ data: { blockerId: me, blockedId } })
    return response.status(201).json({ data: created, action: 'added' })
  }

  return response.status(405).json({ error: 'Method not allowed' })
}
