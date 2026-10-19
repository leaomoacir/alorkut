import React from 'react'
import { withAuth } from '../src/lib/auth'
import Layout from '../src/components/Layout'
import Box from '../src/components/Box'

export default function EventosPage(props) {
  const [events, setEvents] = React.useState([])
  const [form, setForm] = React.useState({ title: '', description: '', place: '', happensAt: '' })
  const load = () => fetch('/api/events').then((r) => r.json()).then((res) => setEvents(res.data || []))
  React.useEffect(() => { load() }, [])

  return (
    <Layout githubUser={props.githubUser}>
      <Box>
        <h1 className="title">Eventos</h1>
        <form onSubmit={(e) => {
          e.preventDefault()
          fetch('/api/events', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(form),
          }).then(() => { setForm({ title: '', description: '', place: '', happensAt: '' }); load() })
        }}>
          <input value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} placeholder="Titulo" required />
          <input value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} placeholder="Descricao" />
          <input value={form.place} onChange={(e) => setForm({ ...form, place: e.target.value })} placeholder="Local" />
          <input value={form.happensAt} onChange={(e) => setForm({ ...form, happensAt: e.target.value })} placeholder="Quando? ex: 20/10 19h" required />
          <button type="submit">Criar evento</button>
        </form>
      </Box>
      {events.map((event) => (
        <Box key={event.id}>
          <h2 className="subTitle">{event.title}</h2>
          <p>{event.description}</p>
          <p>{event.place} | {event.happensAt} | {event.going} confirmados</p>
          <button onClick={() => fetch('/api/events', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ action: 'rsvp', eventId: event.id, status: 'yes' }),
          }).then(load)}>Eu vou</button>
        </Box>
      ))}
    </Layout>
  )
}

export async function getServerSideProps(context) {
  return withAuth(context)
}
