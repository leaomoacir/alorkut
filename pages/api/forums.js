import prisma from '../../src/lib/prisma'
import { requireApiUser } from '../../src/lib/auth'
import { logActivity, notify } from '../../src/lib/social'

export default async function forumsHandler(request, response) {
  if (request.method === 'GET') {
    const { communityId, topicId } = request.query
    if (topicId) {
      const posts = await prisma.communityPost.findMany({
        where: { topicId },
        orderBy: { createdAt: 'asc' },
      })
      const topic = await prisma.communityTopic.findUnique({
        where: { id: topicId },
      })
      return response.status(200).json({ data: { topic, posts } })
    }
    if (communityId) {
      const topics = await prisma.communityTopic.findMany({
        where: { communityId },
        orderBy: { createdAt: 'desc' },
      })
      const topicsWithCount = await Promise.all(topics.map(async (t) => {
        const count = await prisma.communityPost.count({ where: { topicId: t.id } })
        return { ...t, postCount: count }
      }))
      return response.status(200).json({ data: topicsWithCount })
    }
    return response.status(400).json({ error: 'Missing communityId or topicId' })
  }

  if (request.method === 'POST') {
    const me = await requireApiUser(request, response)
    if (!me) return
    const { type, text, title, communityId, topicId } = request.body
    if (type === 'topic') {
      if (!title || !communityId) return response.status(400).json({ error: 'Missing fields' })
      const newTopic = await prisma.communityTopic.create({
        data: { title, authorId: me, communityId },
      })
      const community = await prisma.community.findUnique({ where: { id: communityId } })
      await logActivity({
        actorId: me,
        type: 'topic',
        targetId: newTopic.id,
        targetName: title,
        extra: communityId,
      })
      if (community) {
        await notify({
          userId: community.creatorId,
          actorId: me,
          type: 'topic',
          message: `${me} criou o topico "${title}" em ${community.title}`,
          link: `/comunidades/${communityId}`,
        })
      }
      return response.status(201).json({ data: newTopic })
    }
    if (type === 'post') {
      if (!text || !topicId) return response.status(400).json({ error: 'Missing fields' })
      const newPost = await prisma.communityPost.create({
        data: { text, authorId: me, topicId },
      })
      const topic = await prisma.communityTopic.findUnique({ where: { id: topicId } })
      await logActivity({
        actorId: me,
        type: 'post',
        targetId: topicId,
        targetName: topic ? topic.title : 'topico',
        extra: topic ? topic.communityId : '',
      })
      if (topic) {
        await notify({
          userId: topic.authorId,
          actorId: me,
          type: 'post',
          message: `${me} respondeu no topico "${topic.title}"`,
          link: `/comunidades/${topic.communityId}`,
        })
      }
      return response.status(201).json({ data: newPost })
    }
    return response.status(400).json({ error: 'Invalid type' })
  }

  response.status(405).json({ error: 'Method not allowed' })
}
