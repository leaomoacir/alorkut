import React from 'react'
import { withAuth } from '../src/lib/auth'
import Layout from '../src/components/Layout'
import Box from '../src/components/Box'

export default function AtualizacoesPage(props) {
  const [feed, setFeed] = React.useState([])
  React.useEffect(() => {
    fetch(`/api/feed?userId=${props.githubUser}`).then((r) => r.json()).then((res) => setFeed(res.data || []))
  }, [props.githubUser])
  return (
    <Layout githubUser={props.githubUser}>
      <Box>
        <h1 className="title">Atualizacoes</h1>
        <p>O que seus amigos andam fazendo: recados, comunidades, fotos e humor.</p>
        {feed.length === 0 && <p>Nenhuma atualizacao ainda.</p>}
        {feed.map((item) => (
          <div key={item.id} style={{ display: 'flex', gap: 12, padding: '12px 0', borderBottom: '1px solid #eee' }}>
            <img src={`https://github.com/${item.actorId}.png`} alt={item.actorId} style={{ width: 40, height: 40, borderRadius: 8 }} />
            <div>
              <a href={item.link}><strong>{item.title}</strong></a>
              {item.text && <p>{item.text}</p>}
              <small>{new Date(item.createdAt).toLocaleString()}</small>
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
