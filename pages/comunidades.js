import React from 'react';
import nookies from 'nookies';
import jwt from 'jsonwebtoken';

import IndexPage from '../src/components/IndexPage';
import ComunidadeGrid from '../src/components/ComunidadeGrid';
import Box from '../src/components/Box';

import { AlurakutMenu, AlurakutProfileSidebarMenuDefault, OrkutNostalgicIconSet } from '../src/lib/alurakutCommons';
import { ProfileRelationsBoxWrapper } from '../src/components/ProfileRelations';

function ProfileSidebar(propriedades) {
    // console.log(propriedades);
    return (
        <Box as="aside">
            <img src={`https://github.com/${propriedades.githubUser}.png`} alt="Foto do usuário" style={{ borderRadius: '8px' }} />
            <hr />
            <p>
                <a className="boxLink" href={`https://github.com/${propriedades.githubUser}`} title="Nome do usuário" target="_blank" rel="noopener noreferrer" >
                    @{propriedades.githubUser}
                </a>
            </p>
            <hr />
            <AlurakutProfileSidebarMenuDefault />
        </Box>
    )
}

export default function menuComunidades(props) {
    // USUÁRIO GITHUB
    const githubUser = props.githubUser;
    // COMUNIDADES
    const [comunidades, setComunidades] = React.useState([]);

    React.useEffect(function () {
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
    }, [])

    const handleDelete = (id) => {
        if (!confirm('Deseja realmente excluir esta comunidade?')) return;
        fetch(`/api/comunidades?id=${id}&creatorId=${githubUser}`, {
            method: 'DELETE'
        }).then(res => {
            if(res.ok) {
                setComunidades(comunidades.filter(c => c.id !== id));
            } else {
                alert('Erro ao excluir ou você não tem permissão.');
            }
        });
    }

    return (
        <>
            <IndexPage />
            <AlurakutMenu githubUser={githubUser} />
            <ComunidadeGrid>

                <div className="profileArea" style={{ gridArea: 'profileArea' }}>
                    <ProfileSidebar githubUser={githubUser} />
                </div>

                <div style={{ gridArea: 'comunidadeArea'}}>
                    <ProfileRelationsBoxWrapper>
                        <h2 className="smallTitle">Comunidades ({comunidades.length})</h2>

                        {comunidades.length === 0 ? (
                            <p style={{ textAlign: 'center', padding: '20px 0', color: '#999' }}>
                                Nenhuma comunidade encontrada. Configure seu DatoCMS!
                            </p>
                        ) : (
                            <ul>
                                {comunidades.map((itemAtual) => {
                                    return (
                                        <li key={itemAtual.id} style={{ position: 'relative' }}>
                                            <a href={`/comunidades/${itemAtual.id}`} title="Fórum da comunidade" style={{ height: '200px', width: '100%' }} >
                                                <img src={itemAtual.imageUrl} alt="Capa da comunidade" />
                                                <span style={{ fontSize: '16px' }}>{itemAtual.title}</span>
                                            </a>
                                            {itemAtual.creatorId === githubUser && (
                                                <button onClick={() => handleDelete(itemAtual.id)} style={{ position: 'absolute', top: 5, right: 5, background: 'red', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer', padding: '5px' }}>Excluir</button>
                                            )}
                                        </li>
                                    );
                                })}
                            </ul>
                        )}
                    </ProfileRelationsBoxWrapper>
                </div>

            </ComunidadeGrid>

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