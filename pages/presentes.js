import React from 'react'
import { withAuth } from '../src/lib/auth'
import Layout from '../src/components/Layout'
import Box from '../src/components/Box'
import { GIFT_CATALOG, giftMeta } from '../src/lib/gifts'

export default function PresentesPage(props) {
  const [gifts, setGifts] = React.useState([])
  const [sent, setSent] = React.useState([])
  const [receiverId, setReceiverId] = React.useState('')
  const [giftType, setGiftType] = React.useState('coracao')
  const [message, setMessage] = React.useState('')
  const [status, setStatus] = React.useState('')

  const load = () => {
    fetch(`/api/gifts?userId=${props.githubUser}`).then((r) => r.json()).then((res) => setGifts(res.data || []))
    fetch('/api/gifts?sent=1').then((r) => r.json()).then((res) => setSent(res.data || []))
  }
  React.useEffect(() => { load() }, [])

  return (
    <Layout githubUser={props.githubUser}>
      <Box>
        <h1 className="title">Presentes virtuais</h1>
        <p>Mande um mimo no estilo Orkut. O presente aparece no mural da pessoa.</p>
        <form onSubmit={(e) => {
          e.preventDefault()
          fetch('/api/gifts', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ receiverId, giftType, message }),
          }).then(async (r) => {
            const data = await r.json()
            if (!r.ok) {
              setStatus(data.error || 'Nao foi possivel enviar')
              return
            }
            setReceiverId('')
            setMessage('')
            setStatus('Presente enviado!')
            load()
          })
        }}>
          <input value={receiverId} onChange={(e) => setReceiverId(e.target.value)} placeholder="Para quem? (usuario GitHub)" required />
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 8, margin: '12px 0' }}>
            {GIFT_CATALOG.map((g) => (
              <button
                key={g.id}
                type="button"
                onClick={() => setGiftType(g.id)}
                style={{
                  background: giftType === g.id ? g.color : '#f4f4f4',
                  color: giftType === g.id ? '#fff' : '#333',
                  border: 0,
                  borderRadius: 8,
                  padding: 12,
                }}
              >
                {g.label}
              </button>
            ))}
          </div>
          <input value={message} onChange={(e) => setMessage(e.target.value)} placeholder="Mensagem" />
          <button type="submit">Enviar presente</button>
          {status && <p style={{ marginTop: 8 }}>{status}</p>}
        </form>
      </Box>
      <Box>
        <h2 className="subTitle">Presentes recebidos</h2>
        {gifts.map((g) => {
          const meta = giftMeta(g.giftType)
          return (
            <p key={g.id}>
              <span style={{ background: meta.color, color: '#fff', padding: '2px 8px', borderRadius: 99, marginRight: 8 }}>{meta.label}</span>
              de <a href={`/profile/${g.senderId}`}>{g.senderId}</a>
              {g.message && ` - ${g.message}`}
            </p>
          )
        })}
        {gifts.length === 0 && <p>Nenhum presente ainda. Peca para um amigo te mandar um cafezinho.</p>}
      </Box>
      <Box>
        <h2 className="subTitle">Presentes que voce enviou</h2>
        {sent.map((g) => {
          const meta = giftMeta(g.giftType)
          return (
            <p key={g.id}>{meta.label} para <a href={`/profile/${g.receiverId}`}>{g.receiverId}</a></p>
          )
        })}
        {sent.length === 0 && <p>Voce ainda nao enviou presentes.</p>}
      </Box>
    </Layout>
  )
}

export async function getServerSideProps(context) {
  return withAuth(context)
}
