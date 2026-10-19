import React from 'react'
import { withAuth } from '../src/lib/auth'
import Layout from '../src/components/Layout'
import Box from '../src/components/Box'

export default function RecadosPage(props) {
  const [scraps, setScraps] = React.useState([])
  React.useEffect(() => {
    fetch(`/api/scraps?receiverId=${props.githubUser}`).then((r) => r.json()).then((res) => setScraps(res.data || []))
  }, [props.githubUser])
  return (
    <Layout githubUser={props.githubUser}>
      <Box>
        <h1 className="title">Meus recados</h1>
        <p>Tudo que a galera deixou no seu mural. Responda no perfil de quem escreveu.</p>
        {scraps.length === 0 && <p>Nenhum recado no mural ainda. Peca para um amigo passar no seu perfil.</p>}
        {scraps.map((scrap) => (
          <div key={scrap.id} style={{ display: 'flex', gap: 12, padding: '12px 0', borderBottom: '1px solid #eee' }}>
            <img src={`https://github.com/${scrap.senderId}.png`} alt={scrap.senderId} style={{ width: 48, height: 48, borderRadius: 8 }} />
            <div>
              <a href={`/profile/${scrap.senderId}`}>{scrap.senderId}</a>
              <p>{scrap.text}</p>
              <small>{new Date(scrap.createdAt).toLocaleString()}</small>
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
