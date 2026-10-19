import React from 'react'
import styled, { css } from 'styled-components'
import NextLink from 'next/link'
import { useRouter } from 'next/router'
import { useAppTheme } from './ThemeContext'
import { THEME_LIST } from './themes'

const BASE_URL = 'https://alurakut.vercel.app/'
const v = '1'

function Link({ href, children, ...props }) {
  return (
    <NextLink href={href} passHref>
      <a {...props}>
        {children}
      </a>
    </NextLink>
  )
}

export function AlurakutMenu({ githubUser }) {
  const router = useRouter()
  const { theme, themeId, setThemeId } = useAppTheme()
  const [isMenuOpen, setMenuState] = React.useState(false)
  const [query, setQuery] = React.useState('')
  const [notifications, setNotifications] = React.useState([])
  const [unread, setUnread] = React.useState(0)
  const [openBell, setOpenBell] = React.useState(false)

  React.useEffect(() => {
    if (!githubUser) return undefined
    let active = true
    const load = () => {
      fetch(`/api/notifications?userId=${githubUser}`)
        .then((r) => r.json())
        .then((res) => {
          if (!active) return
          setNotifications(res.data?.items || [])
          setUnread(res.data?.unread || 0)
        })
        .catch(() => {})
    }
    load()
    const timer = setInterval(load, 15000)
    return () => {
      active = false
      clearInterval(timer)
    }
  }, [githubUser])

  const markRead = () => {
    fetch('/api/notifications', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userId: githubUser }),
    }).then(() => {
      setUnread(0)
      setNotifications((prev) => prev.map((n) => ({ ...n, read: true })))
    })
  }

  return (
    <AlurakutMenu.Wrapper isMenuOpen={isMenuOpen} theme={theme}>
      <div className="container">
        <AlurakutMenu.Logo src={`${BASE_URL}/logo.svg`} alt="Logo Orkut" />
        <nav style={{ flex: 1 }}>
          {[
            { name: 'Inicio', slug: '/' },
            { name: 'Amigos', slug: '/amigos' },
            { name: 'Comunidades', slug: '/comunidades' },
            { name: 'Recados', slug: '/mensagens' },
            { name: 'Apps', slug: '/apps' },
          ].map((menuItem) => (
            <Link key={`key__${menuItem.name}`} href={menuItem.slug}>
              {menuItem.name}
            </Link>
          ))}
        </nav>
        <nav>
          <div className="bellWrap">
            <button type="button" className="bell" onClick={() => { setOpenBell(!openBell); if (!openBell) markRead() }}>
              Recados
              {unread > 0 && <span className="badge">{unread}</span>}
            </button>
            {openBell && (
              <div className="dropdown">
                {notifications.length === 0 && <p>Nenhuma notificacao ainda.</p>}
                {notifications.slice(0, 8).map((n) => (
                  <a key={n.id} href={n.link || '/'}>{n.message}</a>
                ))}
              </div>
            )}
          </div>
          <form onSubmit={(e) => {
            e.preventDefault()
            if (!query.trim()) return
            router.push(`/busca?q=${encodeURIComponent(query.trim())}`)
          }}>
            <input
              placeholder="Pesquisar no Orkut"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
            />
          </form>
          <select value={themeId} onChange={(e) => {
            setThemeId(e.target.value)
            fetch('/api/settings', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ theme: e.target.value }),
            })
          }}>
            {THEME_LIST.map((t) => (
              <option key={t.id} value={t.id}>{t.name}</option>
            ))}
          </select>
          <a href="/" onClick={(e) => {
            e.preventDefault()
            fetch('/api/logout', { method: 'POST' }).finally(() => router.push('/login'))
          }}>
            Sair
          </a>
        </nav>
        <button type="button" title="Menu" onClick={() => setMenuState(!isMenuOpen)}>
          {isMenuOpen && <img src={`${BASE_URL}/icons/menu-open.svg?v=${v}`} alt="Fechar menu" />}
          {!isMenuOpen && <img src={`${BASE_URL}/icons/menu-closed.svg?v=${v}`} alt="Abrir menu" />}
        </button>
      </div>
      <AlurakutMenuProfileSidebar githubUser={githubUser} />
    </AlurakutMenu.Wrapper>
  )
}
AlurakutMenu.Wrapper = styled.header`
  width: 100%;
  background-color: ${({ theme }) => theme.headerBg};
  position: fixed;
  z-index: 150;
  .alurakutMenuProfileSidebar {
    background: ${({ theme }) => theme.boxBg};
    position: fixed;
    z-index: 100;
    padding: 46px;
    bottom: 0;
    left: 0;
    right: 0;
    top: 48px;
    transition: .3s;
    pointer-events: ${({ isMenuOpen }) => isMenuOpen ? 'all' : 'none'};
    opacity: ${({ isMenuOpen }) => isMenuOpen ? '1' : '0'};
    transform: ${({ isMenuOpen }) => isMenuOpen ? 'translateY(0)' : 'translateY(calc(-100% - 48px))'};
    @media(min-width: 860px) {
      display: none;
    }
  }
  .container {
    background-color: ${({ theme }) => theme.headerNav};
    padding: 7px 16px;
    max-width: 1110px;
    margin: auto;
    display: flex;
    justify-content: space-between;
    position: relative;
    z-index: 101;
    @media(min-width: 860px) {
      justify-content: flex-start;
    }
    button {
      cursor: pointer;
      border: 0;
      background: transparent;
      align-self: center;
      display: inline-block;
      @media(min-width: 860px) {
        display: none;
      }
    }
    nav {
      display: none;
      align-items: center;
      gap: 8px;
      @media(min-width: 860px) {
        display: flex;
        padding-left: 5px;
      }
      a {
        font-size: 12px;
        color: white;
        padding: 10px 10px;
        position: relative;
        text-decoration: none;
      }
    }
    input {
      color: #ffffff;
      background: rgba(255,255,255,0.18);
      padding: 8px 36px 8px 12px;
      border: 0;
      border-radius: 1000px;
      font-size: 12px;
      width: 170px;
    }
    select {
      background: rgba(255,255,255,0.18);
      color: #fff;
      border: 0;
      border-radius: 8px;
      padding: 6px;
      font-size: 11px;
    }
    .bellWrap {
      position: relative;
    }
    .bell {
      display: inline-flex !important;
      color: #fff;
      font-size: 12px;
      position: relative;
    }
    .badge {
      background: #D81D99;
      color: #fff;
      border-radius: 99px;
      font-size: 10px;
      padding: 1px 6px;
      margin-left: 4px;
    }
    .dropdown {
      position: absolute;
      right: 0;
      top: 36px;
      width: 280px;
      background: #fff;
      color: #333;
      border-radius: 8px;
      box-shadow: 0 8px 24px rgba(0,0,0,.15);
      padding: 8px;
      z-index: 200;
      a, p {
        display: block;
        color: #333 !important;
        padding: 8px;
        font-size: 12px;
        text-decoration: none;
      }
    }
  }
`
AlurakutMenu.Logo = styled.img`
  background-color: #ffffff;
  padding: 9px 14px;
  border-radius: 1000px;
  height: 34px;
`

