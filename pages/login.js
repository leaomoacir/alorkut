import React from 'react'
import IndexPage from '../src/components/IndexPage'
import { useRouter } from 'next/router'

export default function LoginScreen() {
  const router = useRouter()
  const [githubUser, setGithubUser] = React.useState('')
  const [githubToken, setGithubToken] = React.useState('')
  const [error, setError] = React.useState('')
  const [loading, setLoading] = React.useState(false)
  const [challenge, setChallenge] = React.useState(null)
  const [mode, setMode] = React.useState('challenge')

  const startChallenge = (event) => {
    event.preventDefault()
    setError('')
    if (!githubUser.trim()) {
      setError('Digite o usuario do GitHub que voce controla.')
      return
    }
    setLoading(true)
    fetch('/api/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ step: 'start', githubUser: githubUser.trim() }),
    })
      .then(async (res) => {
        const data = await res.json()
        if (!res.ok) throw new Error(data.error || 'Nao foi possivel iniciar o login')
        setChallenge(data.data)
        setLoading(false)
      })
      .catch((err) => {
        setError(err.message)
        setLoading(false)
      })
  }

  const verifyChallenge = () => {
    setError('')
    setLoading(true)
    fetch('/api/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ step: 'verify', githubUser: githubUser.trim(), code: challenge.code }),
    })
      .then(async (res) => {
        const data = await res.json()
        if (!res.ok) throw new Error(data.error || 'Nao foi possivel verificar')
        router.push('/')
      })
      .catch((err) => {
        setError(err.message)
        setLoading(false)
      })
  }

  const loginWithToken = (event) => {
    event.preventDefault()
    setError('')
    setLoading(true)
    fetch('/api/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ step: 'token', githubToken }),
    })
      .then(async (res) => {
        const data = await res.json()
        if (!res.ok) throw new Error(data.error || 'Token invalido')
        router.push('/')
      })
      .catch((err) => {
        setError(err.message)
        setLoading(false)
      })
  }

  return (
    <>
      <IndexPage />
      <main style={{ display: 'flex', flex: 1, alignItems: 'center', justifyContent: 'center', background: 'linear-gradient(135deg, #cfe8fc 0%, #f7d6ea 100%)', minHeight: '100vh' }}>
        <div className="loginScreen" style={{ background: 'rgba(255, 255, 255, 0.92)', borderRadius: '16px', boxShadow: '0 8px 32px rgba(0,0,0,0.12)', padding: '20px' }}>
          <section className="logoArea">
            <img src="https://alurakut.vercel.app/logo.svg" alt="Logo Orkut" />
            <p><strong>Conecte-se aos seus amigos</strong> e acompanhe comunidades, recados e depoimentos.</p>
            <p><strong>Prova de posse:</strong> so entra quem controla o GitHub. Cole o codigo na bio ou em um gist publico.</p>
            <p>Sem isso ninguem edita o seu perfil, manda recado no seu nome ou muda suas configuracoes.</p>
          </section>
          <section className="formArea">
            <div className="box">
              <div style={{ display: 'flex', gap: 8, marginBottom: 16 }}>
                <button type="button" onClick={() => setMode('challenge')} style={{ background: mode === 'challenge' ? '#CE007E' : '#eee', color: mode === 'challenge' ? '#fff' : '#333', border: 0, padding: '8px 12px', borderRadius: 8 }}>Codigo na bio</button>
                <button type="button" onClick={() => setMode('token')} style={{ background: mode === 'token' ? '#CE007E' : '#eee', color: mode === 'token' ? '#fff' : '#333', border: 0, padding: '8px 12px', borderRadius: 8 }}>Token GitHub</button>
              </div>
              {mode === 'challenge' && !challenge && (
                <form onSubmit={startChallenge}>
                  <p style={{ fontSize: '16px', color: '#CE007E', marginBottom: '16px' }}>
                    Informe o usuario do <strong>GitHub que e seu</strong>
                  </p>
                  <input
                    required
                    placeholder="ex: omariosouto"
                    value={githubUser}
                    onChange={(evento) => setGithubUser(evento.target.value)}
                    style={{ width: '100%', padding: '12px', borderRadius: '8px', border: '1px solid #CE007E', marginBottom: '8px' }}
                  />
                  {error && <p style={{ color: '#c0392b', fontSize: '13px', marginBottom: '12px' }}>{error}</p>}
                  <button type="submit" disabled={loading} style={{ width: '100%', background: '#CE007E', color: 'white', padding: '12px', border: 'none', borderRadius: '8px', fontWeight: 'bold' }}>
                    {loading ? 'Gerando codigo...' : 'Gerar codigo de posse'}
                  </button>
                </form>
              )}
              {mode === 'challenge' && challenge && (
                <div>
                  <p style={{ marginBottom: 8 }}>Usuario: <strong>{challenge.username}</strong></p>
                  <p style={{ marginBottom: 8 }}>Cole este codigo na bio do GitHub ou crie um gist publico:</p>
                  <code style={{ display: 'block', background: '#111', color: '#0f0', padding: 12, borderRadius: 8, marginBottom: 12 }}>{challenge.code}</code>
                  <ol style={{ textAlign: 'left', fontSize: 13, marginBottom: 12 }}>
                    {(challenge.instructions || []).map((item) => <li key={item}>{item}</li>)}
                  </ol>
                  {error && <p style={{ color: '#c0392b', fontSize: '13px', marginBottom: '12px' }}>{error}</p>}
                  <button type="button" onClick={verifyChallenge} disabled={loading} style={{ width: '100%', background: '#2E7BB4', color: 'white', padding: '12px', border: 'none', borderRadius: '8px', fontWeight: 'bold' }}>
                    {loading ? 'Verificando...' : 'Ja coloquei. Verificar posse'}
                  </button>
                  <button type="button" onClick={() => { setChallenge(null); setError('') }} style={{ width: '100%', marginTop: 8, background: 'transparent', border: 0, color: '#2E7BB4' }}>
                    Gerar outro codigo
                  </button>
                </div>
              )}
              {mode === 'token' && (
                <form onSubmit={loginWithToken}>
                  <p style={{ fontSize: 14, marginBottom: 12 }}>Cole um Personal Access Token com leitura do perfil. Nao salvamos o token, so usamos uma vez para identificar voce.</p>
                  <input
                    required
                    type="password"
                    placeholder="ghp_..."
                    value={githubToken}
                    onChange={(e) => setGithubToken(e.target.value)}
                    style={{ width: '100%', padding: '12px', borderRadius: '8px', border: '1px solid #CE007E', marginBottom: '8px' }}
                  />
                  {error && <p style={{ color: '#c0392b', fontSize: '13px', marginBottom: '12px' }}>{error}</p>}
                  <button type="submit" disabled={loading} style={{ width: '100%', background: '#CE007E', color: 'white', padding: '12px', border: 'none', borderRadius: '8px', fontWeight: 'bold' }}>
                    {loading ? 'Entrando...' : 'Entrar com token'}
                  </button>
                </form>
              )}
            </div>
            <footer className="box" style={{ marginTop: '16px', textAlign: 'center' }}>
              <p>Nao da mais para entrar digitando o nick de outra pessoa.</p>
              <p style={{ marginTop: 8, fontSize: 12 }}>Token: use um PAT classico com leitura do perfil. Nao armazenamos a chave.</p>
            </footer>
          </section>
          <footer className="footerArea">
            <p>2026 OrkutRevival - Sobre - Centro de seguranca - Privacidade</p>
          </footer>
        </div>
      </main>
    </>
  )
}
