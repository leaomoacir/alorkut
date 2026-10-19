import prisma from '../../src/lib/prisma'
import { requireApiUser } from '../../src/lib/auth'
import { logActivity } from '../../src/lib/social'

export default async function recebedorDaRequests(request, response) {
  if (request.method === 'POST') {
    const me = await requireApiUser(request, response)
    if (!me) return
    const registroCriado = await prisma.community.create({
      data: {
        title: request.body.title,
        imageUrl: request.body.imageUrl || `https://picsum.photos/seed/${encodeURIComponent(request.body.title || 'orkut')}/400/400`,
        paginaUrl: request.body.paginaUrl || '/',
        creatorId: me,
        description: request.body.description || '',
        category: request.body.category || 'Geral',
      },
    })
    await prisma.communityMember.create({
      data: { userId: me, communityId: registroCriado.id },
    })
    await logActivity({
      actorId: me,
      type: 'community_create',
      targetId: registroCriado.id,
      targetName: registroCriado.title,
    })
    response.json({
      dados: 'Comunidade criada',
      registroCriado,
    })
    return
  }

  if (request.method === 'GET') {
    const comunidades = await prisma.community.findMany({
      orderBy: { createdAt: 'desc' },
    })
    response.json({
      data: { allCommunities: comunidades },
    })
    return
  }

  if (request.method === 'DELETE') {
    const me = await requireApiUser(request, response)
    if (!me) return
    const { id } = request.query
    if (!id) return response.status(400).json({ error: 'Missing params' })
    const comunidade = await prisma.community.findUnique({ where: { id } })
    if (!comunidade || comunidade.creatorId !== me) {
      return response.status(403).json({ error: 'Not authorized or not found' })
    }
    const topics = await prisma.communityTopic.findMany({ where: { communityId: id } })
    const topicIds = topics.map((t) => t.id)
    if (topicIds.length) {
      await prisma.communityPost.deleteMany({ where: { topicId: { in: topicIds } } })
      await prisma.communityTopic.deleteMany({ where: { communityId: id } })
    }
    await prisma.communityMember.deleteMany({ where: { communityId: id } })
    await prisma.community.delete({ where: { id } })
    return response.status(200).json({ success: true })
  }

  response.status(404).json({ message: 'Metodo nao suportado' })
}
