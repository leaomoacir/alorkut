import React from 'react'
import { withAuth } from '../src/lib/auth'
import Layout from '../src/components/Layout'
import Box from '../src/components/Box'

export default function FasPage(props) {
  const [data, setData] = React.useState({ fans: [], stars: [] })
  React.useEffect(() => {
    fetch(`/api/fans?userId=${props.githubUser}`).then((r) => r.json()).then((res) => setData(res.data || { fans: [], stars: [] }))
  }, [props.githubUser])
  return (
    <Layout githubUser={props.githubUser}>
      <Box>
        <h1 className="title">Fas ({data.fans?.length || 0})</h1>
        <p>Quem te admira nesta rede. No Orkut o fa club era serio.</p>
        {(data.fans || []).length === 0 && <p>Ninguem te marcou como fa ainda.</p>}
        {(data.fans || []).map((f) => (
          <p key={f.id}><a href={`/profile/${f.fanId}`}>{f.fanId}</a></p>
        ))}
      </Box>
      <Box>
        <h2 className="subTitle">Quem voce admira</h2>
        {(data.stars || []).length === 0 && <p>Vire fa de alguem no perfil da pessoa.</p>}
        {(data.stars || []).map((f) => (
          <p key={f.id}><a href={`/profile/${f.starId}`}>{f.starId}</a></p>
        ))}
      </Box>
    </Layout>
  )
}

export async function getServerSideProps(context) {
  return withAuth(context)
}
