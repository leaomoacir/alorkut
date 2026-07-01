import React from 'react';
import nookies from 'nookies';
import jwt from 'jsonwebtoken';

import MainGrid from '../src/components/MainGrid';
import Box from '../src/components/Box';
import CustomizedInput from '../src/components/CustomizedInput';
import IndexPage from '../src/components/IndexPage';
import PostBox from '../src/components/PostBox';

import { AlurakutMenu, AlurakutProfileSidebarMenuDefault, OrkutNostalgicIconSet } from '../src/lib/alurakutCommons';
import { ProfileRelationsBoxWrapper } from '../src/components/ProfileRelations';

function ProfileSidebar(props) {
  // console.log(propriedades);
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

function ProfileRelationsBox(props) {

  return (
    <ProfileRelationsBoxWrapper>
      <h2 className="smallTitle">{props.title} ({props.total})</h2>

      <ul>
        {props.items.slice(0, 6).map((itemAtual) => {
          return (
            <li key={itemAtual.id}>
              <a href={itemAtual.html_url} target="_blank" rel="noopener noreferrer" title="Site do usuário">
                <img src={itemAtual.avatar_url} alt="Avatar do usuário" />
                <span>{itemAtual.login}</span>
              </a>
            </li>
          );
        })}
      </ul>
      <hr />
      <p>
        <a className="boxLink" href={`/amigos`} >
          Ver todos
        </a>
      </p>
    </ProfileRelationsBoxWrapper>
  )
}

export default function Home(props) {
  // USUÁRIO GITHUB
  const githubUser = props.githubUser;
  // NUMEROS SEGUIDORES-SEGUINDO
  const [numerosSegui, setNumerosSegui] = React.useState([]);
  // SEGUIDORES
  const [seguidores, setSeguidores] = React.useState([]);
  // SEGUINDO
  const [seguindo, setSeguindo] = React.useState([]);
  // COMUNIDADES
  const [comunidades, setComunidades] = React.useState([]);
  // NOME COMUNIDADES
  const [comunidadesTitle, setComunidadesTitle] = React.useState([]);
  // IMAGE COMUNIDADES
  const [comunidadesImage, setComunidadesImage] = React.useState([]);
  // URL COMUNIDADES
  const [comunidadesUrl, setComunidadesUrl] = React.useState([]);
  // POST/FEED
  const [feed, setFeed] = React.useState([]);
  // SEGUIR USUÁRIO
  const [followUserInput, setFollowUserInput] = React.useState('');

  React.useEffect(function () {
    const urlNumeros = `https://api.github.com/users/${githubUser}`;
    fetch(urlNumeros)
      .then(resposta => resposta.json())
      .then(respostaJson => setNumerosSegui(respostaJson));

    const urlFollowers = `https://api.github.com/users/${githubUser}/followers`
    fetch(urlFollowers)
      .then(function (respostaDoServidor) {
        return respostaDoServidor.json();
      })
      .then(function (respostaCompleta) {
        setSeguidores(respostaCompleta);
      })

    const urlFollowing = `https://api.github.com/users/${githubUser}/following`
    
    Promise.all([
      fetch(urlFollowing).then(r => r.json()),
      fetch(`/api/followers?followerId=${githubUser}`).then(r => r.json())
    ]).then(([githubFollowing, localFollowingResponse]) => {
      const localFollowing = localFollowingResponse.data?.following || [];
      const localFormatted = localFollowing.map(f => ({
          id: f.id,
          login: f.followingId,
          html_url: `https://github.com/${f.followingId}`,
          avatar_url: `https://github.com/${f.followingId}.png`
      }));
      const allFollowing = [...localFormatted, ...githubFollowing];
      const uniqueFollowing = Array.from(new Map(allFollowing.map(item => [item.login, item])).values());
      setSeguindo(uniqueFollowing);
    }).catch((err) => {
      console.error("Erro ao carregar seguindo:", err);
    });
    // API Própria - Comunidades
    fetch('/api/comunidades')
      .then((resposta) => resposta.json())
      .then((respostaCompleta) => {
        const comunidadesVindasDaAPI = respostaCompleta.data?.allCommunities || [];
        setComunidades(comunidadesVindasDaAPI);
      })
      .catch((err) => {
        console.error("Erro ao carregar comunidades:", err);
      });
    // Feed
    fetch(`/api/feed?userId=${githubUser}`)
      .then((resposta) => resposta.json())
      .then((respostaCompleta) => {
        if(respostaCompleta.data) {
           setFeed(respostaCompleta.data);
        }
      });
  }, [])

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
            <h1 className="title">Bem vindo(a), {githubUser}!</h1>
            <OrkutNostalgicIconSet />
          </Box>

          <Box>
            <h2 className="subTitle">Crie sua comunidade</h2>
            <form onSubmit={function handleCriaComunidade(e) {
              e.preventDefault();
              const dadosDoForm = new FormData(e.target);
              
              if (!dadosDoForm.get('title') || !dadosDoForm.get('url')) {
                alert('Preencha os campos obrigatórios!');
                return;
              }

              const comunidade = {
                title: dadosDoForm.get('title'),
                imageUrl: dadosDoForm.get('image'),
                paginaUrl: dadosDoForm.get('url'),
                creatorId: githubUser
              }
              fetch('/api/comunidades', {
                method: 'POST',
                headers: {
                  'Content-Type': 'application/json'
                },
                body: JSON.stringify(comunidade),
              })
                .then(async (response) => {
                  const dados = await response.json();
                  // console.log(dados.registroCriado);
                  const comunidade = dados.registroCriado;
                  const comunidadesAtualizadas = [...comunidades, comunidade]
                  setComunidades(comunidadesAtualizadas);
                  setComunidadesTitle('');
                  setComunidadesImage('');
                  setComunidadesUrl('');
                })
            }}>
              <div>
                <CustomizedInput
                  placeholder="Qual vai ser o nome da sua comunidade?"
                  name="title"
                  aria-label="Qual vai ser o nome da sua comunidade?"
                  value={comunidadesTitle}
                  onValueChange={setComunidadesTitle}
                />
              </div>
              <div style={{ display: 'flex' }}>
                <CustomizedInput
                  placeholder="Coloque a URL da imagem da capa"
                  name="image"
                  aria-label="Coloque a URL da imagem da capa"
                  value={comunidadesImage}
                  onValueChange={setComunidadesImage}
                />
                <CustomizedInput
                  placeholder="Coloque a URL do site"
                  name="url"
                  aria-label="Coloque a URL do site"
                  value={comunidadesUrl}
                  onValueChange={setComunidadesUrl}
                />
              </div>
              <button type="submit" aria-label="Criar comunidade" style={{ background: '#2E7BB4' }} >
                Criar comunidade
              </button>
            </form>
          </Box>

          <Box>
            <h2 className="subTitle">Encontrar e Seguir Usuários</h2>
            <form onSubmit={function handleFollowUser(e) {
              e.preventDefault();
              const dadosDoForm = new FormData(e.target);
              const targetUser = dadosDoForm.get('followingId');
              if (!targetUser) {
                alert('Digite um usuário do GitHub para buscar!');
                return;
              }

              window.location.href = `/profile/${targetUser}`;
            }}>
              <div>
                <CustomizedInput
                  placeholder="Nome de usuário do GitHub"
                  name="followingId"
                  aria-label="Nome de usuário do GitHub"
                  value={followUserInput}
                  onValueChange={setFollowUserInput}
                />
              </div>
              <button type="submit" aria-label="Buscar Perfil" style={{ background: '#2E7BB4' }} >
                Buscar Perfil
              </button>
            </form>
            <Box>
            <h2 className="subTitle">Feed de Atualizações (Scraps)</h2>
            {feed.length === 0 ? (
                <p>Nenhuma atualização ainda.</p>
            ) : (
                <ul style={{ listStyle: 'none' }}>
                  {feed.map(scrap => (
                    <li key={scrap.id} style={{ background: '#f9f9f9', padding: '12px', borderRadius: '8px', marginBottom: '12px' }}>
                      <strong><a href={`/profile/${scrap.senderId}`}>{scrap.senderId}</a></strong> escreveu no mural de <strong><a href={`/profile/${scrap.receiverId}`}>{scrap.receiverId}</a></strong>:
                      <p style={{ marginTop: '8px', color: '#333' }}>{scrap.text}</p>
                      <small style={{ color: '#999' }}>{new Date(scrap.createdAt).toLocaleString()}</small>
                    </li>
                  ))}
                </ul>
            )}
          </Box>
          </Box>



        </div>

        <div className="profileRelationsArea" style={{ gridArea: 'profileRelationsArea' }}>

          <ProfileRelationsBoxWrapper>
            <h2 className="smallTitle">Comunidades ({comunidades.length})</h2>

            {comunidades.length === 0 ? (
              <p style={{ textAlign: 'center', padding: '10px 0', color: '#999' }}>
                Nenhuma comunidade ainda. Configure seu DatoCMS!
              </p>
            ) : (
              <ul>
                {comunidades.slice(0, 6).map((itemAtual) => {
                  return (
                    <li key={itemAtual.id}>
                      <a href={itemAtual.paginaUrl} target="_blank" rel="noopener noreferrer" title="Site da comunidade">
                        <img src={itemAtual.imageUrl} alt="Capa da comunidade" />
                        <span>{itemAtual.title}</span>
                      </a>
                    </li>
                  );
                })}
              </ul>
            )}
            <hr />
            <p>
              <a className="boxLink" href={`/comunidades`} >
                Ver todos
              </a>
            </p>
          </ProfileRelationsBoxWrapper>

          <ProfileRelationsBox title="Seguidores" items={seguidores} total={numerosSegui.followers} />

          <ProfileRelationsBox title="Seguindo" items={seguindo} total={numerosSegui.following} />

        </div>

      </MainGrid>
    </>
  )
}

export async function getServerSideProps(context) {
  const cookies = nookies.get(context);
  if (!cookies.USER_TOKEN) {
    return {
      redirect: {
        destination: '/login',
        permanent: false,
      }
    }
  }

  const token = cookies.USER_TOKEN;

  const { githubUser } = jwt.decode(token);
  return {
    props: {
      githubUser
    }, // will be passed to the page component as props
  }
}