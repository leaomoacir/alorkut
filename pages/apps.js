import React from 'react'
import { withAuth } from '../src/lib/auth'
import Layout from '../src/components/Layout'
import Box from '../src/components/Box'

const APPS = [
  { href: '/enquetes', title: 'Quem me conhece melhor?', text: 'Quiz classico entre amigos.' },
  { href: '/presentes', title: 'Presentes virtuais', text: 'Mande coracao, cafe e trofeu.' },
  { href: '/eventos', title: 'Eventos', text: 'Marque encontro da comunidade.' },
  { href: '/videos', title: 'Videos', text: 'Compartilhe clips do YouTube.' },
  { href: '/fotos', title: 'Albuns', text: 'Mostre o setup e os projetos.' },
  { href: '/visitas', title: 'Visitantes', text: 'Veja quem passou no perfil.' },
  { href: '/recados', title: 'Recados', text: 'Leia o mural de scraps.' },
  { href: '/mensagens', title: 'Mensagens', text: 'Chat privado entre amigos.' },
]

export default function AppsPage(props) {
  return (
    <Layout githubUser={props.githubUser}>
      <Box>
        <h1 className="title">Aplicativos do Orkut</h1>
        <p>Os miniaplicativos da rede: quizzes, presentes, eventos, videos e o mural.</p>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 12, marginTop: 16 }}>
          {APPS.map((app) => (
            <a key={app.href} href={app.href} style={{ display: 'block', background: '#f4f4f4', padding: 16, borderRadius: 8, textDecoration: 'none' }}>
              <strong>{app.title}</strong>
              <p style={{ color: '#555', marginTop: 4 }}>{app.text}</p>
            </a>
          ))}
        </div>
      </Box>
    </Layout>
  )
}

export async function getServerSideProps(context) {
  return withAuth(context)
}
