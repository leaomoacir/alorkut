import prisma from '../../src/lib/prisma'
import { randomCode, setAuthCookie, signToken } from '../../src/lib/auth'
import { fetchGithubWithToken, upsertGithubProfile, userOwnsChallenge } from '../../src/lib/github'

export default async function loginHandler(request, response) {
  if (request.method !== 'POST') {
    return response.status(405).json({ error: 'Method not allowed' })
  }

  const { step, githubUser, code, githubToken } = request.body || {}
  const username = String(githubUser || '').trim().replace(/^@/, '')

  if (step === 'start') {
    if (!username || !/^[a-zA-Z0-9-]{1,39}$/.test(username)) {
      return response.status(400).json({ error: 'Informe um usuario GitHub valido' })
    }
    const exists = await fetch(`https://api.github.com/users/${username}`, {
      headers: { 'User-Agent': 'orkut-revival' },
    })
    if (!exists.ok) {
      return response.status(404).json({ error: 'Usuario do GitHub nao encontrado' })
    }
    await prisma.loginChallenge.deleteMany({
      where: { username, expiresAt: { lt: new Date() } },
    })
    const challengeCode = randomCode()
    const challenge = await prisma.loginChallenge.create({
      data: {
        username,
        code: challengeCode,
        expiresAt: new Date(Date.now() + 15 * 60 * 1000),
      },
    })
    return response.status(200).json({
      data: {
        username,
        code: challenge.code,
        expiresAt: challenge.expiresAt,
        gistName: `${challenge.code}.txt`,
        instructions: [
          `Copie o codigo ${challenge.code}`,
          'Cole na bio publica do GitHub (Settings > Profile > Bio) OU',
          `crie um gist publico com descricao ou nome de arquivo contendo ${challenge.code}`,
          'Volte aqui e clique em Verificar posse',
        ],
      },
    })
  }

  if (step === 'verify') {
    if (!username) return response.status(400).json({ error: 'Informe o usuario' })
    const challenge = await prisma.loginChallenge.findFirst({
      where: { username },
      orderBy: { createdAt: 'desc' },
    })
    if (!challenge || new Date(challenge.expiresAt) < new Date()) {
      return response.status(400).json({ error: 'Desafio expirado. Gere um codigo novo.' })
    }
    const expected = String(code || challenge.code)
    const result = await userOwnsChallenge(username, expected)
    if (!result.ok) {
      return response.status(403).json({ error: result.reason })
    }
    await upsertGithubProfile(prisma, result.user)
    await prisma.loginChallenge.deleteMany({ where: { username } })
    const token = signToken(result.user.login)
    setAuthCookie(response, token)
    return response.status(200).json({ token, githubUser: result.user.login, verified: true })
  }

  if (step === 'token') {
    const tokenValue = String(githubToken || '').trim()
    if (!tokenValue) return response.status(400).json({ error: 'Informe um token do GitHub' })
    const github = await fetchGithubWithToken(tokenValue)
    if (!github || !github.login) {
      return response.status(401).json({ error: 'Token invalido. Use um Personal Access Token com permissao de leitura do perfil.' })
    }
    await upsertGithubProfile(prisma, github)
    const token = signToken(github.login)
    setAuthCookie(response, token)
    return response.status(200).json({ token, githubUser: github.login, verified: true })
  }

  return response.status(400).json({ error: 'Passo de login invalido' })
}
