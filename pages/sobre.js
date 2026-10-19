import { withAuth } from '../src/lib/auth'
import Layout from '../src/components/Layout'
import Box from '../src/components/Box'

export default function SobrePage(props) {
  return (
    <Layout githubUser={props.githubUser}>
      <Box>
        <h1 className="title">Sobre o Orkut Revival</h1>
        <p>Recados, comunidades, depoimentos, selos, mensagens e provas de posse no GitHub.</p>
        <p>O login exige que voce controle a conta: codigo na bio/gist ou Personal Access Token. Sem isso ninguem edita o perfil de outra pessoa.</p>
      </Box>
    </Layout>
  )
}

export async function getServerSideProps(context) {
  return withAuth(context)
}
