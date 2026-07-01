import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient({})

export default async function profileHandler(request, response) {
    if (request.method !== 'GET') {
        return response.status(405).json({ error: 'Method not allowed' });
    }

    const { username } = request.query;
    if (!username) {
        return response.status(400).json({ error: 'Missing username' });
    }

    try {
        // Tenta achar no cache
        const cached = await prisma.cachedProfile.findUnique({
            where: { username }
        });

        const ONE_DAY = 24 * 60 * 60 * 1000;
        const now = new Date();

        // Se encontrou e é recente, retorna o cache
        if (cached && (now - new Date(cached.updatedAt) < ONE_DAY)) {
            return response.status(200).json({ data: cached });
        }

        // Senão, busca no github
        const [userRes, reposRes] = await Promise.all([
            fetch(`https://api.github.com/users/${username}`),
            fetch(`https://api.github.com/users/${username}/repos?per_page=100`)
        ]);

        if (!userRes.ok) {
            return response.status(404).json({ error: 'GitHub user not found' });
        }

        const userData = await userRes.json();
        const reposData = reposRes.ok ? await reposRes.json() : [];

        const totalStars = reposData.reduce((acc, repo) => acc + repo.stargazers_count, 0);
        
        // Pega apenas alguns repos para não explodir o banco
        const recentRepos = reposData
            .sort((a, b) => new Date(b.updated_at) - new Date(a.updated_at))
            .slice(0, 5)
            .map(r => ({ name: r.name, url: r.html_url, updated_at: r.updated_at }));

        const profileToSave = {
            username: userData.login,
            avatarUrl: userData.avatar_url,
            totalStars,
            totalRepos: userData.public_repos,
            reposData: JSON.stringify(recentRepos)
        };

        const upserted = await prisma.cachedProfile.upsert({
            where: { username: userData.login },
            update: profileToSave,
            create: profileToSave
        });

        return response.status(200).json({ data: upserted });
    } catch (error) {
        console.error(error);
        return response.status(500).json({ error: 'Internal server error' });
    }
}
