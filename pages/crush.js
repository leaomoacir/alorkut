import React from 'react'
import { withAuth } from '../src/lib/auth'
import Layout from '../src/components/Layout'
import Box from '../src/components/Box'

export default function CrushPage(props) {
  const [data, setData] = React.useState({ mine: [], matches: [] })
  React.useEffect(() => {
    fetch('/api/crush').then((r) => r.json()).then((res) => setData(res.data || { mine: [], matches: [] }))
  }, [])
  return (
    <Layout githubUser={props.githubUser}>
      <Box>
        <h1 className="title">Crush</h1>
        <p>Marque um crush no perfil. Se a pessoa tambem marcar, vira match.</p>
        {(data.matches || []).length > 0 && (
          <p>Matches: {data.matches.map((u) => <a key={u} href={`/profile/${u}`} style={{ marginRight: 8 }}>{u}</a>)}</p>
        )}
        {(data.mine || []).length === 0 && <p>Nenhum crush ainda. Visite um perfil e clique em Crush.</p>}
        {(data.mine || []).map((c) => (
          <p key={c.id}>
            <a href={`/profile/${c.toId}`}>{c.toId}</a>
            {c.matched ? ' - match!' : ' - ainda secreto'}
          </p>
        ))}
      </Box>
    </Layout>
  )
}

export async function getServerSideProps(context) {
  return withAuth(context)
}
