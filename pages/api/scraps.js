import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient({})

export default async function scrapsHandler(request, response) {
    if (request.method === 'GET') {
        const { receiverId } = request.query;
        if (!receiverId) return response.status(400).json({ error: 'Missing receiverId' });

        const scraps = await prisma.scrap.findMany({
            where: { receiverId },
            orderBy: { createdAt: 'desc' },
            take: 20
        });

        return response.status(200).json({ data: scraps });
    }

    if (request.method === 'POST') {
        const { senderId, receiverId, text } = request.body;
        if (!senderId || !receiverId || !text) {
            return response.status(400).json({ error: 'Missing required fields' });
        }

        const newScrap = await prisma.scrap.create({
            data: { senderId, receiverId, text }
        });

        return response.status(201).json({ data: newScrap });
    }

    response.status(405).json({ error: 'Method not allowed' });
}
