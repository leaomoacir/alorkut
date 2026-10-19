import prisma from '../../src/lib/prisma'
import { requireApiUser } from '../../src/lib/auth'
import { logActivity } from '../../src/lib/social'

export default async function eventsHandler(request, response) {
  if (request.method === 'GET') {
    const events = await prisma.socialEvent.findMany({ orderBy: { createdAt: 'desc' }, take: 40 })
    const withRsvp = await Promise.all(events.map(async (event) => {
      const rsvps = await prisma.eventRsvp.findMany({ where: { eventId: event.id } })
      return { ...event, rsvps, going: rsvps.filter((r) => r.status === 'yes').length }
    }))
    return response.status(200).json({ data: withRsvp })
  }

  const me = await requireApiUser(request, response)
  if (!me) return

  if (request.method === 'POST') {
    const { action, title, description, place, happensAt, eventId, status } = request.body
    if (action === 'rsvp') {
      if (!eventId) return response.status(400).json({ error: 'Missing eventId' })
      const rsvp = await prisma.eventRsvp.upsert({
        where: { eventId_userId: { eventId, userId: me } },
        update: { status: status || 'yes' },
        create: { eventId, userId: me, status: status || 'yes' },
      })
      return response.status(200).json({ data: rsvp })
    }
    if (!title || !happensAt) return response.status(400).json({ error: 'Missing fields' })
    const event = await prisma.socialEvent.create({
      data: {
        creatorId: me,
        title,
        description: description || '',
        place: place || '',
        happensAt,
      },
    })
    await prisma.eventRsvp.create({ data: { eventId: event.id, userId: me, status: 'yes' } })
    await logActivity({ actorId: me, type: 'event', targetId: event.id, targetName: title })
    return response.status(201).json({ data: event })
  }

  return response.status(405).json({ error: 'Method not allowed' })
}
