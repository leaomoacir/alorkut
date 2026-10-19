import jwt from 'jsonwebtoken'
import nookies from 'nookies'
import prisma from './prisma'
import { touchLastSeen } from './privacy'

const SECRET = process.env.JWT_SECRET || 'orkut-revival-dev-secret'
const COOKIE = 'USER_TOKEN'

export function signToken(githubUser) {
  return jwt.sign({ githubUser, verified: true }, SECRET, { expiresIn: '7d' })
}

export function readToken(token) {
  if (!token) return null
  try {
    const decoded = jwt.verify(token, SECRET)
    if (!decoded || !decoded.githubUser || !decoded.verified) return null
    return decoded
  } catch (err) {
    return null
  }
}

export function getUserFromContext(context) {
  const cookies = nookies.get(context)
  return readToken(cookies[COOKIE])
}

export function getUserFromRequest(req) {
  const cookies = nookies.get({ req })
  return readToken(cookies[COOKIE])
}

export function setAuthCookie(res, token) {
  nookies.set({ res }, COOKIE, token, {
    path: '/',
    maxAge: 86400 * 7,
    httpOnly: true,
    sameSite: 'lax',
  })
}

export function clearAuthCookie(res) {
  nookies.destroy({ res }, COOKIE, { path: '/' })
}

export async function requireApiUser(req, res) {
  const user = getUserFromRequest(req)
  if (!user || !user.githubUser) {
    res.status(401).json({ error: 'Faca login com seu GitHub para continuar' })
    return null
  }
  return user.githubUser
}

export async function withAuth(context) {
  const user = getUserFromContext(context)
  if (!user || !user.githubUser) {
    return {
      redirect: {
        destination: '/login',
        permanent: false,
      },
    }
  }
  const dbUser = await prisma.user.findUnique({ where: { username: user.githubUser } }).catch(() => null)
  await touchLastSeen(user.githubUser)
  return {
    props: {
      githubUser: user.githubUser,
      userTheme: dbUser?.theme || 'classic',
      mood: dbUser?.mood || 'feliz',
      statusText: dbUser?.statusText || '',
      verified: Boolean(dbUser?.verified),
    },
  }
}

export function randomCode() {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'
  let out = ''
  for (let i = 0; i < 8; i += 1) {
    out += chars[Math.floor(Math.random() * chars.length)]
  }
  return `ORKUT-${out}`
}