function AlurakutMenuProfileSidebar({ githubUser }) {
  return (
    <div className="alurakutMenuProfileSidebar">
      <div>
        <img src={`https://github.com/${githubUser}.png`} alt="Foto do Usuario" style={{ width: '50%', margin: '0 auto', borderRadius: '8px' }} />
        <hr />
        <p>
          <a className="boxLink" href={`/profile/${githubUser}`}>
            @{githubUser}
          </a>
        </p>
        <hr />
        <AlurakutProfileSidebarMenuDefault githubUser={githubUser} />
      </div>
    </div>
  )
}

export function AlurakutProfileSidebarMenuDefault({ githubUser }) {
  const router = useRouter()
  return (
    <AlurakutProfileSidebarMenuDefault.Wrapper>
      <nav>
        <a href={`/profile/${githubUser || ''}`}>
          <img src={`${BASE_URL}/icons/user.svg`} alt="Icone Perfil" />
          Perfil
        </a>
        <a href="/amigos">
          <img src={`${BASE_URL}/icons/book.svg`} alt="Icone Recados" />
          Amigos
        </a>
        <a href="/fotos">
          <img src={`${BASE_URL}/icons/camera.svg`} alt="Icone Fotos" />
          Fotos
        </a>
        <a href="/comunidades">
          <img src={`${BASE_URL}/icons/sun.svg`} alt="Icone Comunidades" />
          Comunidades
        </a>
        <a href="/mensagens">
          <img src={`${BASE_URL}/icons/email.svg`} alt="Icone Mensagens" />
          Mensagens
        </a>
        <a href="/apps">
          <img src={`${BASE_URL}/icons/plus.svg`} alt="Icone Apps" />
          Apps
        </a>
        <a href="/configuracoes">
          <img src={`${BASE_URL}/icons/user.svg`} alt="Icone Config" />
          Configuracoes
        </a>
      </nav>
      <hr />
      <nav>
        <a href="/" onClick={(e) => {
          e.preventDefault()
          fetch('/api/logout', { method: 'POST' }).finally(() => router.push('/login'))
        }}>
          <img src={`${BASE_URL}/icons/logout.svg`} alt="Icone Sair" />
          Sair
        </a>
      </nav>
    </AlurakutProfileSidebarMenuDefault.Wrapper>
  )
}
AlurakutProfileSidebarMenuDefault.Wrapper = styled.div`
  a {
    font-size: 12px;
    color: #2E7BB4;
    margin-bottom: 16px;
    display: flex;
    align-items: center;
    justify-content: flex-start;
    text-decoration: none;
    img {
      width: 16px;
      height: 16px;
      margin-right: 5px;
    }
  }
`

