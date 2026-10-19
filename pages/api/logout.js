import { clearAuthCookie } from '../../src/lib/auth'

export default function logoutHandler(request, response) {
  clearAuthCookie(response)
  return response.status(200).json({ success: true })
}
