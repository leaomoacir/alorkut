import React from 'react';
import IndexPage from '../src/components/IndexPage';
import { useRouter } from 'next/router';
import nookies from 'nookies';

export default function LoginScreen() {
    const router = useRouter();
    const [githubUser, setGithubUser] = React.useState('');
    
    return (
        <>
            <IndexPage />
            <main style={{ display: 'flex', flex: 1, alignItems: 'center', justifyContent: 'center', background: 'linear-gradient(135deg, #e3f2fd 0%, #fce4ec 100%)', minHeight: '100vh' }}>
                <div className="loginScreen" style={{ background: 'rgba(255, 255, 255, 0.9)', backdropFilter: 'blur(10px)', borderRadius: '16px', boxShadow: '0 8px 32px rgba(0,0,0,0.1)', padding: '20px' }}>
                    <section className="logoArea">
                        <img src="https://alurakut.vercel.app/logo.svg" alt="Logo Alurakut" style={{ filter: 'drop-shadow(0 4px 6px rgba(206, 0, 126, 0.2))' }} />
                        <p style={{ color: '#555' }}><strong>Conecte-se</strong> aos seus amigos e familiares usando recados e mensagens instantâneas</p>
                        <p style={{ color: '#555' }}><strong>Conheça</strong> novas pessoas através de amigos de seus amigos e comunidades</p>
                        <p style={{ color: '#555' }}><strong>Compartilhe</strong> seus vídeos, fotos e paixões em um só lugar</p>
                    </section>

                    <section className="formArea">
                        <form className="box" style={{ background: '#fff', borderRadius: '12px', padding: '24px', boxShadow: '0 4px 12px rgba(0,0,0,0.05)' }} onSubmit={(infosDoEvento) => {
                            infosDoEvento.preventDefault();
                            
                            fetch('https://alurakut.vercel.app/api/login', {
                                method: 'POST',
                                headers: {
                                    'Content-Type': 'application/json'
                                },
                                body: JSON.stringify({ githubUser: githubUser })
                            })
                            .then(async (respostaDoServer) => {
                                const dadosDaResposta = await respostaDoServer.json()
                                const token = dadosDaResposta.token;
                                nookies.set(null, 'USER_TOKEN', token, {
                                    path: '/',
                                    maxAge: 86400 * 7
                                })
                                router.push('/')
                            })
                        }}>
                            <p style={{ fontSize: '18px', color: '#CE007E', marginBottom: '16px' }}>
                                Acesse agora mesmo com seu usuário do <strong>GitHub</strong>!
                            </p>
                            <input 
                                required
                                placeholder="Usuário" 
                                value={githubUser}
                                onChange={(evento) => {
                                    setGithubUser(evento.target.value)
                                }}
                                style={{ width: '100%', padding: '12px', borderRadius: '8px', border: '1px solid #CE007E', marginBottom: '16px' }}
                            /> 
                            <button type="submit" aria-label="Login" style={{ width: '100%', background: '#CE007E', color: 'white', padding: '12px', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: 'bold', fontSize: '16px', transition: 'background 0.3s' }}
                                onMouseOver={(e) => e.target.style.background = '#a80066'}
                                onMouseOut={(e) => e.target.style.background = '#CE007E'}
                            >
                                Login
                            </button>
                        </form>

                        <footer className="box" style={{ marginTop: '16px', textAlign: 'center' }}>
                            <p>
                                Ainda não é membro? <br />
                                <a href="/login" style={{ color: '#0969DA', textDecoration: 'none', fontWeight: 'bold' }}>
                                    ENTRAR JÁ
                                </a>
                            </p>
                        </footer>
                    </section>

                    <footer className="footerArea" style={{ marginTop: '24px', textAlign: 'center', fontSize: '12px', color: '#888' }}>
                        <p>
                            ©2026 OrkutRevival - 
                            <a href="/" title="Sobre o Alurakut" style={{ color: '#0969DA' }}> Sobre</a> -
                            <a href="/" style={{ color: '#0969DA' }}> Centro de segurança</a> - 
                            <a href="/" style={{ color: '#0969DA' }}> Privacidade</a>
                        </p>
                    </footer>
                </div>
            </main>
        </>
    )
}