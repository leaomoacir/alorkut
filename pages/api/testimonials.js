import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient({})

export default async function testimonialsHandler(request, response) {
    if (request.method === 'GET') {
        const { receiverId } = request.query;
        if (!receiverId) return response.status(400).json({ error: 'Missing receiverId' });

        const testimonials = await prisma.testimonial.findMany({
            where: { receiverId, isPublic: true },
            orderBy: { createdAt: 'desc' }
        });

        return response.status(200).json({ data: testimonials });
    }

    if (request.method === 'POST') {
        const { senderId, receiverId, text } = request.body;
        if (!senderId || !receiverId || !text) {
            return response.status(400).json({ error: 'Missing fields' });
        }

        const newTestimonial = await prisma.testimonial.create({
            // Por padrão isPublic começa false
            data: { senderId, receiverId, text, isPublic: true } // Mockando public=true temporariamente para facilitar visualização
        });

        return response.status(201).json({ data: newTestimonial });
    }

    response.status(405).json({ error: 'Method not allowed' });
}
