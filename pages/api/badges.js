import prisma from '../../src/lib/prisma'
import { requireApiUser } from '../../src/lib/auth'
import { logActivity, notify } from '../../src/lib/social'

const LABELS = { trusty: 'Confiavel', cool: 'Legal', sexy: 'Sexy' }

export default async function badgesHandler(request, response) {
  if (request.method === 'GET') {
    const { receiverId, loggedUser } = request.query
    if (!receiverId) return response.status(400).json({ error: 'Missing receiverId' })
    const votes = await prisma.badgeVote.findMany({
      where: { receiverId },
    })
    const counts = { trusty: 0, cool: 0, sexy: 0 }
    const myVotes = { trusty: false, cool: false, sexy: false }
    votes.forEach((v) => {
      if (counts[v.badgeType] !== undefined) counts[v.badgeType]++
      if (loggedUser && v.senderId === loggedUser) {
        myVotes[v.badgeType] = true
      }
    })
    return response.status(200).json({ data: { counts, myVotes } })
  }

  if (request.method === 'POST') {
    const me = await requireApiUser(request, response)
    if (!me) return
    const { receiverId, badgeType } = request.body
    if (!receiverId || !badgeType) {
      return response.status(400).json({ error: 'Missing fields' })
    }
    const existing = await prisma.badgeVote.findUnique({
      where: {
        senderId_receiverId_badgeType: { senderId: me, receiverId, badgeType },
      },
    })
    if (existing) {
      await prisma.badgeVote.delete({ where: { id: existing.id } })
      return response.status(200).json({ data: { action: 'removed' } })
    }
    await prisma.badgeVote.create({
      data: { senderId: me, receiverId, badgeType },
    })
    await logActivity({
      actorId: me,
      type: 'badge',
      targetId: receiverId,
      targetName: receiverId,
      extra: LABELS[badgeType] || badgeType,
    })
    await notify({
      userId: receiverId,
      actorId: me,
      type: 'badge',
      message: `${me} votou em voce como ${LABELS[badgeType] || badgeType}`,
      link: `/profile/${receiverId}`,
    })
    return response.status(201).json({ data: { action: 'added' } })
  }

  response.status(405).json({ error: 'Method not allowed' })
}
