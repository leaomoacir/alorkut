import prisma from '../../src/lib/prisma'
import { requireApiUser } from '../../src/lib/auth'
import { logActivity, notify } from '../../src/lib/social'

export default async function membersHandler(request, response) {
  if (request.method === 'GET') {
    const { communityId, userId } = request.query
    if (communityId) {
      const members = await prisma.communityMember.findMany({
        where: { communityId },
        orderBy: { createdAt: 'desc' },
      })
      const joined = userId ? members.some((m) => m.userId === userId) : false
      return response.status(200).json({ data: { members, count: members.length, joined } })
    }
    if (userId) {
      const memberships = await prisma.communityMember.findMany({ where: { userId } })
      return response.status(200).json({ data: memberships })
    }
    return response.status(400).json({ error: 'Missing params' })
  }

  const me = await requireApiUser(request, response)
  if (!me) return

  if (request.method === 'POST') {
    const { communityId } = request.body
    if (!communityId) return response.status(400).json({ error: 'Missing fields' })
    const community = await prisma.community.findUnique({ where: { id: communityId } })
    if (!community) return response.status(404).json({ error: 'Community not found' })
    const existing = await prisma.communityMember.findUnique({
      where: { userId_communityId: { userId: me, communityId } },
    })
    if (existing) return response.status(200).json({ data: existing, already: true })
    const member = await prisma.communityMember.create({ data: { userId: me, communityId } })
    await logActivity({
      actorId: me,
      type: 'community_join',
      targetId: communityId,
      targetName: community.title,
    })
    await notify({
      userId: community.creatorId,
      actorId: me,
      type: 'community_join',
      message: `${me} entrou na comunidade ${community.title}`,
      link: `/comunidades/${communityId}`,
    })
    return response.status(201).json({ data: member })
  }

  if (request.method === 'DELETE') {
    const { communityId } = request.query
    if (!communityId) return response.status(400).json({ error: 'Missing params' })
    await prisma.communityMember.deleteMany({ where: { userId: me, communityId } })
    return response.status(200).json({ success: true })
  }

  return response.status(405).json({ error: 'Method not allowed' })
}
