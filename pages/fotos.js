import React from 'react'
import { useRouter } from 'next/router'
import { withAuth } from '../src/lib/auth'
import Layout from '../src/components/Layout'
import Box from '../src/components/Box'

export default function FotosPage(props) {
  const router = useRouter()
  const owner = router.query.user || props.githubUser
  const [albums, setAlbums] = React.useState([])
  const [title, setTitle] = React.useState('')
  const [imageUrl, setImageUrl] = React.useState('')
  const [caption, setCaption] = React.useState('')
  const [albumId, setAlbumId] = React.useState('')

  const load = () => {
    fetch(`/api/albums?ownerId=${owner}`).then((r) => r.json()).then((res) => {
      const data = res.data || []
      setAlbums(data)
      if (data[0] && !albumId) setAlbumId(data[0].id)
    })
  }

  React.useEffect(() => { load() }, [owner])

  return (
    <Layout githubUser={props.githubUser}>
      <Box>
        <h1 className="title">Albuns de {owner}</h1>
        {owner === props.githubUser && (
          <>
            <form onSubmit={(e) => {
              e.preventDefault()
              fetch('/api/albums', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ type: 'album', title }),
              }).then(() => { setTitle(''); load() })
            }}>
              <input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Nome do album" required />
              <button type="submit">Criar album</button>
            </form>
            <form onSubmit={(e) => {
              e.preventDefault()
              fetch('/api/albums', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ type: 'photo', albumId, imageUrl, caption }),
              }).then(() => { setImageUrl(''); setCaption(''); load() })
            }} style={{ marginTop: 16 }}>
              <select value={albumId} onChange={(e) => setAlbumId(e.target.value)}>
                {albums.map((a) => <option key={a.id} value={a.id}>{a.title}</option>)}
              </select>
              <input value={imageUrl} onChange={(e) => setImageUrl(e.target.value)} placeholder="URL da foto" required />
              <input value={caption} onChange={(e) => setCaption(e.target.value)} placeholder="Legenda" />
              <button type="submit">Adicionar foto</button>
            </form>
          </>
        )}
        {albums.map((album) => (
          <div key={album.id} style={{ marginTop: 24 }}>
            <h2 className="subTitle">{album.title} ({album.count})</h2>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 8 }}>
              {(album.photos || []).map((p) => (
                <div key={p.id}>
                  <img src={p.imageUrl} alt={p.caption || album.title} style={{ width: '100%', height: 120, objectFit: 'cover', borderRadius: 8 }} />
                  {p.caption && <small>{p.caption}</small>}
                </div>
              ))}
            </div>
          </div>
        ))}
        {albums.length === 0 && <p>Nenhum album ainda.</p>}
      </Box>
    </Layout>
  )
}

export async function getServerSideProps(context) {
  return withAuth(context)
}
