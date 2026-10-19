import prisma from '../../src/lib/prisma'
import { requireApiUser } from '../../src/lib/auth'
import { notify } from '../../src/lib/social'
import { isBlocked } from '../../src/lib/privacy'

export default async function crushHandler(request, response) {
  const me = await requireApiUser(request, response)
  if (!me) return

  if (request.method === 'GET') {
    const mine = await prisma.crush.findMany({ where: { fromId: me }, orderBy: { createdAt: 'desc' } })
    const incoming = await prisma.crush.findMany({ where: { toId: me } })
    const matches = []
    for (const crush of mine) {
      const back = incoming.find((item) => item.fromId === crush.toId)
      if (back) matches.push(crush.toId)
    }
    return response.status(200).json({
      data: {
        mine: mine.map((c) => ({ ...c, matched: matches.includes(c.toId) })),
        matches,
        count: mine.length,
      },
    })
  }

  if (request.method === 'POST') {
    const { toId } = request.body
    if (!toId || toId === me) return response.status(400).json({ error: 'Usuario invalido' })
    if (await isBlocked(me, toId)) return response.status(403).json({ error: 'Nao e possivel' })
    const existing = await prisma.crush.findUnique({
      where: { fromId_toId: { fromId: me, toId } },
    })
    if (existing) {
      await prisma.crush.delete({ where: { id: existing.id } })
      return response.status(200).json({ data: { action: 'removed' } })
    }
    const created = await prisma.crush.create({ data: { fromId: me, toId } })
    const back = await prisma.crush.findUnique({
      where: { fromId_toId: { fromId: toId, toId: me } },
    })
    if (back) {
      await notify({
        userId: toId,
        actorId: me,
        type: 'crush',
        message: `Match! Voce e ${me} se curtem`,
        link: `/profile/${me}`,
      })
    }
    return response.status(201).json({ data: created, matched: Boolean(back) })
  }

  return response.status(405).json({ error: 'Method not allowed' })
}
