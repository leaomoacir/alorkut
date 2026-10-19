import React from 'react'
import { withAuth } from '../src/lib/auth'
import Layout from '../src/components/Layout'
import Box from '../src/components/Box'

function embedUrl(url) {
  const yt = String(url).match(/(?:youtu\.be\/|v=)([\w-]{6,})/)
  if (yt) return `https://www.youtube.com/embed/${yt[1]}`
  return url
}

export default function VideosPage(props) {
  const [videos, setVideos] = React.useState([])
  const [title, setTitle] = React.useState('')
  const [url, setUrl] = React.useState('')
  const load = () => fetch('/api/videos').then((r) => r.json()).then((res) => setVideos(res.data || []))
  React.useEffect(() => { load() }, [])

  return (
    <Layout githubUser={props.githubUser}>
      <Box>
        <h1 className="title">Videos</h1>
        <p>Compartilhe um clip do YouTube no estilo Orkut Videos.</p>
        <form onSubmit={(e) => {
          e.preventDefault()
          fetch('/api/videos', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ title, url }),
          }).then(() => { setTitle(''); setUrl(''); load() })
        }}>
          <input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Titulo" required />
          <input value={url} onChange={(e) => setUrl(e.target.value)} placeholder="URL do YouTube" required />
          <button type="submit">Publicar video</button>
        </form>
      </Box>
      {videos.length === 0 && (
        <Box>
          <p>Nenhum video ainda. Cole uma URL do YouTube acima.</p>
        </Box>
      )}
      {videos.map((v) => (
        <Box key={v.id}>
          <h2 className="subTitle">{v.title} por {v.ownerId}</h2>
          <iframe title={v.title} src={embedUrl(v.url)} width="100%" height="240" style={{ border: 0, borderRadius: 8 }} allow="accelerometer; autoplay; encrypted-media; gyroscope; picture-in-picture" allowFullScreen />
        </Box>
      ))}
    </Layout>
  )
}

export async function getServerSideProps(context) {
  return withAuth(context)
}
