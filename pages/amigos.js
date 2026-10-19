import React from 'react'
import { withAuth } from '../src/lib/auth'
import Layout from '../src/components/Layout'
import Box from '../src/components/Box'
import { ProfileRelationsBoxWrapper } from '../src/components/ProfileRelations'

export default function menuAmigos(props) {
  const githubUser = props.githubUser
  const [seguindo, setSeguindo] = React.useState([])
  const [incoming, setIncoming] = React.useState([])
  const [outgoing, setOutgoing] = React.useState([])

  const load = () => {
    Promise.all([
      fetch(`/api/followers?followerId=${githubUser}`).then((r) => r.json()),
      fetch('/api/friends').then((r) => r.json()),
    ]).then(([localFollowingResponse, friendsRes]) => {
      const localFollowing = localFollowingResponse.data?.following || []
      setSeguindo(localFollowing.map((f) => ({
        id: f.id,
        login: f.followingId,
        avatar_url: `https://github.com/${f.followingId}.png`,
      })))
      setIncoming(friendsRes.data?.incoming || [])
      setOutgoing(friendsRes.data?.outgoing || [])
    })
  }

  React.useEffect(() => { load() }, [githubUser])

  return (
    <Layout githubUser={githubUser}>
      <Box>
        <h1 className="title">Pedidos de amizade</h1>
        <p>No Orkut a amizade ia e voltava. Aceite quem voce conhece de verdade.</p>
        {incoming.length === 0 && <p>Nenhum pedido pendente. Visite perfis e envie um convite.</p>}
        {incoming.map((req) => (
          <div key={req.id} style={{ display: 'flex', gap: 8, alignItems: 'center', marginBottom: 8 }}>
            <img src={`https://github.com/${req.fromId}.png`} alt={req.fromId} style={{ width: 32, height: 32, borderRadius: 8 }} />
            <a href={`/profile/${req.fromId}`}>{req.fromId}</a>
            <button onClick={() => fetch('/api/friends', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ action: 'accept', requestId: req.id }) }).then(load)}>Aceitar</button>
            <button onClick={() => fetch('/api/friends', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ action: 'reject', requestId: req.id }) }).then(load)}>Recusar</button>
          </div>
        ))}
        {outgoing.length > 0 && <p style={{ marginTop: 12 }}>Enviados: {outgoing.map((r) => r.toId).join(', ')}</p>}
      </Box>
      <Box>
        <h1 className="title">Meus Amigos</h1>
        <p className="path">Mostrando {seguindo.length} amigos verificados nesta rede.</p>
        <h2 className="subTitle" style={{ marginTop: '24px' }}>Melhores Amigos (Top 3)</h2>
        <div style={{ display: 'flex', gap: '16px', marginBottom: '32px' }}>
          {seguindo.slice(0, 3).map((amigo) => (
            <a key={`top_${amigo.id}`} href={`/profile/${amigo.login}`} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', textDecoration: 'none' }}>
              <img src={amigo.avatar_url} style={{ width: '80px', height: '80px', borderRadius: '50%', border: '4px solid #CE007E' }} alt={amigo.login} />
              <span style={{ marginTop: '8px', fontWeight: 'bold' }}>@{amigo.login}</span>
            </a>
          ))}
          {seguindo.length === 0 && <p>Adicione amigos para ver o Top 3!</p>}
        </div>
        <ProfileRelationsBoxWrapper>
          <ul style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '16px' }}>
            {seguindo.map((amigo) => (
              <li key={amigo.id} style={{ listStyle: 'none' }}>
                <a href={`/profile/${amigo.login}`} style={{ display: 'block', textAlign: 'center', textDecoration: 'none', height: 'auto' }}>
                  <img src={amigo.avatar_url} alt={`Foto de ${amigo.login}`} style={{ width: '100%', borderRadius: '8px' }} />
                  <span style={{ display: 'block', marginTop: '4px', color: '#333' }}>{amigo.login}</span>
                </a>
              </li>
            ))}
          </ul>
        </ProfileRelationsBoxWrapper>
      </Box>
    </Layout>
  )
}

export async function getServerSideProps(context) {
  return withAuth(context)
}
