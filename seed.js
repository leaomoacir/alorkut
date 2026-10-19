const { PrismaClient } = require('@prisma/client')

const prisma = new PrismaClient()

async function main() {
  const users = [
    { username: 'omariosouto', displayName: 'Mario Souto', bio: 'Dev. de software e criador de conteudo. Um cafe e um recado, por favor.', location: 'Sao Paulo', mood: 'animado', statusText: 'gravando aula', relationship: 'Namorando', verified: true, theme: 'classic' },
    { username: 'peas', displayName: 'Paulo Silveira', bio: 'Aprendizado continuo. Eu falo sozinho e com a comunidade.', location: 'Sao Paulo', mood: 'feliz', statusText: 'na Alura', relationship: 'Casado(a)', verified: true, theme: 'msn' },
    { username: 'juunegreiros', displayName: 'Juliana Negreiros', bio: 'Front-end, acessibilidade e comunidade.', location: 'Brasil', mood: 'feliz', statusText: 'lendo recados', relationship: 'Solteiro(a)', verified: true, theme: 'classic' },
    { username: 'gaearon', displayName: 'Dan Abramov', bio: 'Working on React. Also I miss Orkut a little.', location: 'Internet', mood: 'ocupado', statusText: 'writing docs', relationship: 'E complicado', verified: true, theme: 'dark' },
    { username: 'torvalds', displayName: 'Linus Torvalds', bio: 'Just for fun. Kernel, git e comunidades barulhentas.', location: 'Portland', mood: 'ocupado', statusText: 'compiling', relationship: 'Casado(a)', verified: true, theme: 'matrix' },
  ]

  for (const data of users) {
    await prisma.user.upsert({
      where: { username: data.username },
      update: data,
      create: data,
    })
    await prisma.cachedProfile.upsert({
      where: { username: data.username },
      update: { avatarUrl: `https://github.com/${data.username}.png`, totalRepos: 20, totalStars: 80, reposData: '[]' },
      create: { username: data.username, avatarUrl: `https://github.com/${data.username}.png`, totalRepos: 20, totalStars: 80, reposData: '[]' },
    })
  }

  const follows = [
    ['omariosouto', 'peas'],
    ['peas', 'omariosouto'],
    ['juunegreiros', 'omariosouto'],
    ['omariosouto', 'juunegreiros'],
    ['gaearon', 'omariosouto'],
    ['omariosouto', 'gaearon'],
    ['peas', 'juunegreiros'],
    ['juunegreiros', 'peas'],
  ]
  for (const [followerId, followingId] of follows) {
    await prisma.follow.upsert({
      where: { followerId_followingId: { followerId, followingId } },
      update: {},
      create: { followerId, followingId },
    })
  }

  const communities = [
    { title: 'Eu odeio acordar cedo', imageUrl: 'https://picsum.photos/seed/acordar/400/400', paginaUrl: '/', creatorId: 'omariosouto', description: 'Para quem aperta soneca 8 vezes e ainda chega atrasado na daily.', category: 'Humor' },
    { title: 'Eu falo sozinho', imageUrl: 'https://picsum.photos/seed/falarssozinho/400/400', paginaUrl: '/', creatorId: 'peas', description: 'Melhor conversa do dia e comigo mesmo.', category: 'Humor' },
    { title: 'Programadores', imageUrl: 'https://picsum.photos/seed/devs/400/400', paginaUrl: '/', creatorId: 'gaearon', description: 'Cafe, bugs e deploy na sexta. Recados de console.log bem-vindos.', category: 'Tecnologia' },
    { title: 'Alura', imageUrl: 'https://picsum.photos/seed/alura/400/400', paginaUrl: 'https://www.alura.com.br', creatorId: 'juunegreiros', description: 'Comunidade da imersao React e de quem nunca desiste do CSS.', category: 'Educacao' },
    { title: 'Eu amo recados', imageUrl: 'https://picsum.photos/seed/recados/400/400', paginaUrl: '/', creatorId: 'omariosouto', description: 'Mural cheio, coracao quente. Deixe um scrap.', category: 'Social' },
    { title: 'Linux e cafe', imageUrl: 'https://picsum.photos/seed/linux/400/400', paginaUrl: '/', creatorId: 'torvalds', description: 'Kernel, distro e aquela compilacao que demora uma vida.', category: 'Tecnologia' },
  ]

  const communityIds = {}
  for (const data of communities) {
    const existing = await prisma.community.findFirst({ where: { title: data.title } })
    const community = existing || await prisma.community.create({ data })
    communityIds[data.title] = community.id
    await prisma.communityMember.upsert({
      where: { userId_communityId: { userId: data.creatorId, communityId: community.id } },
      update: {},
      create: { userId: data.creatorId, communityId: community.id },
    })
  }

  await prisma.communityMember.upsert({
    where: { userId_communityId: { userId: 'omariosouto', communityId: communityIds.Programadores } },
    update: {},
    create: { userId: 'omariosouto', communityId: communityIds.Programadores },
  })
  await prisma.communityMember.upsert({
    where: { userId_communityId: { userId: 'peas', communityId: communityIds.Alura } },
    update: {},
    create: { userId: 'peas', communityId: communityIds.Alura },
  })

  const scraps = [
    { senderId: 'peas', receiverId: 'omariosouto', text: 'E ai Mario! Bora reviver o Orkut com a galera da imersao?' },
    { senderId: 'juunegreiros', receiverId: 'omariosouto', text: 'Deixei um recado classico. Saudade de 2004.' },
    { senderId: 'gaearon', receiverId: 'omariosouto', text: 'Hooks no mural? So se for recado com dependencia.' },
    { senderId: 'omariosouto', receiverId: 'peas', text: 'Paulo, entra na comunidade Eu odeio acordar cedo.' },
    { senderId: 'torvalds', receiverId: 'gaearon', text: 'Nice kernel talk. Also, your merge conflicts are showing.' },
  ]
  for (const data of scraps) {
    const exists = await prisma.scrap.findFirst({ where: data })
    if (!exists) await prisma.scrap.create({ data })
  }

  const testimonials = [
    { senderId: 'peas', receiverId: 'omariosouto', text: 'Mario explica dificil como se fosse facil. 10/10 recado.', isPublic: true },
    { senderId: 'omariosouto', receiverId: 'juunegreiros', text: 'Ju, a comunidade ficou mais colorida com voce.', isPublic: true },
    { senderId: 'gaearon', receiverId: 'omariosouto', text: 'Aguardando aprovacao deste depoimento nostálgico.', isPublic: false },
  ]
  for (const data of testimonials) {
    const exists = await prisma.testimonial.findFirst({ where: { senderId: data.senderId, receiverId: data.receiverId, text: data.text } })
    if (!exists) await prisma.testimonial.create({ data })
  }

  const gifts = [
    { senderId: 'peas', receiverId: 'omariosouto', giftType: 'cafe', message: 'Um cafe pela daily' },
    { senderId: 'juunegreiros', receiverId: 'omariosouto', giftType: 'coracao', message: 'Saudade do Orkut' },
    { senderId: 'omariosouto', receiverId: 'gaearon', giftType: 'trofeu', message: 'Pelo React' },
  ]
  for (const data of gifts) {
    const exists = await prisma.gift.findFirst({ where: data })
    if (!exists) await prisma.gift.create({ data })
  }

  const eventsCount = await prisma.socialEvent.count()
  if (eventsCount === 0) {
    const event = await prisma.socialEvent.create({
      data: {
        creatorId: 'omariosouto',
        title: 'Encontro da comunidade Alurakut',
        description: 'Bate-papo sobre recados, comunidades e o feed de 2004.',
        place: 'Internet / Discord da galera',
        happensAt: 'Sabado 20h',
      },
    })
    await prisma.eventRsvp.create({ data: { eventId: event.id, userId: 'omariosouto', status: 'yes' } })
    await prisma.eventRsvp.create({ data: { eventId: event.id, userId: 'peas', status: 'yes' } })
  }

  const album = await prisma.album.findFirst({ where: { ownerId: 'omariosouto', title: 'Setup 2004' } })
    || await prisma.album.create({ data: { ownerId: 'omariosouto', title: 'Setup 2004' } })
  const photoExists = await prisma.photo.findFirst({ where: { albumId: album.id } })
  if (!photoExists) {
    await prisma.photo.create({ data: { albumId: album.id, imageUrl: 'https://picsum.photos/seed/setup/600/400', caption: 'CRT, MSN e Orkut aberto' } })
    await prisma.photo.create({ data: { albumId: album.id, imageUrl: 'https://picsum.photos/seed/teclado/600/400', caption: 'Teclado barulhento' } })
  }

  const videoExists = await prisma.video.findFirst({ where: { ownerId: 'omariosouto' } })
  if (!videoExists) {
    await prisma.video.create({
      data: {
        ownerId: 'omariosouto',
        title: 'Por que o Orkut voltou',
        url: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
      },
    })
  }

  const quizExists = await prisma.quiz.findFirst({ where: { ownerId: 'omariosouto' } })
  if (!quizExists) {
    await prisma.quiz.create({
      data: {
        ownerId: 'omariosouto',
        title: 'Quem me conhece melhor?',
        questions: JSON.stringify([
          { q: 'Qual e o meu editor favorito?', answer: 'vscode' },
          { q: 'Gosto mais de frontend ou backend?', answer: 'frontend' },
          { q: 'Qual rede social nostálgica eu revivi?', answer: 'orkut' },
        ]),
      },
    })
  }

  const topicExists = await prisma.communityTopic.findFirst({ where: { communityId: communityIds['Eu odeio acordar cedo'] } })
  if (!topicExists) {
    const topic = await prisma.communityTopic.create({
      data: { title: 'Quantas vezes voce aperta soneca?', authorId: 'omariosouto', communityId: communityIds['Eu odeio acordar cedo'] },
    })
    await prisma.communityPost.create({
      data: { text: 'Oito. Sem negociacao.', authorId: 'peas', topicId: topic.id },
    })
  }

  const activityExists = await prisma.activity.findFirst({ where: { actorId: 'omariosouto', type: 'community_create' } })
  if (!activityExists) {
    await prisma.activity.create({
      data: { actorId: 'peas', type: 'scrap', targetId: 'omariosouto', targetName: 'omariosouto' },
    })
    await prisma.activity.create({
      data: { actorId: 'omariosouto', type: 'community_create', targetId: communityIds['Eu odeio acordar cedo'], targetName: 'Eu odeio acordar cedo' },
    })
  }

  console.log('Banco atualizado com dados do Orkut Revival.')
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
