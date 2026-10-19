import React from 'react'
import { withAuth } from '../src/lib/auth'
import Layout from '../src/components/Layout'
import Box from '../src/components/Box'
import { ProfileRelationsBoxWrapper } from '../src/components/ProfileRelations'

export default function menuComunidades(props) {
  const githubUser = props.githubUser
  const [comunidades, setComunidades] = React.useState([])

  React.useEffect(() => {
    fetch('/api/comunidades')
      .then((r) => r.json())
      .then((res) => setComunidades(res.data?.allCommunities || []))
  }, [])

  const handleDelete = (id) => {
    if (!confirm('Deseja realmente excluir esta comunidade?')) return
    fetch(`/api/comunidades?id=${id}`, { method: 'DELETE' }).then((res) => {
      if (res.ok) setComunidades(comunidades.filter((c) => c.id !== id))
      else alert('Erro ao excluir ou voce nao tem permissao.')
    })
  }

  return (
    <Layout githubUser={githubUser}>
      <Box>
        <h1 className="title">Comunidades ({comunidades.length})</h1>
        <ProfileRelationsBoxWrapper>
          {comunidades.length === 0 ? (
            <p>Nenhuma comunidade ainda. Crie a primeira na pagina inicial.</p>
          ) : (
            <ul>
              {comunidades.map((itemAtual) => (
                <li key={itemAtual.id} style={{ position: 'relative' }}>
                  <a href={`/comunidades/${itemAtual.id}`} title="Forum da comunidade" style={{ height: '140px', width: '100%' }}>
                    <img src={itemAtual.imageUrl} alt={itemAtual.title} />
                    <span>{itemAtual.title}</span>
                  </a>
                  {itemAtual.creatorId === githubUser && (
                    <button onClick={() => handleDelete(itemAtual.id)} style={{ position: 'absolute', top: 5, right: 5, background: 'red', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer', padding: '5px' }}>Excluir</button>
                  )}
                </li>
              ))}
            </ul>
          )}
        </ProfileRelationsBoxWrapper>
      </Box>
    </Layout>
  )
}

export async function getServerSideProps(context) {
  return withAuth(context)
}
