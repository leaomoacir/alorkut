import React from 'react'
import { useRouter } from 'next/router'
import { withAuth } from '../src/lib/auth'
import Layout from '../src/components/Layout'
import Box from '../src/components/Box'

export default function MensagensPage(props) {
  const router = useRouter()
  const withUser = router.query.with || ''
  const [threads, setThreads] = React.useState([])
  const [messages, setMessages] = React.useState([])
  const [text, setText] = React.useState('')
  const [target, setTarget] = React.useState(withUser)

  const loadThreads = () => fetch('/api/messages').then((r) => r.json()).then((res) => setThreads(res.data || []))
  const loadThread = (user) => {
    if (!user) return
    fetch(`/api/messages?withUser=${user}`).then((r) => r.json()).then((res) => setMessages(res.data || []))
  }

  React.useEffect(() => { loadThreads() }, [])
  React.useEffect(() => {
    if (withUser) {
      setTarget(withUser)
      loadThread(withUser)
    }
  }, [withUser])

  return (
    <Layout githubUser={props.githubUser}>
      <Box>
        <h1 className="title">Mensagens</h1>
        <form onSubmit={(e) => {
          e.preventDefault()
          if (!target) return
          router.push(`/mensagens?with=${target}`)
        }}>
          <input value={target} onChange={(e) => setTarget(e.target.value)} placeholder="Usuario para conversar" />
          <button type="submit">Abrir conversa</button>
        </form>
      </Box>
      <Box>
        <h2 className="subTitle">Conversas</h2>
        {threads.map((t) => (
          <p key={t.user}><a href={`/mensagens?with=${t.user}`}>{t.user}</a>: {t.last.text}</p>
        ))}
        {threads.length === 0 && <p>Nenhuma conversa ainda.</p>}
      </Box>
      {withUser && (
        <Box>
          <h2 className="subTitle">Chat com {withUser}</h2>
          <ul style={{ listStyle: 'none', marginBottom: 16 }}>
            {messages.map((m) => (
              <li key={m.id} style={{ marginBottom: 8, textAlign: m.fromId === props.githubUser ? 'right' : 'left' }}>
                <span style={{ display: 'inline-block', background: m.fromId === props.githubUser ? '#D9E6F6' : '#f4f4f4', padding: '8px 12px', borderRadius: 12 }}>{m.text}</span>
              </li>
            ))}
          </ul>
          <form onSubmit={(e) => {
            e.preventDefault()
            fetch('/api/messages', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ toId: withUser, text }),
            }).then(() => { setText(''); loadThread(withUser); loadThreads() })
          }}>
            <input value={text} onChange={(e) => setText(e.target.value)} placeholder="Escreva..." required />
            <button type="submit">Enviar</button>
          </form>
        </Box>
      )}
    </Layout>
  )
}

export async function getServerSideProps(context) {
  return withAuth(context)
}
