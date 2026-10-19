import prisma from '../../src/lib/prisma'
import { getDevBadges, getLevel } from '../../src/lib/levels'
import { ensureUser } from '../../src/lib/social'

export default async function profileHandler(request, response) {
  if (request.method !== 'GET') {
    return response.status(405).json({ error: 'Method not allowed' })
  }

  const { username } = request.query
  if (!username) {
    return response.status(400).json({ error: 'Missing username' })
  }

  try {
    await ensureUser(username)
    const cached = await prisma.cachedProfile.findUnique({
      where: { username },
    })
    const ONE_DAY = 24 * 60 * 60 * 1000
    const now = new Date()
    let profile = cached
    if (!cached || (now - new Date(cached.updatedAt) >= ONE_DAY)) {
      const [userRes, reposRes] = await Promise.all([
        fetch(`https://api.github.com/users/${username}`, { headers: { 'User-Agent': 'orkut-revival' } }),
        fetch(`https://api.github.com/users/${username}/repos?per_page=100`, { headers: { 'User-Agent': 'orkut-revival' } }),
      ])
      if (userRes.ok) {
        const userData = await userRes.json()
        const reposData = reposRes.ok ? await reposRes.json() : []
        const totalStars = Array.isArray(reposData)
          ? reposData.reduce((acc, repo) => acc + (repo.stargazers_count || 0), 0)
          : 0
        const recentRepos = Array.isArray(reposData)
          ? reposData
            .sort((a, b) => new Date(b.updated_at) - new Date(a.updated_at))
            .slice(0, 5)
            .map((r) => ({ name: r.name, url: r.html_url, updated_at: r.updated_at }))
          : []
        const profileToSave = {
          username: userData.login,
          avatarUrl: userData.avatar_url,
          totalStars,
          totalRepos: userData.public_repos,
          reposData: JSON.stringify(recentRepos),
        }
        profile = await prisma.cachedProfile.upsert({
          where: { username: userData.login },
          update: profileToSave,
          create: profileToSave,
        })
        await prisma.user.update({
          where: { username: userData.login },
          data: {
            displayName: userData.name || userData.login,
            bio: userData.bio || undefined,
            location: userData.location || undefined,
          },
        })
      }
    }

    const [user, scraps, friends, memberships, posts, votes] = await Promise.all([
      prisma.user.findUnique({ where: { username } }),
      prisma.scrap.count({ where: { receiverId: username } }),
      prisma.follow.count({ where: { followerId: username } }),
      prisma.communityMember.count({ where: { userId: username } }),
      prisma.communityPost.count({ where: { authorId: username } }),
      prisma.badgeVote.findMany({ where: { receiverId: username } }),
    ])
    const counts = { trusty: 0, cool: 0, sexy: 0 }
    votes.forEach((v) => {
      if (counts[v.badgeType] !== undefined) counts[v.badgeType]++
    })
    const level = getLevel({
      scraps,
      friends,
      communities: memberships,
      posts,
      stars: profile ? profile.totalStars : 0,
    })
    return response.status(200).json({
      data: profile,
      user,
      stats: { scraps, friends, communities: memberships, posts, badges: counts },
      level,
      badges: getDevBadges(profile),
    })
  } catch (error) {
    console.error(error)
    return response.status(500).json({ error: 'Internal server error' })
  }
}
