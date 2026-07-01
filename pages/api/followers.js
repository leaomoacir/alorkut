import { PrismaClient } from '@prisma/client'
const prisma = new PrismaClient({})

export default async function followersHandler(request, response) {
    if (request.method === 'POST') {
        const { followerId, followingId } = request.body;

        if (!followerId || !followingId) {
            return response.status(400).json({ error: 'Missing followerId or followingId' });
        }

        // Check if already follows
        const existing = await prisma.follow.findFirst({
            where: { followerId, followingId }
        });

        if (existing) {
            return response.status(400).json({ error: 'Already following' });
        }

        const newFollow = await prisma.follow.create({
            data: { followerId, followingId }
        });

        return response.status(201).json({ data: newFollow });
    }

    if (request.method === 'GET') {
        const { followerId } = request.query;

        if (!followerId) {
            return response.status(400).json({ error: 'Missing followerId query param' });
        }

        const follows = await prisma.follow.findMany({
            where: { followerId }
        });

        return response.status(200).json({ data: { following: follows } });
    }

    if (request.method === 'DELETE') {
        const { followerId, followingId } = request.query;
        if (!followerId || !followingId) return response.status(400).json({ error: 'Missing params' });

        await prisma.follow.deleteMany({
            where: { followerId, followingId }
        });
        return response.status(200).json({ success: true });
    }

    response.status(405).json({ error: 'Method not allowed' });
}
