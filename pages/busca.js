import React from 'react'
import { useRouter } from 'next/router'
import { withAuth } from '../src/lib/auth'
import Layout from '../src/components/Layout'
import Box from '../src/components/Box'

export default function BuscaPage(props) {
  const router = useRouter()
  const q = String(router.query.q || '')
  const [results, setResults] = React.useState({ users: [], communities: [], topics: [] })

  React.useEffect(() => {
    if (!q) return
    fetch(`/api/search?q=${encodeURIComponent(q)}`).then((r) => r.json()).then((res) => setResults(res.data || { users: [], communities: [], topics: [] }))
  }, [q])

  return (
    <Layout githubUser={props.githubUser}>
      <Box>
        <h1 className="title">Busca: {q || 'digite na barra acima'}</h1>
        <p>Pessoas, comunidades e topicos. A mesma busca do cabecalho classico.</p>
        <h2 className="subTitle">Pessoas</h2>
        {results.users.length === 0 && <p>Nenhum usuario encontrado.</p>}
        {results.users.map((u) => (
          <p key={u.username}><a href={`/profile/${u.username}`}>@{u.username}</a></p>
        ))}
        <h2 className="subTitle">Comunidades</h2>
        {results.communities.length === 0 && <p>Nenhuma comunidade encontrada.</p>}
        {results.communities.map((c) => (
          <p key={c.id}><a href={`/comunidades/${c.id}`}>{c.title}</a></p>
        ))}
        <h2 className="subTitle">Topicos</h2>
        {results.topics.length === 0 && <p>Nenhum topico encontrado.</p>}
        {results.topics.map((t) => (
          <p key={t.id}><a href={`/comunidades/${t.communityId}`}>{t.title}</a></p>
        ))}
      </Box>
    </Layout>
  )
}

export async function getServerSideProps(context) {
  return withAuth(context)
}
