import prisma from '../../src/lib/prisma'
import { requireApiUser } from '../../src/lib/auth'

export default async function visitsHandler(request, response) {
  const me = await requireApiUser(request, response)
  if (!me) return

  if (request.method === 'GET') {
    const visits = await prisma.profileVisit.findMany({
      where: { visitedId: me },
      orderBy: { createdAt: 'desc' },
      take: 40,
    })
    return response.status(200).json({ data: visits })
  }

  if (request.method === 'POST') {
    const { visitedId } = request.body
    if (!visitedId || visitedId === me) return response.status(200).json({ skipped: true })
    const visit = await prisma.profileVisit.create({ data: { visitorId: me, visitedId } })
    return response.status(201).json({ data: visit })
  }

  return response.status(405).json({ error: 'Method not allowed' })
}
