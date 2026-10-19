import React from 'react'
import { withAuth } from '../src/lib/auth'
import Layout from '../src/components/Layout'
import Box from '../src/components/Box'
import { THEME_LIST } from '../src/lib/themes'
import { useAppTheme } from '../src/lib/ThemeContext'

export default function ConfiguracoesPage(props) {
  const { setThemeId } = useAppTheme()
  const [form, setForm] = React.useState({
    displayName: props.githubUser,
    bio: '',
    location: '',
    relationship: 'Solteiro(a)',
    birthday: '',
    theme: 'classic',
    profileColor: '#D9E6F6',
    mood: 'feliz',
    statusText: '',
  })
  const [saved, setSaved] = React.useState(false)

  React.useEffect(() => {
    fetch('/api/settings').then((r) => r.json()).then((res) => {
      if (res.data) setForm({
        displayName: res.data.displayName || props.githubUser,
        bio: res.data.bio || '',
        location: res.data.location || '',
        relationship: res.data.relationship || 'Solteiro(a)',
        birthday: res.data.birthday || '',
        theme: res.data.theme || 'classic',
        profileColor: res.data.profileColor || '#D9E6F6',
        mood: res.data.mood || 'feliz',
        statusText: res.data.statusText || '',
      })
    })
  }, [props.githubUser])

  return (
    <Layout githubUser={props.githubUser}>
      <Box>
        <h1 className="title">Configuracoes do seu perfil</h1>
        <p>So o GitHub verificado nesta sessao pode alterar estes dados.</p>
        <form onSubmit={(e) => {
          e.preventDefault()
          fetch('/api/settings', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(form),
          }).then(() => {
            setThemeId(form.theme)
            setSaved(true)
          })
        }}>
          <label>Nome</label>
          <input value={form.displayName} onChange={(e) => setForm({ ...form, displayName: e.target.value })} />
          <label>Quem sou eu</label>
          <input value={form.bio} onChange={(e) => setForm({ ...form, bio: e.target.value })} />
          <label>Cidade</label>
          <input value={form.location} onChange={(e) => setForm({ ...form, location: e.target.value })} />
          <label>Humor</label>
          <select value={form.mood} onChange={(e) => setForm({ ...form, mood: e.target.value })}>
            <option value="feliz">feliz</option>
            <option value="animado">animado</option>
            <option value="ocupado">ocupado</option>
            <option value="com saudade">com saudade</option>
            <option value="no dark">no dark</option>
          </select>
          <label>Status</label>
          <input value={form.statusText} onChange={(e) => setForm({ ...form, statusText: e.target.value })} placeholder="O que voce esta fazendo?" />
          <label>Relacionamento</label>
          <select value={form.relationship} onChange={(e) => setForm({ ...form, relationship: e.target.value })}>
            <option>Solteiro(a)</option>
            <option>Namorando</option>
            <option>Casado(a)</option>
            <option>E complicado</option>
          </select>
          <label>Aniversario</label>
          <input value={form.birthday} onChange={(e) => setForm({ ...form, birthday: e.target.value })} placeholder="dd/mm" />
          <label>Tema</label>
          <select value={form.theme} onChange={(e) => setForm({ ...form, theme: e.target.value })}>
            {THEME_LIST.map((t) => <option key={t.id} value={t.id}>{t.name}</option>)}
          </select>
          <label>Cor do mural</label>
          <input type="color" value={form.profileColor} onChange={(e) => setForm({ ...form, profileColor: e.target.value })} />
          <button type="submit" style={{ marginTop: 12 }}>Salvar</button>
          {saved && <p style={{ marginTop: 8 }}>Perfil atualizado.</p>}
        </form>
      </Box>
    </Layout>
  )
}

export async function getServerSideProps(context) {
  return withAuth(context)
}
