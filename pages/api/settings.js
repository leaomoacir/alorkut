import prisma from '../../src/lib/prisma'
import { requireApiUser } from '../../src/lib/auth'

export default async function settingsHandler(request, response) {
  const me = await requireApiUser(request, response)
  if (!me) return

  if (request.method === 'GET') {
    const user = await prisma.user.findUnique({ where: { username: me } })
    return response.status(200).json({ data: user })
  }

  if (request.method === 'POST') {
    const {
      displayName,
      bio,
      location,
      relationship,
      birthday,
      theme,
      profileColor,
      mood,
      statusText,
    } = request.body
    const user = await prisma.user.update({
      where: { username: me },
      data: {
        displayName: displayName || me,
        bio: bio || '',
        location: location || '',
        relationship: relationship || 'Solteiro(a)',
        birthday: birthday || '',
        theme: theme || 'classic',
        profileColor: profileColor || '#D9E6F6',
        mood: mood || 'feliz',
        statusText: statusText || '',
      },
    })
    return response.status(200).json({ data: user })
  }

  return response.status(405).json({ error: 'Method not allowed' })
}
