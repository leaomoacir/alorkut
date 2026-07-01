import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient({})

export default async function forumsHandler(request, response) {
    if (request.method === 'GET') {
        const { communityId, topicId } = request.query;

        if (topicId) {
            // Retorna os posts do tópico
            const posts = await prisma.communityPost.findMany({
                where: { topicId },
                orderBy: { createdAt: 'asc' }
            });
            const topic = await prisma.communityTopic.findUnique({
                where: { id: topicId }
            });
            return response.status(200).json({ data: { topic, posts } });
        }

        if (communityId) {
            // Retorna os tópicos da comunidade
            const topics = await prisma.communityTopic.findMany({
                where: { communityId },
                orderBy: { createdAt: 'desc' }
            });
            // Buscar contagem de respostas (poderia ser feito via aggregate, mas manual p/ MVP)
            const topicsWithCount = await Promise.all(topics.map(async (t) => {
                const count = await prisma.communityPost.count({ where: { topicId: t.id } });
                return { ...t, postCount: count };
            }));
            return response.status(200).json({ data: topicsWithCount });
        }

        return response.status(400).json({ error: 'Missing communityId or topicId' });
    }

    if (request.method === 'POST') {
        const { type, text, title, authorId, communityId, topicId } = request.body;
        
        if (type === 'topic') {
            if (!title || !authorId || !communityId) return response.status(400).json({ error: 'Missing fields' });
            const newTopic = await prisma.communityTopic.create({
                data: { title, authorId, communityId }
            });
            return response.status(201).json({ data: newTopic });
        }

        if (type === 'post') {
            if (!text || !authorId || !topicId) return response.status(400).json({ error: 'Missing fields' });
            const newPost = await prisma.communityPost.create({
                data: { text, authorId, topicId }
            });
            return response.status(201).json({ data: newPost });
        }

        return response.status(400).json({ error: 'Invalid type' });
    }

    response.status(405).json({ error: 'Method not allowed' });
}