export function OrkutNostalgicIconSet(props) {
  return (
    <OrkutNostalgicIconSet.List>
      {[
        { name: 'Recados', slug: 'recados', icon: 'book' },
        { name: 'Fotos', slug: 'fotos', icon: 'camera' },
        { name: 'Videos', slug: 'videos', icon: 'video-camera' },
        { name: 'Fas', slug: 'fas', icon: 'star' },
        { name: 'Mensagens', slug: 'mensagens', icon: 'email' },
      ].map(({ name, slug, icon }) => (
        <li key={`orkut__icon_set__${slug}`}>
          <span style={{ gridArea: 'title' }} className="OrkutNostalgicIconSet__title">
            {name}
          </span>
          <span className="OrkutNostalgicIconSet__number" style={{ gridArea: 'number' }}>
            <img className="OrkutNostalgicIconSet__iconSample" src={`https://alurakut.vercel.app/icons/${icon}.svg`} alt="Icones" />
            {props[slug] ? props[slug] : 0}
          </span>
        </li>
      ))}
      {[
        { name: 'Confiavel', slug: 'confiavel', icon: 'smile' },
        { name: 'Legal', slug: 'legal', icon: 'cool' },
        { name: 'Sexy', slug: 'sexy', icon: 'heart' },
      ].map(({ name, slug, icon }) => {
        const total = props[slug] ? props[slug] : 2
        return (
          <li key={`orkut__icon_set__${slug}`}>
            <span className="OrkutNostalgicIconSet__title">{name}</span>
            <span className="OrkutNostalgicIconSet__number" style={{ gridArea: 'number' }}>
              {[0, 1, 2].map((_, index) => {
                const isHeartActive = index <= (total - 1)
                return <img key={`orkut__icon_set__${slug}_img_${index}`} src={`https://alurakut.vercel.app/icons/${icon}.svg`} style={{ marginRight: '2px', opacity: isHeartActive ? 1 : '0.5' }} alt="Icones" />
              })}
            </span>
          </li>
        )
      })}
    </OrkutNostalgicIconSet.List>
  )
}
OrkutNostalgicIconSet.List = styled.ul`
  margin-top: 24px;
  list-style: none;
  display: flex;
  justify-content: space-between;
  flex-wrap: wrap;
  li {
    font-size: 12px;
    color: #5A5A5A;
    display: grid;
    grid-template-areas:
      "title title"
      "number number";
    &:not(:last-child) {
      margin-right: 5px;
    }
    .OrkutNostalgicIconSet__title {
      display: block;
      font-style: italic;
    }
    .OrkutNostalgicIconSet__number {
      min-width: 15px;
      display: flex;
      align-items: center;
      justify-content: flex-start;
      .OrkutNostalgicIconSet__iconSample {
        margin-right: 7px;
      }
    }
  }
`

const AlurakutLoginScreen = css`
  :root {
    --backgroundPrimary: #D9E6F6;
    --backgroundSecondary: #F1F9FE;
    --backgroundTertiary: #FFFFFF;
    --backgroundQuarternary: #BBCDE8;
    --colorPrimary: #2E7BB4;
    --colorSecondary: #388BB0;
    --colorTertiary: #2F4A71;
    --colorQuarternary: #D81D99;
    --textPrimaryColor: #333333;
    --textSecondaryColor: #FFFFFF;
    --textTertiaryColor: #5A5A5A;
    --textQuarternaryColor: #C5C6CA;
    --commonRadius: 8px;
  }
  .loginScreen {
    padding: 16px;
    max-width: 1110px;
    display: grid;
    --gap: 12px;
    --gutter: 16px;
    grid-gap: var(--gap);
    grid-template-areas:
      "logoArea"
      "formArea"
      "footerArea";
    @media(min-width: 860px) {
      grid-template-columns: 2fr 1fr;
      grid-template-areas:
        "logoArea formArea"
        "logoArea formArea"
        "footerArea footerArea";
    }
    .logoArea {
      grid-area: logoArea;
      background-color: var(--backgroundTertiary);
      border-radius: var(--commonRadius);
      padding: var(--gutter);
      text-align: center;
      display: flex;
      flex-direction: column;
      justify-content: center;
      align-items: center;
      min-height: 263px;
    }
    .formArea {
      grid-area: formArea;
      display: flex;
      flex-direction: column;
      .box {
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        text-align: center;
        padding: var(--gutter);
        background-color: var(--backgroundSecondary);
        border-radius: var(--commonRadius);
        flex: 1;
        &:not(:last-child) {
          margin-bottom: var(--gap);
        }
      }
    }
    .footerArea {
      grid-area: footerArea;
      background-color: var(--backgroundQuarternary);
      border-radius: var(--commonRadius);
      padding: 8px;
    }
  }
`

export const AlurakutStyles = css`
  *::-webkit-scrollbar {
    width: 8px;
  }
  *::-webkit-scrollbar-track {
    background: #f1f1f1;
  }
  *::-webkit-scrollbar-thumb {
    background: #888;
    border-radius: 10px;
  }
  a, button {
    cursor: pointer;
    transition: .3s;
    outline: 0;
  }
  ${AlurakutLoginScreen}
`
