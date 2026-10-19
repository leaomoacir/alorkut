import prisma from './prisma'

export async function isBlocked(a, b) {
  if (!a || !b || a === b) return false
  const found = await prisma.block.findFirst({
    where: {
      OR: [
        { blockerId: a, blockedId: b },
        { blockerId: b, blockedId: a },
      ],
    },
  })
  return Boolean(found)
}

export async function canSeeProfile(viewer, owner) {
  if (!owner) return false
  if (!viewer || viewer === owner) return true
  if (await isBlocked(viewer, owner)) return false
  const user = await prisma.user.findUnique({ where: { username: owner } })
  if (!user || user.privacy === 'public' || !user.privacy) return true
  if (user.privacy === 'friends') {
    const friend = await prisma.follow.findFirst({
      where: { followerId: viewer, followingId: owner },
    })
    return Boolean(friend)
  }
  return false
}

export async function touchLastSeen(username) {
  if (!username) return
  await prisma.user.update({
    where: { username },
    data: { lastSeen: new Date() },
  }).catch(() => {})
}
