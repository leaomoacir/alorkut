import prisma from '../../src/lib/prisma'

export default async function searchHandler(request, response) {
  if (request.method !== 'GET') {
    return response.status(405).json({ error: 'Method not allowed' })
  }

  const q = String(request.query.q || '').trim()
  if (!q) {
    return response.status(200).json({ data: { users: [], communities: [], topics: [] } })
  }
  const qLower = q.toLowerCase()

  const [users, communities, topics, follows] = await Promise.all([
    prisma.user.findMany({
      where: {
        OR: [
          { username: { contains: q } },
          { displayName: { contains: q } },
        ],
      },
      take: 12,
    }),
    prisma.community.findMany({
      where: {
        OR: [
          { title: { contains: q } },
          { category: { contains: q } },
          { description: { contains: q } },
        ],
      },
      take: 12,
    }),
    prisma.communityTopic.findMany({
      where: { title: { contains: q } },
      take: 12,
    }),
    prisma.follow.findMany({
      where: {
        OR: [
          { followerId: { contains: q } },
          { followingId: { contains: q } },
        ],
      },
      take: 20,
    }),
  ])

  const extraUsers = new Set()
  follows.forEach((f) => {
    extraUsers.add(f.followerId)
    extraUsers.add(f.followingId)
  })
  extraUsers.forEach((name) => {
    if (name.toLowerCase().includes(qLower) && !users.some((u) => u.username === name)) {
      users.push({ username: name, displayName: name })
    }
  })

  const allUsers = await prisma.user.findMany({ take: 80 })
  allUsers.forEach((u) => {
    const blob = `${u.username} ${u.displayName || ''} ${u.bio || ''} ${u.location || ''}`.toLowerCase()
    if (blob.includes(qLower) && !users.some((item) => item.username === u.username)) {
      users.push(u)
    }
  })
  const allCommunities = await prisma.community.findMany({ take: 80 })
  allCommunities.forEach((c) => {
    const blob = `${c.title} ${c.category || ''} ${c.description || ''}`.toLowerCase()
    if (blob.includes(qLower) && !communities.some((item) => item.id === c.id)) {
      communities.push(c)
    }
  })

  return response.status(200).json({ data: { users, communities, topics } })
}
