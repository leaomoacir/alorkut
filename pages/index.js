import React from 'react'
import { withAuth } from '../src/lib/auth'
import Layout from '../src/components/Layout'
import Box from '../src/components/Box'
import CustomizedInput from '../src/components/CustomizedInput'
import { OrkutNostalgicIconSet } from '../src/lib/alurakutCommons'
import { ProfileRelationsBoxWrapper } from '../src/components/ProfileRelations'

function ProfileRelationsBox(props) {
  return (
    <ProfileRelationsBoxWrapper>
      <h2 className="smallTitle">{props.title} ({props.total || props.items.length})</h2>
      <ul>
        {props.items.slice(0, 6).map((itemAtual) => (
          <li key={itemAtual.id || itemAtual.login}>
            <a href={itemAtual.html_url || `/profile/${itemAtual.login}`} title={itemAtual.login}>
              <img src={itemAtual.avatar_url} alt={itemAtual.login} />
              <span>{itemAtual.login}</span>
            </a>
          </li>
        ))}
      </ul>
      <hr />
      <p>
        <a className="boxLink" href="/amigos">Ver todos</a>
      </p>
    </ProfileRelationsBoxWrapper>
  )
}

export default function Home(props) {
  const githubUser = props.githubUser
  const [numerosSegui, setNumerosSegui] = React.useState({})
  const [seguidores, setSeguidores] = React.useState([])
  const [seguindo, setSeguindo] = React.useState([])
  const [comunidades, setComunidades] = React.useState([])
  const [comunidadesTitle, setComunidadesTitle] = React.useState('')
  const [comunidadesImage, setComunidadesImage] = React.useState('')
  const [comunidadesUrl, setComunidadesUrl] = React.useState('')
  const [feed, setFeed] = React.useState([])
  const [followUserInput, setFollowUserInput] = React.useState('')
  const [stats, setStats] = React.useState({ scraps: 0, friends: 0 })

  React.useEffect(() => {
    fetch(`https://api.github.com/users/${githubUser}`)
      .then((r) => r.json())
      .then(setNumerosSegui)
      .catch(() => {})
    fetch(`https://api.github.com/users/${githubUser}/followers`)
      .then((r) => r.json())
      .then((data) => setSeguidores(Array.isArray(data) ? data : []))
      .catch(() => {})
    Promise.all([
      fetch(`https://api.github.com/users/${githubUser}/following`).then((r) => r.json()).catch(() => []),
      fetch(`/api/followers?followerId=${githubUser}`).then((r) => r.json()),
    ]).then(([githubFollowing, localFollowingResponse]) => {
      const localFollowing = localFollowingResponse.data?.following || []
      const localFormatted = localFollowing.map((f) => ({
        id: f.id,
        login: f.followingId,
        html_url: `/profile/${f.followingId}`,
        avatar_url: `https://github.com/${f.followingId}.png`,
      }))
      const remote = Array.isArray(githubFollowing) ? githubFollowing.map((f) => ({
        ...f,
        html_url: `/profile/${f.login}`,
      })) : []
      const uniqueFollowing = Array.from(new Map([...localFormatted, ...remote].map((item) => [item.login, item])).values())
      setSeguindo(uniqueFollowing)
    })
    fetch('/api/comunidades').then((r) => r.json()).then((res) => setComunidades(res.data?.allCommunities || []))
    fetch(`/api/feed?userId=${githubUser}`).then((r) => r.json()).then((res) => setFeed(res.data || []))
    fetch(`/api/profile?username=${githubUser}`).then((r) => r.json()).then((res) => {
      if (res.stats) setStats(res.stats)
    })
  }, [githubUser])

  return (
    <Layout
      githubUser={githubUser}
      right={(
        <>
          <ProfileRelationsBoxWrapper>
            <h2 className="smallTitle">Comunidades ({comunidades.length})</h2>
            <ul>
              {comunidades.slice(0, 6).map((itemAtual) => (
                <li key={itemAtual.id}>
                  <a href={`/comunidades/${itemAtual.id}`} title={itemAtual.title}>
                    <img src={itemAtual.imageUrl} alt={itemAtual.title} />
                    <span>{itemAtual.title}</span>
                  </a>
                </li>
              ))}
            </ul>
            <hr />
            <p><a className="boxLink" href="/comunidades">Ver todos</a></p>
          </ProfileRelationsBoxWrapper>
          <ProfileRelationsBox title="Seguidores" items={seguidores} total={numerosSegui.followers} />
          <ProfileRelationsBox title="Seguindo" items={seguindo} total={seguindo.length} />
        </>
      )}
    >
      <Box>
        <h1 className="title">Bem vindo(a), {githubUser}!</h1>
        <OrkutNostalgicIconSet recados={stats.scraps} fas={stats.friends} fotos={0} />
      </Box>
      <Box>
        <h2 className="subTitle">Crie sua comunidade</h2>
        <form onSubmit={(e) => {
          e.preventDefault()
          const dadosDoForm = new FormData(e.target)
          if (!dadosDoForm.get('title')) {
            alert('Preencha o nome da comunidade')
            return
          }
          fetch('/api/comunidades', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              title: dadosDoForm.get('title'),
              imageUrl: dadosDoForm.get('image'),
              paginaUrl: dadosDoForm.get('url') || '/',
              creatorId: githubUser,
            }),
          }).then(async (response) => {
            const dados = await response.json()
            setComunidades([dados.registroCriado, ...comunidades])
            setComunidadesTitle('')
            setComunidadesImage('')
            setComunidadesUrl('')
          })
        }}>
          <CustomizedInput placeholder="Qual vai ser o nome da sua comunidade?" name="title" aria-label="Nome da comunidade" value={comunidadesTitle} onValueChange={setComunidadesTitle} />
          <div style={{ display: 'flex', gap: '8px' }}>
            <CustomizedInput placeholder="URL da imagem da capa" name="image" aria-label="URL da imagem" value={comunidadesImage} onValueChange={setComunidadesImage} required={false} />
            <CustomizedInput placeholder="URL do site" name="url" aria-label="URL do site" value={comunidadesUrl} onValueChange={setComunidadesUrl} required={false} />
          </div>
          <button type="submit">Criar comunidade</button>
        </form>
      </Box>
      <Box>
        <h2 className="subTitle">Encontrar pessoas</h2>
        <form onSubmit={(e) => {
          e.preventDefault()
          if (!followUserInput) return
          window.location.href = `/profile/${followUserInput}`
        }}>
          <CustomizedInput placeholder="Nome de usuario do GitHub" name="followingId" aria-label="Usuario GitHub" value={followUserInput} onValueChange={setFollowUserInput} />
          <button type="submit">Buscar perfil</button>
        </form>
      </Box>
      <Box>
        <h2 className="subTitle">Feed de atualizacoes</h2>
        {feed.length === 0 ? (
          <p>Nenhuma atualizacao ainda. Siga amigos, entre em comunidades e deixe recados.</p>
        ) : (
          <ul style={{ listStyle: 'none' }}>
            {feed.map((item) => (
              <li key={item.id} style={{ background: '#f9f9f9', padding: '12px', borderRadius: '8px', marginBottom: '12px', display: 'flex', gap: '12px' }}>
                <img src={`https://github.com/${item.actorId}.png`} alt={item.actorId} style={{ width: 40, height: 40, borderRadius: 8 }} />
                <div>
                  <a href={item.link}><strong>{item.title}</strong></a>
                  {item.text && <p style={{ marginTop: 6 }}>{item.text}</p>}
                  <small>{new Date(item.createdAt).toLocaleString()}</small>
                </div>
              </li>
            ))}
          </ul>
        )}
      </Box>
    </Layout>
  )
}

export async function getServerSideProps(context) {
  return withAuth(context)
}
