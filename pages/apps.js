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
        {APPS.map((app) => (
          <p key={app.href}><a href={app.href}><strong>{app.title}</strong></a> - {app.text}</p>
        ))}
      </Box>
    </Layout>
  )
}

export async function getServerSideProps(context) {
  return withAuth(context)
}
