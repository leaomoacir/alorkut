import prisma from '../../src/lib/prisma'
import { requireApiUser } from '../../src/lib/auth'
import { logActivity } from '../../src/lib/social'

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
      whoAmI,
      lookingFor,
      interests,
      movies,
      music,
      books,
      kids,
      smoking,
      drinking,
      privacy,
    } = request.body
    const previous = await prisma.user.findUnique({ where: { username: me } })
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
        whoAmI: whoAmI || '',
        lookingFor: lookingFor || '',
        interests: interests || '',
        movies: movies || '',
        music: music || '',
        books: books || '',
        kids: kids || '',
        smoking: smoking || '',
        drinking: drinking || '',
        privacy: privacy || 'public',
      },
    })
    if (previous && (previous.mood !== user.mood || previous.statusText !== user.statusText)) {
      await logActivity({
        actorId: me,
        type: 'status',
        targetId: me,
        targetName: user.mood,
        extra: user.statusText || user.mood,
      })
    }
    return response.status(200).json({ data: user })
  }

  return response.status(405).json({ error: 'Method not allowed' })
}
