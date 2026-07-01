import React from 'react';
import nookies from 'nookies';
import jwt from 'jsonwebtoken';
import { PrismaClient } from '@prisma/client';

import MainGrid from '../../src/components/MainGrid';
import Box from '../../src/components/Box';
import IndexPage from '../../src/components/IndexPage';
import { AlurakutMenu, AlurakutProfileSidebarMenuDefault } from '../../src/lib/alurakutCommons';

export default function CommunityForumPage(props) {
  const { loggedUser, community } = props;
  
  const [topics, setTopics] = React.useState([]);
  const [newTopicTitle, setNewTopicTitle] = React.useState('');
  
  const [activeTopic, setActiveTopic] = React.useState(null);
  const [posts, setPosts] = React.useState([]);
  const [newPostText, setNewPostText] = React.useState('');

  React.useEffect(() => {
    if (community) {
      fetch(`/api/forums?communityId=${community.id}`)
        .then(res => res.json())
        .then(data => setTopics(data.data || []));
    }
  }, [community]);

  const loadTopic = (topicId) => {
    fetch(`/api/forums?topicId=${topicId}`)
      .then(res => res.json())
      .then(data => {
        setActiveTopic(data.data.topic);
        setPosts(data.data.posts);
      });
  };

  const createTopic = (e) => {
    e.preventDefault();
    fetch('/api/forums', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ type: 'topic', title: newTopicTitle, authorId: loggedUser, communityId: community.id })
    }).then(res => res.json()).then(data => {
      setTopics([data.data, ...topics]);
      setNewTopicTitle('');
    });
  };

  const createPost = (e) => {
    e.preventDefault();
    fetch('/api/forums', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ type: 'post', text: newPostText, authorId: loggedUser, topicId: activeTopic.id })
    }).then(res => res.json()).then(data => {
      setPosts([...posts, data.data]);
      setNewPostText('');
    });
  };

  if (!community) return <div>Comunidade não encontrada!</div>;

  return (
    <>
      <IndexPage />
      <AlurakutMenu githubUser={loggedUser} />
      <MainGrid>
        <div className="profileArea" style={{ gridArea: 'profileArea' }}>
          <Box as="aside">
            <img src={community.imageUrl} alt="Capa" style={{ borderRadius: '8px' }} />
            <hr />
            <p>
              <a className="boxLink" href={community.paginaUrl} target="_blank" rel="noopener noreferrer">
                {community.title}
              </a>
            </p>
            <hr />
            <AlurakutProfileSidebarMenuDefault />
          </Box>
        </div>
        
        <div className="welcomeArea" style={{ gridArea: 'welcomeArea' }}>
          {!activeTopic ? (
            <Box>
              <h1 className="title">Fórum da Comunidade</h1>
              
              <form onSubmit={createTopic} style={{ marginBottom: '24px', display: 'flex', gap: '8px' }}>
                <input 
                  type="text" 
                  value={newTopicTitle}
                  onChange={e => setNewTopicTitle(e.target.value)}
                  placeholder="Título do novo tópico..."
                  style={{ flex: 1, padding: '8px', borderRadius: '4px', border: '1px solid #ccc' }}
                  required
                />
                <button type="submit" style={{ background: '#2E7BB4', color: '#fff', border: 0, padding: '8px 16px', borderRadius: '4px', cursor: 'pointer' }}>Criar Tópico</button>
              </form>

              <h2 className="subTitle">Tópicos ({topics.length})</h2>
              <ul style={{ listStyle: 'none', padding: 0 }}>
                {topics.map(t => (
                  <li key={t.id} style={{ display: 'flex', justifyContent: 'space-between', background: '#f4f4f4', padding: '12px', marginBottom: '8px', borderRadius: '8px', cursor: 'pointer' }} onClick={() => loadTopic(t.id)}>
                    <strong style={{ color: '#0969DA' }}>{t.title}</strong>
                    <span style={{ fontSize: '12px', color: '#666' }}>Por: {t.authorId} | Respostas: {t.postCount || 0}</span>
                  </li>
                ))}
              </ul>
            </Box>
          ) : (
            <Box>
              <button onClick={() => setActiveTopic(null)} style={{ background: 'transparent', border: 'none', color: '#0969DA', cursor: 'pointer', marginBottom: '16px' }}>&larr; Voltar aos tópicos</button>
              <h1 className="title">{activeTopic.title}</h1>
              
              <ul style={{ listStyle: 'none', padding: 0, marginBottom: '24px' }}>
                {posts.map(p => (
                  <li key={p.id} style={{ display: 'flex', gap: '12px', background: '#f9f9f9', padding: '16px', borderTop: '1px solid #eee' }}>
                    <img src={`https://github.com/${p.authorId}.png`} alt={p.authorId} style={{ width: '40px', height: '40px', borderRadius: '8px' }} />
                    <div>
                      <strong><a href={`/profile/${p.authorId}`} style={{ color: '#CE007E', textDecoration: 'none' }}>{p.authorId}</a></strong>
                      <p style={{ marginTop: '4px', color: '#333' }}>{p.text}</p>
                    </div>
                  </li>
                ))}
                {posts.length === 0 && <p>Nenhuma resposta ainda. Seja o primeiro!</p>}
              </ul>

              <form onSubmit={createPost}>
                <textarea 
                  value={newPostText}
                  onChange={e => setNewPostText(e.target.value)}
                  placeholder="Escreva sua resposta..."
                  style={{ width: '100%', padding: '12px', borderRadius: '4px', border: '1px solid #ccc', marginBottom: '8px', minHeight: '80px' }}
                  required
                />
                <button type="submit" style={{ background: '#2E7BB4', color: '#fff', border: 0, padding: '8px 16px', borderRadius: '4px', cursor: 'pointer' }}>Responder</button>
              </form>
            </Box>
          )}
        </div>
      </MainGrid>
    </>
  );
}

export async function getServerSideProps(context) {
  const cookies = nookies.get(context);
  if (!cookies.USER_TOKEN) {
    return { redirect: { destination: '/login', permanent: false } }
  }

  const { githubUser } = jwt.decode(cookies.USER_TOKEN);
  const communityId = context.query.id;

  const prisma = new PrismaClient();
  const community = await prisma.community.findUnique({
    where: { id: communityId }
  });

  return {
    props: {
      loggedUser: githubUser,
      community: JSON.parse(JSON.stringify(community))
    },
  }
}
