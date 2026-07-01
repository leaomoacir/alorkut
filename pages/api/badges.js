import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient({})

export default async function badgesHandler(request, response) {
    if (request.method === 'GET') {
        const { receiverId, loggedUser } = request.query;
        if (!receiverId) return response.status(400).json({ error: 'Missing receiverId' });

        const votes = await prisma.badgeVote.findMany({
            where: { receiverId }
        });

        const counts = { trusty: 0, cool: 0, sexy: 0 };
        const myVotes = { trusty: false, cool: false, sexy: false };

        votes.forEach(v => {
            if (counts[v.badgeType] !== undefined) counts[v.badgeType]++;
            if (loggedUser && v.senderId === loggedUser) {
                myVotes[v.badgeType] = true;
            }
        });

        return response.status(200).json({ data: { counts, myVotes } });
    }

    if (request.method === 'POST') {
        const { senderId, receiverId, badgeType } = request.body;
        if (!senderId || !receiverId || !badgeType) {
            return response.status(400).json({ error: 'Missing fields' });
        }

        const existing = await prisma.badgeVote.findUnique({
            where: {
                senderId_receiverId_badgeType: { senderId, receiverId, badgeType }
            }
        });

        if (existing) {
            // Remove o voto se já existir (toggle)
            await prisma.badgeVote.delete({
                where: { id: existing.id }
            });
            return response.status(200).json({ data: { action: 'removed' } });
        } else {
            // Adiciona o voto
            await prisma.badgeVote.create({
                data: { senderId, receiverId, badgeType }
            });
            return response.status(201).json({ data: { action: 'added' } });
        }
    }

    response.status(405).json({ error: 'Method not allowed' });
}
