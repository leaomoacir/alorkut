import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient({})

export default async function feedHandler(request, response) {
    if (request.method !== 'GET') {
        return response.status(405).json({ error: 'Method not allowed' });
    }

    const { userId } = request.query;
    if (!userId) return response.status(400).json({ error: 'Missing userId' });

    // Pega quem o usuario segue internamente
    const follows = await prisma.follow.findMany({
        where: { followerId: userId }
    });

    const followingIds = follows.map(f => f.followingId);
    followingIds.push(userId); // Inclui o proprio usuario no feed

    const feedScraps = await prisma.scrap.findMany({
        where: { senderId: { in: followingIds } },
        orderBy: { createdAt: 'desc' },
        take: 30
    });

    return response.status(200).json({ data: feedScraps });
}
