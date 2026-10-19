import React from 'react'
import { withAuth } from '../src/lib/auth'
import Layout from '../src/components/Layout'
import Box from '../src/components/Box'

const DEFAULT_QUESTIONS = [
  { q: 'Qual e o meu editor favorito?', answer: 'vscode' },
  { q: 'Gosto mais de frontend ou backend?', answer: 'frontend' },
  { q: 'Qual rede social nostálgica eu revivi?', answer: 'orkut' },
]

export default function EnquetesPage(props) {
  const githubUser = props.githubUser
  const [quizzes, setQuizzes] = React.useState([])
  const [title, setTitle] = React.useState('Quem me conhece melhor?')
  const [active, setActive] = React.useState(null)
  const [answers, setAnswers] = React.useState(['', '', ''])
  const [result, setResult] = React.useState(null)

  const load = () => {
    fetch('/api/quizzes').then((r) => r.json()).then((res) => setQuizzes(res.data || []))
  }
  React.useEffect(() => { load() }, [])

  const openQuiz = (quiz) => {
    fetch(`/api/quizzes?quizId=${quiz.id}`).then((r) => r.json()).then((res) => {
      setActive(res.data)
      setAnswers(['', '', ''])
      setResult(null)
    })
  }

  return (
    <Layout githubUser={githubUser}>
      <Box>
        <h1 className="title">Enquetes e quizzes</h1>
        <form onSubmit={(e) => {
          e.preventDefault()
          fetch('/api/quizzes', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ type: 'quiz', title, questions: DEFAULT_QUESTIONS }),
          }).then(() => { setTitle('Quem me conhece melhor?'); load() })
        }}>
          <input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Titulo da enquete" />
          <button type="submit">Criar quiz classico</button>
        </form>
      </Box>
      {!active && (
        <Box>
          <h2 className="subTitle">Todas as enquetes</h2>
          <ul style={{ listStyle: 'none' }}>
            {quizzes.map((q) => (
              <li key={q.id} style={{ padding: 12, background: '#f4f4f4', borderRadius: 8, marginBottom: 8, cursor: 'pointer' }} onClick={() => openQuiz(q)}>
                <strong>{q.title}</strong> por {q.ownerId}
              </li>
            ))}
          </ul>
        </Box>
      )}
      {active && active.quiz && (
        <Box>
          <button onClick={() => setActive(null)} style={{ background: 'transparent', border: 0, color: '#2E7BB4' }}>Voltar</button>
          <h2 className="subTitle">{active.quiz.title}</h2>
          {JSON.parse(active.quiz.questions).map((item, i) => (
            <div key={i} style={{ marginBottom: 12 }}>
              <p>{item.q}</p>
              <input value={answers[i] || ''} onChange={(e) => {
                const next = [...answers]
                next[i] = e.target.value
                setAnswers(next)
              }} />
            </div>
          ))}
          <button onClick={() => {
            fetch('/api/quizzes', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ type: 'answer', quizId: active.quiz.id, answers }),
            }).then((r) => r.json()).then((res) => setResult(res.data))
          }}>Enviar respostas</button>
          {result && <p style={{ marginTop: 12 }}>Voce acertou {result.score} pergunta(s)!</p>}
          <h3 style={{ marginTop: 16 }}>Quem ja respondeu</h3>
          {(active.answers || []).map((a) => (
            <p key={a.id}>{a.userId}: {a.score} pontos</p>
          ))}
        </Box>
      )}
    </Layout>
  )
}

export async function getServerSideProps(context) {
  return withAuth(context)
}
