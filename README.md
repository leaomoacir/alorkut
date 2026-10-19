# Orkut Revival

Rede social nostálgica inspirada no Orkut de 2004, feita com Next.js, Prisma e SQLite.

## O que tem

- Login por prova de posse do GitHub (codigo na bio/gist ou Personal Access Token)
- Recados, depoimentos com aprovacao, pedidos de amizade, mensagens
- Comunidades com foruns, categorias, fotos, videos, presentes e eventos
- Temas classico, MSN, dark e matrix
- Feed, busca, niveis e selos Confiavel / Legal / Sexy

## Instalacao

```bash
# Instalar dependencias
npm install

# Criar o banco
npx prisma db push

# Popular dados de exemplo
npm run seed

# Rodar o app (Node 17+ precisa do OpenSSL legado)
npm run dev
```

Abra http://localhost:3000 e entre em `/login`.

## Login

1. Informe o usuario GitHub que e seu
2. Cole o codigo `ORKUT-XXXX` na bio publica ou em um gist
3. Clique em Verificar posse

Nao da para entrar digitando o nick de outra pessoa.

## Stack

Next.js 11, React 17, Styled Components, Prisma, SQLite, JWT httpOnly.
