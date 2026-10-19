import React from 'react'
import { withAuth } from '../src/lib/auth'
import Layout from '../src/components/Layout'
import Box from '../src/components/Box'

export default function VisitasPage(props) {
  const [visits, setVisits] = React.useState([])
  React.useEffect(() => {
    fetch('/api/visits').then((r) => r.json()).then((res) => setVisits(res.data || []))
  }, [])
  return (
    <Layout githubUser={props.githubUser}>
      <Box>
        <h1 className="title">Quem visitou seu perfil</h1>
        <p>Visitantes recentes. Visitas repetidas em menos de 30 minutos nao entopem a lista.</p>
        {visits.length === 0 && <p>Ninguem passou por aqui ainda.</p>}
        <ul style={{ listStyle: 'none' }}>
          {visits.map((v) => (
            <li key={v.id} style={{ display: 'flex', gap: 12, alignItems: 'center', padding: '8px 0', borderBottom: '1px solid #eee' }}>
              <img src={`https://github.com/${v.visitorId}.png`} alt={v.visitorId} style={{ width: 40, height: 40, borderRadius: 8 }} />
              <a href={`/profile/${v.visitorId}`}>{v.visitorId}</a>
              <small>{new Date(v.createdAt).toLocaleString()}</small>
            </li>
          ))}
        </ul>
      </Box>
    </Layout>
  )
}

export async function getServerSideProps(context) {
  return withAuth(context)
}
