import React from 'react'
import { withAuth } from '../../src/lib/auth'
import prisma from '../../src/lib/prisma'
import Layout from '../../src/components/Layout'
import Box from '../../src/components/Box'
import { ProfileRelationsBoxWrapper } from '../../src/components/ProfileRelations'

export default function CommunityForumPage(props) {
  const { loggedUser, community } = props
  const [topics, setTopics] = React.useState([])
  const [newTopicTitle, setNewTopicTitle] = React.useState('')
  const [activeTopic, setActiveTopic] = React.useState(null)
  const [posts, setPosts] = React.useState([])
  const [newPostText, setNewPostText] = React.useState('')
  const [members, setMembers] = React.useState([])
  const [joined, setJoined] = React.useState(false)

  React.useEffect(() => {
    if (!community) return
    fetch(`/api/forums?communityId=${community.id}`).then((r) => r.json()).then((data) => setTopics(data.data || []))
    fetch(`/api/members?communityId=${community.id}&userId=${loggedUser}`).then((r) => r.json()).then((data) => {
      setMembers(data.data?.members || [])
      setJoined(Boolean(data.data?.joined))
    })
  }, [community, loggedUser])

  const loadTopic = (topicId) => {
    fetch(`/api/forums?topicId=${topicId}`).then((r) => r.json()).then((data) => {
      setActiveTopic(data.data.topic)
      setPosts(data.data.posts)
    })
  }

  const createTopic = (e) => {
    e.preventDefault()
    fetch('/api/forums', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ type: 'topic', title: newTopicTitle, communityId: community.id }),
    }).then((r) => r.json()).then((data) => {
      setTopics([data.data, ...topics])
      setNewTopicTitle('')
    })
  }

  const createPost = (e) => {
    e.preventDefault()
    fetch('/api/forums', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ type: 'post', text: newPostText, topicId: activeTopic.id }),
    }).then((r) => r.json()).then((data) => {
      setPosts([...posts, data.data])
      setNewPostText('')
    })
  }

  const toggleJoin = () => {
    if (joined) {
      fetch(`/api/members?communityId=${community.id}`, { method: 'DELETE' }).then(() => {
        setJoined(false)
        setMembers(members.filter((m) => m.userId !== loggedUser))
      })
    } else {
      fetch('/api/members', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ communityId: community.id }),
      }).then((r) => r.json()).then((data) => {
        setJoined(true)
        setMembers([data.data, ...members])
      })
    }
  }

  if (!community) return <div>Comunidade nao encontrada!</div>

  return (
    <Layout
      githubUser={loggedUser}
      right={(
        <ProfileRelationsBoxWrapper>
          <h2 className="smallTitle">Membros ({members.length})</h2>
          <ul>
            {members.slice(0, 16).map((m) => (
              <li key={m.id}>
                <a href={`/profile/${m.userId}`}>
                  <img src={`https://github.com/${m.userId}.png`} alt={m.userId} />
                  <span>{m.userId}</span>
                </a>
              </li>
            ))}
          </ul>
        </ProfileRelationsBoxWrapper>
      )}
    >
      {!activeTopic ? (
        <Box>
          <img src={community.imageUrl} alt={community.title} style={{ width: '100%', maxHeight: 180, objectFit: 'cover', borderRadius: 8, marginBottom: 12 }} />
          <h1 className="title">{community.title}</h1>
          <p style={{ fontSize: 12, color: '#666' }}>{community.category || 'Geral'} | dono: {community.creatorId}</p>
          <p>{community.description || 'Uma comunidade do Orkut Revival.'}</p>
          <button onClick={toggleJoin} style={{ margin: '12px 0', background: joined ? '#eee' : '#2E7BB4', color: joined ? '#333' : '#fff', border: 0, padding: '8px 16px', borderRadius: 8 }}>
            {joined ? 'Sair da comunidade' : 'Participar da comunidade'}
          </button>
          <form onSubmit={createTopic} style={{ marginBottom: '24px', display: 'flex', gap: '8px' }}>
            <input type="text" value={newTopicTitle} onChange={(e) => setNewTopicTitle(e.target.value)} placeholder="Titulo do novo topico..." style={{ flex: 1, padding: '8px', borderRadius: '4px', border: '1px solid #ccc' }} required />
            <button type="submit">Criar Topico</button>
          </form>
          <h2 className="subTitle">Topicos ({topics.length})</h2>
          <ul style={{ listStyle: 'none' }}>
            {topics.map((t) => (
              <li key={t.id} style={{ display: 'flex', justifyContent: 'space-between', background: '#f4f4f4', padding: '12px', marginBottom: '8px', borderRadius: '8px', cursor: 'pointer' }} onClick={() => loadTopic(t.id)}>
                <strong>{t.title}</strong>
                <span>Por: {t.authorId} | Respostas: {t.postCount || 0}</span>
              </li>
            ))}
          </ul>
        </Box>
      ) : (
        <Box>
          <button onClick={() => setActiveTopic(null)} style={{ background: 'transparent', border: 'none', color: '#0969DA', marginBottom: '16px' }}>Voltar aos topicos</button>
          <h1 className="title">{activeTopic.title}</h1>
          <ul style={{ listStyle: 'none', marginBottom: '24px' }}>
            {posts.map((p) => (
              <li key={p.id} style={{ display: 'flex', gap: '12px', background: '#f9f9f9', padding: '16px', borderTop: '1px solid #eee' }}>
                <img src={`https://github.com/${p.authorId}.png`} alt={p.authorId} style={{ width: '40px', height: '40px', borderRadius: '8px' }} />
                <div>
                  <strong><a href={`/profile/${p.authorId}`}>{p.authorId}</a></strong>
                  <p style={{ marginTop: '4px' }}>{p.text}</p>
                </div>
              </li>
            ))}
            {posts.length === 0 && <p>Nenhuma resposta ainda. Seja o primeiro!</p>}
          </ul>
          <form onSubmit={createPost}>
            <textarea value={newPostText} onChange={(e) => setNewPostText(e.target.value)} placeholder="Escreva sua resposta..." style={{ width: '100%', padding: '12px', borderRadius: '4px', border: '1px solid #ccc', marginBottom: '8px', minHeight: '80px' }} required />
            <button type="submit">Responder</button>
          </form>
        </Box>
      )}
    </Layout>
  )
}

export async function getServerSideProps(context) {
  const auth = await withAuth(context)
  if (auth.redirect) return auth
  const community = await prisma.community.findUnique({ where: { id: context.query.id } })
  return {
    props: {
      ...auth.props,
      loggedUser: auth.props.githubUser,
      community: JSON.parse(JSON.stringify(community)),
    },
  }
}
