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
    whoAmI: '',
    lookingFor: '',
    interests: '',
    movies: '',
    music: '',
    books: '',
    kids: '',
    smoking: '',
    drinking: '',
    privacy: 'public',
  })
  const [blocked, setBlocked] = React.useState([])
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
        whoAmI: res.data.whoAmI || '',
        lookingFor: res.data.lookingFor || '',
        interests: res.data.interests || '',
        movies: res.data.movies || '',
        music: res.data.music || '',
        books: res.data.books || '',
        kids: res.data.kids || '',
        smoking: res.data.smoking || '',
        drinking: res.data.drinking || '',
        privacy: res.data.privacy || 'public',
      })
    })
    fetch('/api/block').then((r) => r.json()).then((res) => setBlocked(res.data || []))
  }, [props.githubUser])

  return (
    <Layout githubUser={props.githubUser}>
      <Box>
        <h1 className="title">Configuracoes do seu perfil</h1>
        <p>So o GitHub verificado nesta sessao pode alterar estes dados. Humor e status aparecem no inicio e no mural.</p>
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
          <label>Quem eu sou</label>
          <input value={form.whoAmI} onChange={(e) => setForm({ ...form, whoAmI: e.target.value })} placeholder="Uma frase sobre voce" />
          <label>O que estou procurando</label>
          <input value={form.lookingFor} onChange={(e) => setForm({ ...form, lookingFor: e.target.value })} placeholder="Amizade, namoro, networking..." />
          <label>Interesses</label>
          <input value={form.interests} onChange={(e) => setForm({ ...form, interests: e.target.value })} />
          <label>Filmes</label>
          <input value={form.movies} onChange={(e) => setForm({ ...form, movies: e.target.value })} />
          <label>Musicas</label>
          <input value={form.music} onChange={(e) => setForm({ ...form, music: e.target.value })} />
          <label>Livros</label>
          <input value={form.books} onChange={(e) => setForm({ ...form, books: e.target.value })} />
          <label>Filhos</label>
          <input value={form.kids} onChange={(e) => setForm({ ...form, kids: e.target.value })} />
          <label>Fumo</label>
          <input value={form.smoking} onChange={(e) => setForm({ ...form, smoking: e.target.value })} />
          <label>Bebo</label>
          <input value={form.drinking} onChange={(e) => setForm({ ...form, drinking: e.target.value })} />
          <label>Privacidade do perfil</label>
          <select value={form.privacy} onChange={(e) => setForm({ ...form, privacy: e.target.value })}>
            <option value="public">Publico</option>
            <option value="friends">So amigos</option>
          </select>
          <button type="submit" style={{ marginTop: 12 }}>Salvar</button>
          {saved && <p style={{ marginTop: 8 }}>Perfil atualizado.</p>}
        </form>
      </Box>
      <Box>
        <h2 className="subTitle">Bloqueados</h2>
        {blocked.length === 0 && <p>Ninguem bloqueado.</p>}
        {blocked.map((b) => (
          <p key={b.id}>
            {b.blockedId}
            <button type="button" style={{ marginLeft: 8 }} onClick={() => fetch('/api/block', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ blockedId: b.blockedId }) }).then(() => setBlocked(blocked.filter((item) => item.id !== b.id)))}>Desbloquear</button>
          </p>
        ))}
      </Box>
    </Layout>
  )
}

export async function getServerSideProps(context) {
  return withAuth(context)
}
