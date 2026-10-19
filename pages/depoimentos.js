import React from 'react'
import { withAuth } from '../src/lib/auth'
import Layout from '../src/components/Layout'
import Box from '../src/components/Box'

export default function DepoimentosPage(props) {
  const [items, setItems] = React.useState([])
  const load = () => fetch(`/api/testimonials?receiverId=${props.githubUser}`).then((r) => r.json()).then((res) => setItems(res.data || []))
  React.useEffect(() => { load() }, [props.githubUser])
  return (
    <Layout githubUser={props.githubUser}>
      <Box>
        <h1 className="title">Depoimentos</h1>
        <p>Aprove ou recuse o que a galera escreveu sobre voce. So o que voce aprovar vai para o mural publico.</p>
        {items.length === 0 && <p>Nenhum depoimento ainda.</p>}
        {items.map((t) => (
          <div key={t.id} style={{ background: '#f4f4f4', padding: 12, borderRadius: 8, marginBottom: 12 }}>
            <strong><a href={`/profile/${t.senderId}`}>{t.senderId}</a></strong>
            <p>"{t.text}"</p>
            {!t.isPublic && (
              <div>
                <button type="button" onClick={() => fetch('/api/testimonials', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ action: 'approve', id: t.id }) }).then(load)}>Aprovar</button>
                <button type="button" style={{ marginLeft: 8, background: '#eee', color: '#333' }} onClick={() => fetch('/api/testimonials', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ action: 'hide', id: t.id }) }).then(load)}>Recusar</button>
              </div>
            )}
            {t.isPublic && <small>Publico no seu mural</small>}
          </div>
        ))}
      </Box>
    </Layout>
  )
}

export async function getServerSideProps(context) {
  return withAuth(context)
}
