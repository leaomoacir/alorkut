import React from 'react'
import { withAuth } from '../src/lib/auth'
import Layout from '../src/components/Layout'
import Box from '../src/components/Box'

const GIFTS = ['coracao', 'estrela', 'cafe', 'flor', 'trofeu', 'pizza']

export default function PresentesPage(props) {
  const [gifts, setGifts] = React.useState([])
  const [receiverId, setReceiverId] = React.useState('')
  const [giftType, setGiftType] = React.useState('coracao')
  const [message, setMessage] = React.useState('')
  const load = () => fetch(`/api/gifts?userId=${props.githubUser}`).then((r) => r.json()).then((res) => setGifts(res.data || []))
  React.useEffect(() => { load() }, [])

  return (
    <Layout githubUser={props.githubUser}>
      <Box>
        <h1 className="title">Presentes</h1>
        <form onSubmit={(e) => {
          e.preventDefault()
          fetch('/api/gifts', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ receiverId, giftType, message }),
          }).then(() => { setReceiverId(''); setMessage(''); load() })
        }}>
          <input value={receiverId} onChange={(e) => setReceiverId(e.target.value)} placeholder="Para quem?" required />
          <select value={giftType} onChange={(e) => setGiftType(e.target.value)}>
            {GIFTS.map((g) => <option key={g} value={g}>{g}</option>)}
          </select>
          <input value={message} onChange={(e) => setMessage(e.target.value)} placeholder="Mensagem" />
          <button type="submit">Enviar presente</button>
        </form>
      </Box>
      <Box>
        <h2 className="subTitle">Presentes recebidos</h2>
        {gifts.map((g) => (
          <p key={g.id}>{g.giftType} de <a href={`/profile/${g.senderId}`}>{g.senderId}</a> {g.message && `- ${g.message}`}</p>
        ))}
        {gifts.length === 0 && <p>Nenhum presente ainda.</p>}
      </Box>
    </Layout>
  )
}

export async function getServerSideProps(context) {
  return withAuth(context)
}
