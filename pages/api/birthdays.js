import prisma from '../../src/lib/prisma'
import { requireApiUser } from '../../src/lib/auth'

function todayKey() {
  const now = new Date()
  const dd = String(now.getDate()).padStart(2, '0')
  const mm = String(now.getMonth() + 1).padStart(2, '0')
  return `${dd}/${mm}`
}

export default async function birthdaysHandler(request, response) {
  const me = await requireApiUser(request, response)
  if (!me) return
  if (request.method !== 'GET') return response.status(405).json({ error: 'Method not allowed' })

  const friends = await prisma.follow.findMany({ where: { followerId: me } })
  const ids = friends.map((f) => f.followingId)
  ids.push(me)
  const users = await prisma.user.findMany({
    where: { username: { in: ids } },
  })
  const key = todayKey()
  const today = users.filter((u) => (u.birthday || '').startsWith(key))
  const upcoming = users
    .filter((u) => u.birthday)
    .sort((a, b) => String(a.birthday).localeCompare(String(b.birthday)))
    .slice(0, 8)
  return response.status(200).json({ data: { today, upcoming } })
}
