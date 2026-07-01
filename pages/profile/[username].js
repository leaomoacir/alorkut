import React from 'react';
import nookies from 'nookies';
import jwt from 'jsonwebtoken';

import MainGrid from '../../src/components/MainGrid';
import Box from '../../src/components/Box';
import IndexPage from '../../src/components/IndexPage';
import { AlurakutMenu, AlurakutProfileSidebarMenuDefault } from '../../src/lib/alurakutCommons';
import { ProfileRelationsBoxWrapper } from '../../src/components/ProfileRelations';

function BadgeIcon({ type, count, hasVoted, onToggle }) {
  const icons = {
    trusty: '🤝', cool: '😎', sexy: '💋'
  };
  const labels = {
    trusty: 'Confiável', cool: 'Legal', sexy: 'Sexy'
  };
  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', cursor: 'pointer' }} onClick={() => onToggle(type)}>
      <span style={{ fontSize: '24px', opacity: hasVoted ? 1 : 0.5 }}>{icons[type]}</span>
      <span style={{ fontSize: '12px', fontWeight: hasVoted ? 'bold' : 'normal' }}>{labels[type]}</span>
      <span style={{ fontSize: '12px', background: '#eee', borderRadius: '8px', padding: '2px 6px', marginTop: '4px' }}>{count}</span>
    </div>
  );
}

