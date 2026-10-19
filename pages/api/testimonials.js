import prisma from '../../src/lib/prisma'
import { requireApiUser } from '../../src/lib/auth'
import { logActivity, notify } from '../../src/lib/social'

export default async function testimonialsHandler(request, response) {
  if (request.method === 'GET') {
    const { receiverId } = request.query
    if (!receiverId) return response.status(400).json({ error: 'Missing receiverId' })
    const testimonials = await prisma.testimonial.findMany({
      where: { receiverId, isPublic: true },
      orderBy: { createdAt: 'desc' },
    })
    return response.status(200).json({ data: testimonials })
  }

  if (request.method === 'POST') {
    const me = await requireApiUser(request, response)
    if (!me) return
    const { receiverId, text } = request.body
    if (!receiverId || !text) {
      return response.status(400).json({ error: 'Missing fields' })
    }
    const newTestimonial = await prisma.testimonial.create({
      data: { senderId: me, receiverId, text, isPublic: true },
    })
    await logActivity({
      actorId: me,
      type: 'testimonial',
      targetId: receiverId,
      targetName: receiverId,
    })
    await notify({
      userId: receiverId,
      actorId: me,
      type: 'testimonial',
      message: `${me} deixou um depoimento no seu perfil`,
      link: `/profile/${receiverId}`,
    })
    return response.status(201).json({ data: newTestimonial })
  }

  response.status(405).json({ error: 'Method not allowed' })
}
