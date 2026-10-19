import { withAuth } from '../src/lib/auth'
import Layout from '../src/components/Layout'
import Box from '../src/components/Box'

export default function SobrePage(props) {
  return (
    <Layout githubUser={props.githubUser}>
      <Box>
        <h1 className="title">Sobre o Orkut Revival</h1>
        <p>Uma homenagem ao Orkut de 2004: recados no mural, comunidades, depoimentos, selos Confiavel/Legal/Sexy, presentes, eventos e aquele feed de atualizacoes.</p>
        <p>O login exige prova de posse da conta GitHub (codigo na bio/gist ou Personal Access Token). Sem isso ninguem entra no seu perfil para editar.</p>
        <p>Stack: Next.js, Prisma e SQLite. Temas classico, MSN, dark e matrix.</p>
        <p><a href="/apps">Ver aplicativos</a> | <a href="/comunidades">Comunidades</a> | <a href="/configuracoes">Seu perfil</a></p>
      </Box>
    </Layout>
  )
}

export async function getServerSideProps(context) {
  return withAuth(context)
}