export default function ProfilePage(props) {
  const { loggedUser, targetUser } = props;

  const [loading, setLoading] = React.useState(true);
  const [isFollowing, setIsFollowing] = React.useState(false);
  const [profileData, setProfileData] = React.useState(null);
  
  const [scraps, setScraps] = React.useState([]);
  const [scrapText, setScrapText] = React.useState('');

  const [badges, setBadges] = React.useState({ counts: { trusty: 0, cool: 0, sexy: 0 }, myVotes: { trusty: false, cool: false, sexy: false } });
  
  const [testimonials, setTestimonials] = React.useState([]);
  const [testimonialText, setTestimonialText] = React.useState('');

  const [friends, setFriends] = React.useState([]);
  const [communities, setCommunities] = React.useState([]);

  React.useEffect(() => {
    Promise.all([
      fetch(`/api/followers?followerId=${loggedUser}`).then(r => r.json()),
      fetch(`/api/profile?username=${targetUser}`).then(r => r.json()),
      fetch(`/api/scraps?receiverId=${targetUser}`).then(r => r.json()),
      fetch(`/api/badges?receiverId=${targetUser}&loggedUser=${loggedUser}`).then(r => r.json()),
      fetch(`/api/testimonials?receiverId=${targetUser}`).then(r => r.json()),
      fetch(`https://api.github.com/users/${targetUser}/following`).then(r => r.json()),
      fetch('/api/comunidades').then(r => r.json())
    ]).then(([followersData, profileDataRes, scrapsRes, badgesRes, testimonialsRes, githubFriendsRes, comRes]) => {
      const follows = followersData.data?.following || [];
      setIsFollowing(follows.some(f => f.followingId === targetUser));
      
      if (profileDataRes.data) setProfileData(profileDataRes.data);
      if (scrapsRes.data) setScraps(scrapsRes.data);
      if (badgesRes.data) setBadges(badgesRes.data);
      if (testimonialsRes.data) setTestimonials(testimonialsRes.data);
      if (githubFriendsRes.length) setFriends(githubFriendsRes);
      if (comRes.data) setCommunities(comRes.data);

      setLoading(false);
    });
  }, [loggedUser, targetUser]);

  const handleFollowToggle = () => {
    if (isFollowing) {
      fetch(`/api/followers?followerId=${loggedUser}&followingId=${targetUser}`, { method: 'DELETE' }).then(() => setIsFollowing(false));
    } else {
      fetch('/api/followers', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ followerId: loggedUser, followingId: targetUser }),
      }).then(() => setIsFollowing(true));
    }
  };

  const handleBadgeToggle = (type) => {
    fetch('/api/badges', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ senderId: loggedUser, receiverId: targetUser, badgeType: type })
    }).then(res => res.json()).then(data => {
      setBadges(prev => {
        const isAdding = data.data.action === 'added';
        return {
          counts: { ...prev.counts, [type]: prev.counts[type] + (isAdding ? 1 : -1) },
          myVotes: { ...prev.myVotes, [type]: isAdding }
        };
      });
    });
  };

  const submitTestimonial = (e) => {
    e.preventDefault();
    if (!testimonialText) return;
    fetch('/api/testimonials', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ senderId: loggedUser, receiverId: targetUser, text: testimonialText })
    }).then(res => res.json()).then(data => {
      setTestimonials([data.data, ...testimonials]);
      setTestimonialText('');
      alert('Depoimento enviado (público por padrão no MVP)!');
    });
  }

  return (
    <>
      <IndexPage />
      <AlurakutMenu githubUser={loggedUser} />
      <MainGrid>
        {/* COLUNA ESQUERDA */}
        <div className="profileArea" style={{ gridArea: 'profileArea' }}>
          <Box as="aside">
            <img src={`https://github.com/${targetUser}.png`} alt="Avatar" style={{ borderRadius: '8px', border: '3px solid #CE007E' }} />
            <hr />
            <p>
              <a className="boxLink" href={`https://github.com/${targetUser}`} target="_blank" rel="noopener noreferrer" >
                @{targetUser}
              </a>
            </p>
            <p style={{ fontSize: '12px', color: '#888' }}>Membro desde hoje</p>
            
            <hr />
            <div style={{ display: 'flex', justifyContent: 'space-between', padding: '10px 0' }}>
              <BadgeIcon type="trusty" count={badges.counts.trusty} hasVoted={badges.myVotes.trusty} onToggle={handleBadgeToggle} />
              <BadgeIcon type="cool" count={badges.counts.cool} hasVoted={badges.myVotes.cool} onToggle={handleBadgeToggle} />
              <BadgeIcon type="sexy" count={badges.counts.sexy} hasVoted={badges.myVotes.sexy} onToggle={handleBadgeToggle} />
            </div>
            <hr />
            {!loading && loggedUser !== targetUser && (
              <button onClick={handleFollowToggle} style={{ width: '100%', background: isFollowing ? '#eee' : '#CE007E', color: isFollowing ? '#333' : '#fff', border: 0, padding: '8px', borderRadius: '8px', cursor: 'pointer', fontWeight: 'bold' }}>
                {isFollowing ? 'Deixar de Seguir' : 'Adicionar Amigo'}
              </button>
            )}
            <AlurakutProfileSidebarMenuDefault />
          </Box>
        </div>
        
        {/* COLUNA CENTRAL */}
        <div className="welcomeArea" style={{ gridArea: 'welcomeArea' }}>
          <Box>
            <h1 className="title">Perfil de {targetUser}</h1>
            <p className="path"><strong>Quem sou eu:</strong> Olá, sou um desenvolvedor entusiasta!</p>
            
            {profileData && (
              <div style={{ marginTop: '16px' }}>
                <h2 className="subTitle" style={{ borderBottom: '1px solid #eee', paddingBottom: '8px' }}>Minhas Skills & Stats (GitHub)</h2>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '16px' }}>
                  <div>⭐ {profileData.totalStars} Estrelas</div>
                  <div>📦 {profileData.totalRepos} Repositórios</div>
                </div>
                
                <h3 style={{ fontSize: '14px', marginBottom: '8px' }}>Projetos Recentes:</h3>
                <ul style={{ listStyle: 'none', padding: 0 }}>
                  {JSON.parse(profileData.reposData).map(repo => (
                    <li key={repo.name} style={{ background: '#f4f4f4', padding: '8px', borderRadius: '4px', marginBottom: '4px' }}>
                      <a href={repo.url} target="_blank" rel="noopener noreferrer" style={{ textDecoration: 'none', color: '#0969DA' }}>{repo.name}</a>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </Box>

          <Box>
            <h2 className="subTitle">Scrapbook ({scraps.length})</h2>
            <form onSubmit={(e) => {
              e.preventDefault();
              if (!scrapText) return;
              fetch('/api/scraps', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ senderId: loggedUser, receiverId: targetUser, text: scrapText })
              }).then(res => res.json()).then(data => {
                setScraps([data.data, ...scraps]);
                setScrapText('');
              });
            }}>
              <textarea 
                value={scrapText}
                onChange={(e) => setScrapText(e.target.value)}
                placeholder="Deixe um recado..."
                style={{ width: '100%', padding: '12px', borderRadius: '8px', border: '1px solid #CE007E', marginBottom: '8px', minHeight: '80px', fontFamily: 'inherit' }}
              />
              <button type="submit" style={{ background: '#CE007E', color: '#fff', border: 0, padding: '8px 16px', borderRadius: '8px', cursor: 'pointer', fontWeight: 'bold' }}>
                Postar Scrap
              </button>
            </form>

            <ul style={{ listStyle: 'none', padding: 0, marginTop: '24px' }}>
              {scraps.map(scrap => (
                <li key={scrap.id} style={{ display: 'flex', gap: '12px', background: '#fcfcfc', padding: '16px', borderTop: '1px solid #eee' }}>
                  <img src={`https://github.com/${scrap.senderId}.png`} alt={scrap.senderId} style={{ width: '50px', height: '50px', borderRadius: '8px' }} />
                  <div>
                    <strong><a href={`/profile/${scrap.senderId}`} style={{ color: '#CE007E', textDecoration: 'none' }}>{scrap.senderId}</a></strong> <small style={{ color: '#999' }}>{new Date(scrap.createdAt).toLocaleString()}</small>
                    <p style={{ marginTop: '8px', color: '#333', fontSize: '14px' }}>{scrap.text}</p>
                  </div>
                </li>
              ))}
            </ul>
          </Box>
        </div>

        {/* COLUNA DIREITA */}
        <div className="profileRelationsArea" style={{ gridArea: 'profileRelationsArea' }}>
          <Box>
            <h2 className="smallTitle">Depoimentos ({testimonials.length})</h2>
            <form onSubmit={submitTestimonial} style={{ marginBottom: '16px' }}>
               <input 
                  type="text" 
                  value={testimonialText} 
                  onChange={e => setTestimonialText(e.target.value)} 
                  placeholder="Escreva um depoimento..." 
                  style={{ width: '100%', padding: '8px', borderRadius: '4px', border: '1px solid #ccc', marginBottom: '8px' }}
               />
               <button type="submit" style={{ width: '100%', background: '#0969DA', color: '#fff', border: 0, padding: '6px', borderRadius: '4px', cursor: 'pointer' }}>Enviar Depoimento</button>
            </form>
            <ul style={{ listStyle: 'none', padding: 0 }}>
              {testimonials.map(t => (
                <li key={t.id} style={{ background: '#f4f4f4', padding: '10px', borderRadius: '8px', marginBottom: '10px', fontSize: '12px' }}>
                  <strong style={{ color: '#0969DA' }}>{t.senderId}:</strong> "{t.text}"
                </li>
              ))}
            </ul>
          </Box>
          <ProfileRelationsBoxWrapper>
             <h2 className="smallTitle">Amigos ({friends.length})</h2>
             <ul>
               {friends.slice(0, 16).map((f) => (
                 <li key={f.id}>
                   <a href={`/profile/${f.login}`} title={f.login}>
                     <img src={f.avatar_url} alt={f.login} />
                     <span>{f.login}</span>
                   </a>
                 </li>
               ))}
             </ul>
          </ProfileRelationsBoxWrapper>
          <ProfileRelationsBoxWrapper>
             <h2 className="smallTitle">Comunidades ({communities.length})</h2>
             <ul>
               {communities.slice(0, 16).map((c) => (
                 <li key={c.id}>
                   <a href={`/comunidades/${c.id}`} title={c.title}>
                     <img src={c.imageUrl} alt={c.title} />
                     <span>{c.title}</span>
                   </a>
                 </li>
               ))}
             </ul>
          </ProfileRelationsBoxWrapper>
        </div>
      </MainGrid>
    </>
  )
}

export async function getServerSideProps(context) {
  const cookies = nookies.get(context);
  if (!cookies.USER_TOKEN) {
    return { redirect: { destination: '/login', permanent: false } }
  }

  const { githubUser } = jwt.decode(cookies.USER_TOKEN);
  const targetUser = context.query.username;

  return {
    props: {
      loggedUser: githubUser,
      targetUser: targetUser
    },
  }
}
