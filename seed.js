const { PrismaClient } = require('@prisma/client')

const prisma = new PrismaClient({})

async function main() {
  console.log('🌱 Semeando o banco de dados de teste...')
  
  const novaComunidade = await prisma.community.create({
    data: {
      title: 'Comunidade Teste Prisma',
      imageUrl: 'https://placehold.co/300x300/2E7BB4/FFFFFF/png?text=Prisma',
      paginaUrl: 'https://github.com/prisma'
    }
  })
  
  console.log('✅ Comunidade criada:', novaComunidade)

  const novoPost = await prisma.post.create({
    data: {
      name: 'github',
      text: 'Testando nosso novo banco de dados SQLite com Prisma! Funcionando 100%!'
    }
  })
  
  console.log('✅ Post criado:', novoPost)
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
