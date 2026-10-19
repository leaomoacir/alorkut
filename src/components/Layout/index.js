import React from 'react'
import IndexPage from '../IndexPage'
import { AlurakutMenu, AlurakutProfileSidebarMenuDefault } from '../../lib/alurakutCommons'
import Box from '../Box'
import MainGrid from '../MainGrid'
import { useAppTheme } from '../../lib/ThemeContext'

export function ProfileSidebar({ githubUser }) {
  return (
    <Box as="aside">
      <img src={`https://github.com/${githubUser}.png`} alt="Foto do usuario" style={{ borderRadius: '8px' }} />
      <hr />
      <p>
        <a className="boxLink" href={`/profile/${githubUser}`} title="Nome do usuario">
          @{githubUser}
        </a>
      </p>
      <hr />
      <AlurakutProfileSidebarMenuDefault githubUser={githubUser} />
    </Box>
  )
}

export default function Layout({ githubUser, children, right, hideSidebar }) {
  const { theme } = useAppTheme()
  return (
    <>
      <IndexPage />
      <AlurakutMenu githubUser={githubUser} />
      <MainGrid>
        {!hideSidebar && (
          <div className="profileArea" style={{ gridArea: 'profileArea' }}>
            <ProfileSidebar githubUser={githubUser} />
          </div>
        )}
        <div className="welcomeArea" style={{ gridArea: 'welcomeArea', background: 'transparent' }}>
          {children}
        </div>
        <div className="profileRelationsArea" style={{ gridArea: 'profileRelationsArea' }}>
          {right}
        </div>
      </MainGrid>
      <style jsx global>{`
        body {
          background: ${theme.bodyBg} !important;
          color: ${theme.text};
        }
      `}</style>
    </>
  )
}
