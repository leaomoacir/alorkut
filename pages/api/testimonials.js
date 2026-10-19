import prisma from '../../src/lib/prisma'
import { getUserFromRequest, requireApiUser } from '../../src/lib/auth'
import { logActivity, notify } from '../../src/lib/social'

export default async function testimonialsHandler(request, response) {
  if (request.method === 'GET') {
    const { receiverId } = request.query
    if (!receiverId) return response.status(400).json({ error: 'Missing receiverId' })
    const me = getUserFromRequest(request)?.githubUser
    const where = { receiverId }
    if (!me || me !== receiverId) where.isPublic = true
    const testimonials = await prisma.testimonial.findMany({
      where,
      orderBy: { createdAt: 'desc' },
    })
    return response.status(200).json({ data: testimonials })
  }

  if (request.method === 'POST') {
    const me = await requireApiUser(request, response)
    if (!me) return
    const { receiverId, text, action, id } = request.body
    if (action === 'approve' || action === 'hide') {
      const item = await prisma.testimonial.findUnique({ where: { id } })
      if (!item || item.receiverId !== me) return response.status(403).json({ error: 'Depoimento nao encontrado' })
      const updated = await prisma.testimonial.update({
        where: { id },
        data: { isPublic: action === 'approve' },
      })
      if (action === 'approve') {
        await logActivity({
          actorId: item.senderId,
          type: 'testimonial',
          targetId: me,
          targetName: me,
        })
      }
      return response.status(200).json({ data: updated })
    }
    if (!receiverId || !text) {
      return response.status(400).json({ error: 'Missing fields' })
    }
    const newTestimonial = await prisma.testimonial.create({
      data: { senderId: me, receiverId, text, isPublic: false },
    })
    await notify({
      userId: receiverId,
      actorId: me,
      type: 'testimonial',
      message: `${me} enviou um depoimento para voce aprovar`,
      link: `/profile/${receiverId}`,
    })
    return response.status(201).json({ data: newTestimonial, pending: true })
  }

  response.status(405).json({ error: 'Method not allowed' })
}
