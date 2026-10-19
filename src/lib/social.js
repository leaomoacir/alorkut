import prisma from './prisma'

export async function logActivity({ actorId, type, targetId, targetName, extra }) {
  return prisma.activity.create({
    data: {
      actorId,
      type,
      targetId: targetId || null,
      targetName: targetName || null,
      extra: extra || null,
    },
  })
}

export async function notify({ userId, actorId, type, message, link }) {
  if (!userId || userId === actorId) return null
  return prisma.notification.create({
    data: {
      userId,
      actorId,
      type,
      message,
      link: link || '/',
    },
  })
}

export async function ensureUser(username) {
  if (!username) return null
  return prisma.user.upsert({
    where: { username },
    update: {},
    create: { username, displayName: username },
  })
}

export function formatActivity(item) {
  const actor = item.actorId
  const target = item.targetName || item.targetId || ''
  const extra = item.extra || ''
  switch (item.type) {
    case 'scrap':
      return `${actor} escreveu no mural de ${target}`
    case 'follow':
      return `${actor} adicionou ${target} aos amigos`
    case 'community_join':
      return `${actor} entrou na comunidade ${target}`
    case 'community_create':
      return `${actor} criou a comunidade ${target}`
    case 'topic':
      return `${actor} criou o tópico "${target}"`
    case 'post':
      return `${actor} respondeu no tópico "${target}"`
    case 'testimonial':
      return `${actor} deixou um depoimento para ${target}`
    case 'badge':
      return `${actor} votou em ${target} como ${extra}`
    case 'photo':
      return `${actor} adicionou fotos no álbum ${target}`
    case 'quiz':
      return `${actor} criou a enquete "${target}"`
    case 'quiz_answer':
      return `${actor} respondeu a enquete de ${target}`
    case 'video':
      return `${actor} publicou o video ${target}`
    case 'gift':
      return `${actor} enviou um presente para ${target}`
    case 'event':
      return `${actor} criou o evento ${target}`
    case 'friend_request':
      return `${actor} pediu amizade para ${target}`
    case 'status':
      return `${actor} atualizou o humor: ${extra || target}`
    default:
      return `${actor} fez uma atualizacao`
  }
}

export function activityLink(item) {
  switch (item.type) {
    case 'scrap':
    case 'follow':
    case 'testimonial':
    case 'badge':
      return `/profile/${item.targetId || item.actorId}`
    case 'community_join':
    case 'community_create':
      return `/comunidades/${item.targetId}`
    case 'topic':
    case 'post':
      return `/comunidades/${item.extra || item.targetId}`
    case 'photo':
      return `/fotos?user=${item.actorId}`
    case 'quiz':
    case 'quiz_answer':
      return `/enquetes`
    case 'video':
      return `/videos`
    case 'gift':
      return `/presentes`
    case 'event':
      return `/eventos`
    default:
      return '/'
  }
}
