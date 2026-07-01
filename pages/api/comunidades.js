import { PrismaClient } from '@prisma/client'
const prisma = new PrismaClient({})

export default async function recebedorDaRequests(request, response) {

    if (request.method === 'POST') {
        const registroCriado = await prisma.community.create({
            data: {
                title: request.body.title,
                imageUrl: request.body.imageUrl,
                paginaUrl: request.body.paginaUrl,
                creatorId: request.body.creatorId
            }
        })

        console.log(registroCriado);

        response.json({
            dados: 'Algum dado qualquer',
            registroCriado: registroCriado,
        })
        return;
    }

    if (request.method === 'GET') {
        const comunidades = await prisma.community.findMany()
        response.json({
            data: { allCommunities: comunidades }
        })
        return;
    }

    if (request.method === 'DELETE') {
        const { id, creatorId } = request.query;
        
        if (!id || !creatorId) return response.status(400).json({ error: 'Missing params' });

        const comunidade = await prisma.community.findUnique({ where: { id } });
        
        if (!comunidade || comunidade.creatorId !== creatorId) {
            return response.status(403).json({ error: 'Not authorized or not found' });
        }

        await prisma.community.delete({ where: { id } });
        return response.status(200).json({ success: true });
    }

    response.status(404).json({
        message: 'Ainda não temos nada no PUT!'
    })
}