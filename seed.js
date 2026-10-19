const { PrismaClient } = require('@prisma/client')

const prisma = new PrismaClient()

async function main() {
  const users = ['omariosouto', 'peas', 'juunegreiros', 'torvalds', 'gaearon']
  for (const username of users) {
    await prisma.user.upsert({
      where: { username },
      update: {},
      create: {
        username,
        displayName: username,
        bio: `Perfil de ${username} no Orkut Revival`,
        location: 'Internet',
        verified: false,
        mood: 'feliz',
      },
    })
  }

  const follows = [
    { followerId: 'omariosouto', followingId: 'peas' },
    { followerId: 'peas', followingId: 'omariosouto' },
    { followerId: 'juunegreiros', followingId: 'omariosouto' },
    { followerId: 'gaearon', followingId: 'omariosouto' },
  ]
  for (const follow of follows) {
    const exists = await prisma.follow.findFirst({ where: follow })
    if (!exists) await prisma.follow.create({ data: follow })
  }

  const communities = [
    { title: 'Eu odeio acordar cedo', imageUrl: 'https://picsum.photos/seed/acordar/400/400', paginaUrl: '/', creatorId: 'omariosouto', description: 'Para quem aperta soneca 8 vezes.', category: 'Humor' },
    { title: 'Eu falo sozinho', imageUrl: 'https://picsum.photos/seed/falarssozinho/400/400', paginaUrl: '/', creatorId: 'peas', description: 'Melhor conversa do dia.', category: 'Humor' },
    { title: 'Programadores', imageUrl: 'https://picsum.photos/seed/devs/400/400', paginaUrl: '/', creatorId: 'gaearon', description: 'Cafe, bugs e deploy na sexta.', category: 'Tecnologia' },
    { title: 'Alura', imageUrl: 'https://picsum.photos/seed/alura/400/400', paginaUrl: 'https://www.alura.com.br', creatorId: 'juunegreiros', description: 'Comunidade da imersao React.', category: 'Educacao' },
  ]

  for (const data of communities) {
    const existing = await prisma.community.findFirst({ where: { title: data.title } })
    const community = existing || await prisma.community.create({ data })
    await prisma.communityMember.upsert({
      where: { userId_communityId: { userId: data.creatorId, communityId: community.id } },
      update: {},
      create: { userId: data.creatorId, communityId: community.id },
    })
  }

  console.log('Banco atualizado.')
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
