import prisma from '../../src/lib/prisma'
import { requireApiUser } from '../../src/lib/auth'
import { logActivity, notify } from '../../src/lib/social'
import { isBlocked } from '../../src/lib/privacy'

export default async function fansHandler(request, response) {
  if (request.method === 'GET') {
    const { userId } = request.query
    if (!userId) return response.status(400).json({ error: 'Missing userId' })
    const [fans, stars] = await Promise.all([
      prisma.fan.findMany({ where: { starId: userId }, orderBy: { createdAt: 'desc' } }),
      prisma.fan.findMany({ where: { fanId: userId }, orderBy: { createdAt: 'desc' } }),
    ])
    return response.status(200).json({ data: { fans, stars, count: fans.length } })
  }

  const me = await requireApiUser(request, response)
  if (!me) return

  if (request.method === 'POST') {
    const { starId } = request.body
    if (!starId || starId === me) return response.status(400).json({ error: 'Usuario invalido' })
    if (await isBlocked(me, starId)) return response.status(403).json({ error: 'Nao e possivel ser fa desta pessoa' })
    const existing = await prisma.fan.findUnique({
      where: { fanId_starId: { fanId: me, starId } },
    })
    if (existing) {
      await prisma.fan.delete({ where: { id: existing.id } })
      return response.status(200).json({ data: { action: 'removed' } })
    }
    const created = await prisma.fan.create({ data: { fanId: me, starId } })
    await logActivity({ actorId: me, type: 'fan', targetId: starId, targetName: starId })
    await notify({
      userId: starId,
      actorId: me,
      type: 'fan',
      message: `${me} agora e seu fa`,
      link: `/profile/${me}`,
    })
    return response.status(201).json({ data: created, action: 'added' })
  }

  return response.status(405).json({ error: 'Method not allowed' })
}
