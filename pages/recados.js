import React from 'react'
import { withAuth } from '../src/lib/auth'
import Layout from '../src/components/Layout'
import Box from '../src/components/Box'

export default function RecadosPage(props) {
  const [scraps, setScraps] = React.useState([])
  const [replyTo, setReplyTo] = React.useState(null)
  const [text, setText] = React.useState('')
  const load = () => fetch(`/api/scraps?receiverId=${props.githubUser}`).then((r) => r.json()).then((res) => setScraps(res.data || []))
  React.useEffect(() => { load() }, [props.githubUser])
  return (
    <Layout githubUser={props.githubUser}>
      <Box>
        <h1 className="title">Meus recados</h1>
        <p>Tudo que a galera deixou no seu mural. Responda no perfil de quem escreveu.</p>
        {scraps.length === 0 && <p>Nenhum recado no mural ainda. Peca para um amigo passar no seu perfil.</p>}
        {scraps.filter((s) => !s.parentId).map((scrap) => (
          <div key={scrap.id} style={{ display: 'flex', gap: 12, padding: '12px 0', borderBottom: '1px solid #eee' }}>
            <img src={`https://github.com/${scrap.senderId}.png`} alt={scrap.senderId} style={{ width: 48, height: 48, borderRadius: 8 }} />
            <div style={{ flex: 1 }}>
              <a href={`/profile/${scrap.senderId}`}>{scrap.senderId}</a>
              <p>{scrap.text}</p>
              <small>{new Date(scrap.createdAt).toLocaleString()}</small>
              <button type="button" onClick={() => setReplyTo(scrap.id)} style={{ display: 'block', background: 'transparent', color: '#2E7BB4', border: 0, padding: 0, marginTop: 4 }}>Responder</button>
              {scraps.filter((r) => r.parentId === scrap.id).map((reply) => (
                <p key={reply.id} style={{ marginTop: 8, paddingLeft: 8, borderLeft: '2px solid #CE007E' }}><a href={`/profile/${reply.senderId}`}>{reply.senderId}</a>: {reply.text}</p>
              ))}
              {replyTo === scrap.id && (
                <form onSubmit={(e) => {
                  e.preventDefault()
                  fetch('/api/scraps', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ receiverId: scrap.senderId, text, parentId: scrap.id }),
                  }).then(() => { setText(''); setReplyTo(null); load() })
                }} style={{ marginTop: 8 }}>
                  <input value={text} onChange={(e) => setText(e.target.value)} placeholder="Sua resposta" required />
                  <button type="submit">Enviar</button>
                </form>
              )}
            </div>
          </div>
        ))}
      </Box>
    </Layout>
  )
}

export async function getServerSideProps(context) {
  return withAuth(context)
}
