import prisma from '../../src/lib/prisma'
import { requireApiUser } from '../../src/lib/auth'
import { logActivity, notify } from '../../src/lib/social'

export default async function quizzesHandler(request, response) {
  if (request.method === 'GET') {
    const { ownerId, quizId } = request.query
    if (quizId) {
      const quiz = await prisma.quiz.findUnique({ where: { id: quizId } })
      const answers = await prisma.quizAnswer.findMany({
        where: { quizId },
        orderBy: { createdAt: 'desc' },
      })
      return response.status(200).json({ data: { quiz, answers } })
    }
    const quizzes = await prisma.quiz.findMany({
      where: ownerId ? { ownerId } : undefined,
      orderBy: { createdAt: 'desc' },
      take: 30,
    })
    return response.status(200).json({ data: quizzes })
  }

  if (request.method === 'POST') {
    const me = await requireApiUser(request, response)
    if (!me) return
    const { type, title, questions, quizId, answers } = request.body
    if (type === 'quiz') {
      if (!title || !questions) return response.status(400).json({ error: 'Missing fields' })
      const quiz = await prisma.quiz.create({
        data: {
          ownerId: me,
          title,
          questions: typeof questions === 'string' ? questions : JSON.stringify(questions),
        },
      })
      await logActivity({ actorId: me, type: 'quiz', targetId: quiz.id, targetName: title })
      return response.status(201).json({ data: quiz })
    }
    if (type === 'answer') {
      if (!quizId || !answers) return response.status(400).json({ error: 'Missing fields' })
      const quiz = await prisma.quiz.findUnique({ where: { id: quizId } })
      if (!quiz) return response.status(404).json({ error: 'Quiz not found' })
      const parsedQuestions = JSON.parse(quiz.questions)
      const parsedAnswers = Array.isArray(answers) ? answers : JSON.parse(answers)
      let score = 0
      parsedQuestions.forEach((q, i) => {
        if (String(parsedAnswers[i] || '').trim().toLowerCase() === String(q.answer || '').trim().toLowerCase()) {
          score += 1
        }
      })
      const saved = await prisma.quizAnswer.upsert({
        where: { quizId_userId: { quizId, userId: me } },
        update: { answers: JSON.stringify(parsedAnswers), score },
        create: { quizId, userId: me, answers: JSON.stringify(parsedAnswers), score },
      })
      await logActivity({
        actorId: me,
        type: 'quiz_answer',
        targetId: quiz.id,
        targetName: quiz.ownerId,
        extra: String(score),
      })
      await notify({
        userId: quiz.ownerId,
        actorId: me,
        type: 'quiz_answer',
        message: `${me} respondeu sua enquete "${quiz.title}" (${score}/${parsedQuestions.length})`,
        link: '/enquetes',
      })
      return response.status(201).json({ data: saved })
    }
    return response.status(400).json({ error: 'Invalid type' })
  }

  return response.status(405).json({ error: 'Method not allowed' })
}
