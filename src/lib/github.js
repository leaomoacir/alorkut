const UA = { 'User-Agent': 'orkut-revival', Accept: 'application/vnd.github+json' }

export async function fetchGithubUser(username) {
  const res = await fetch(`https://api.github.com/users/${username}`, { headers: UA })
  if (!res.ok) return null
  return res.json()
}

export async function fetchGithubWithToken(token) {
  const res = await fetch('https://api.github.com/user', {
    headers: { ...UA, Authorization: `Bearer ${token}` },
  })
  if (!res.ok) return null
  return res.json()
}

export async function userOwnsChallenge(username, code) {
  const user = await fetchGithubUser(username)
  if (!user) return { ok: false, reason: 'Usuario do GitHub nao encontrado' }
  const bio = String(user.bio || '')
  if (bio.toUpperCase().includes(code.toUpperCase())) {
    return { ok: true, user }
  }
  const gistsRes = await fetch(`https://api.github.com/users/${username}/gists?per_page=10`, { headers: UA })
  if (gistsRes.ok) {
    const gists = await gistsRes.json()
    const match = (Array.isArray(gists) ? gists : []).find((g) => {
      const desc = String(g.description || '')
      const names = Object.keys(g.files || {}).join(' ')
      return desc.toUpperCase().includes(code.toUpperCase()) || names.toUpperCase().includes(code.toUpperCase())
    })
    if (match) return { ok: true, user }
  }
  return {
    ok: false,
    reason: 'Nao encontrei o codigo na bio nem em um gist publico. Coloque o codigo e tente de novo.',
  }
}

export async function upsertGithubProfile(prisma, github) {
  await prisma.user.upsert({
    where: { username: github.login },
    update: {
      displayName: github.name || github.login,
      verified: true,
      location: github.location || undefined,
      bio: github.bio || undefined,
    },
    create: {
      username: github.login,
      displayName: github.name || github.login,
      bio: github.bio || 'Ola, sou um desenvolvedor entusiasta!',
      location: github.location || '',
      verified: true,
    },
  })
  await prisma.cachedProfile.upsert({
    where: { username: github.login },
    update: {
      avatarUrl: github.avatar_url,
      totalRepos: github.public_repos || 0,
    },
    create: {
      username: github.login,
      avatarUrl: github.avatar_url,
      totalStars: 0,
      totalRepos: github.public_repos || 0,
      reposData: '[]',
    },
  })
}
