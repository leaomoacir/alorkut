import React from 'react';
import nookies from 'nookies';
import jwt from 'jsonwebtoken';

import IndexPage from '../src/components/IndexPage';
import Box from '../src/components/Box';
import MainGrid from '../src/components/MainGrid';
import { AlurakutMenu, AlurakutProfileSidebarMenuDefault } from '../src/lib/alurakutCommons';
import { ProfileRelationsBoxWrapper } from '../src/components/ProfileRelations';

function ProfileSidebar(props) {
    return (
        <Box as="aside">
            <img src={`https://github.com/${props.githubUser}.png`} alt="Foto do usuário" style={{ borderRadius: '8px' }} />
            <hr />
            <p>
                <a className="boxLink" href={`https://github.com/${props.githubUser}`} title="Nome do usuário" target="_blank" rel="noopener noreferrer" >
                    @{props.githubUser}
                </a>
            </p>
            <hr />
            <AlurakutProfileSidebarMenuDefault />
        </Box>
    )
}

export default function menuAmigos(props) {
    const githubUser = props.githubUser;
    const [seguindo, setSeguindo] = React.useState([]);

    React.useEffect(function () {
        const urlFollowing = `https://api.github.com/users/${githubUser}/following`;
        
        Promise.all([
          fetch(urlFollowing).then(r => r.json()),
          fetch(`/api/followers?followerId=${githubUser}`).then(r => r.json())
        ]).then(([githubFollowing, localFollowingResponse]) => {
          const localFollowing = localFollowingResponse.data?.following || [];
          const localFormatted = localFollowing.map(f => ({
              id: f.id,
              login: f.followingId,
              html_url: `/profile/${f.followingId}`,
              avatar_url: `https://github.com/${f.followingId}.png`
          }));
          const githubFormatted = githubFollowing.map(f => ({
              id: f.id,
              login: f.login,
              html_url: `/profile/${f.login}`,
              avatar_url: f.avatar_url
          }));
          const allFollowing = [...localFormatted, ...githubFormatted];
          const uniqueFollowing = Array.from(new Map(allFollowing.map(item => [item.login, item])).values());
          setSeguindo(uniqueFollowing);
        }).catch((err) => console.error("Erro ao carregar seguindo:", err));
    }, [githubUser]);

    return (
        <>
            <IndexPage />
            <AlurakutMenu githubUser={githubUser} />
            <MainGrid>
                <div className="profileArea" style={{ gridArea: 'profileArea' }}>
                    <ProfileSidebar githubUser={githubUser} />
                </div>
                
                <div className="welcomeArea" style={{ gridArea: 'welcomeArea' }}>
                    <Box>
                        <h1 className="title">Meus Amigos</h1>
                        <p className="path">Mostrando todos os {seguindo.length} amigos combinados.</p>
                        
                        <h2 className="subTitle" style={{ marginTop: '24px' }}>⭐ Melhores Amigos (Top 3)</h2>
                        <div style={{ display: 'flex', gap: '16px', marginBottom: '32px' }}>
                          {seguindo.slice(0, 3).map(amigo => (
                            <a key={`top_${amigo.id}`} href={`/profile/${amigo.login}`} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', textDecoration: 'none' }}>
                              <img src={amigo.avatar_url} style={{ width: '80px', height: '80px', borderRadius: '50%', border: '4px solid #CE007E' }} alt={amigo.login} />
                              <span style={{ marginTop: '8px', fontWeight: 'bold', color: '#0969DA' }}>@{amigo.login}</span>
                            </a>
                          ))}
                          {seguindo.length === 0 && <p style={{ fontSize: '12px' }}>Adicione amigos para ver o Top 3!</p>}
                        </div>

                        <h2 className="subTitle">Todos os Amigos</h2>
                        <ProfileRelationsBoxWrapper>
                            <ul style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '16px' }}>
                                {seguindo.map((amigo) => (
                                    <li key={amigo.id} style={{ listStyle: 'none' }}>
                                        <a href={`/profile/${amigo.login}`} style={{ display: 'block', textAlign: 'center', textDecoration: 'none' }}>
                                            <img src={amigo.avatar_url} alt={`Foto de ${amigo.login}`} style={{ width: '100%', borderRadius: '8px' }} />
                                            <span style={{ display: 'block', marginTop: '4px', color: '#333', fontSize: '14px', wordBreak: 'break-all' }}>{amigo.login}</span>
                                        </a>
                                    </li>
                                ))}
                            </ul>
                        </ProfileRelationsBoxWrapper>
                    </Box>
                </div>
                
                <div className="profileRelationsArea" style={{ gridArea: 'profileRelationsArea' }}>
                </div>
            </MainGrid>
        </>
    )
}

export async function getServerSideProps(context) {
    const cookies = nookies.get(context);
    if (!cookies.USER_TOKEN) {
        return {
            redirect: { destination: '/login', permanent: false }
        }
    }
    const token = cookies.USER_TOKEN;
    const { githubUser } = jwt.decode(token);
    return { props: { githubUser } }
}