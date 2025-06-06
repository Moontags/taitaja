'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useRouter, useSearchParams } from 'next/navigation'
import { supabase, Question } from '@/lib/supabase'
import styles from './page.module.css'

type GameState = {
  currentQuestionIndex: number
  score: number
  selectedAnswer: string | null
  showFeedback: boolean
  gameCompleted: boolean
  questions: Question[]
}

export default function GamePlay() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [gameState, setGameState] = useState<GameState>({
    currentQuestionIndex: 0,
    score: 0,
    selectedAnswer: null,
    showFeedback: false,
    gameCompleted: false,
    questions: []
  })
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  const teacherId = searchParams.get('teacher')
  const categoryId = searchParams.get('category')
  const questionCount = parseInt(searchParams.get('count') || '5')

  useEffect(() => {
    const fetchQuestions = async () => {
      try {
        setLoading(true)
        const { data, error } = await supabase
          .from('questions')
          .select('*')
          .eq('category_id', categoryId)
          .eq('teacher_id', teacherId)
          .limit(questionCount * 2) // Fetch more than needed to ensure variety

        if (error) throw error
        
        if (!data || data.length === 0) {
          setError('Ei kysymyksiä saatavilla tälle kategorialle')
          return
        }

        // Shuffle and limit to requested count
        const shuffled = data.sort(() => 0.5 - Math.random())
        const selected = shuffled.slice(0, Math.min(questionCount, data.length))

        setGameState(prev => ({
          ...prev,
          questions: selected
        }))
      } catch (error) {
        console.error('Error fetching questions:', error)
        setError('Virhe kysymysten haussa')
      } finally {
        setLoading(false)
      }
    }

    if (!teacherId || !categoryId) {
      router.push('/game')
      return
    }
    
    fetchQuestions()
  }, [teacherId, categoryId, questionCount, router])

  const handleAnswerSelect = (answer: string) => {
    if (gameState.showFeedback) return
    
    setGameState(prev => ({
      ...prev,
      selectedAnswer: answer
    }))
  }

  const handleSubmitAnswer = () => {
    if (!gameState.selectedAnswer) return

    const currentQuestion = gameState.questions[gameState.currentQuestionIndex]
    const isCorrect = gameState.selectedAnswer === currentQuestion.correct_option

    setGameState(prev => ({
      ...prev,
      showFeedback: true,
      score: isCorrect ? prev.score + 1 : prev.score
    }))
  }

  const handleNextQuestion = () => {
    const nextIndex = gameState.currentQuestionIndex + 1
    
    if (nextIndex >= gameState.questions.length) {
      // Game completed
      setGameState(prev => ({
        ...prev,
        gameCompleted: true
      }))
    } else {
      // Move to next question
      setGameState(prev => ({
        ...prev,
        currentQuestionIndex: nextIndex,
        selectedAnswer: null,
        showFeedback: false
      }))
    }
  }

  const handlePlayAgain = () => {
    router.push('/game')
  }

  const handleViewScores = () => {
    const params = new URLSearchParams({
      score: gameState.score.toString(),
      total: gameState.questions.length.toString(),
      category: categoryId || ''
    })
    router.push(`/game/results?${params.toString()}`)
  }

  if (loading) {
    return (
      <div className={styles.layout}>
        <header className={styles.header}>
          <Link href="/" className={styles.logo}>TAITAJA TIETOTESTI</Link>
          <Link href="/login" className={styles.loginLink}>
            Kirjaudu sisään
          </Link>
        </header>
        <main className={styles.main}>
          <div className={styles.loading}>
            Ladataan kysymyksiä...
          </div>
        </main>
        <footer className={styles.footer}>
          <div>
            Taitaja2025 -semifinaali<br />
            Jari Peltola | Salon seudun ammattiopisto
          </div>
        </footer>
      </div>
    )
  }

  if (error) {
    return (
      <div className={styles.layout}>
        <header className={styles.header}>
          <Link href="/" className={styles.logo}>TAITAJA TIETOTESTI</Link>
          <Link href="/login" className={styles.loginLink}>
            Kirjaudu sisään
          </Link>
        </header>
        <main className={styles.main}>
          <div className={styles.error}>
            {error}
            <br />
            <Link href="/game">Palaa takaisin</Link>
          </div>
        </main>
        <footer className={styles.footer}>
          <div>
            Taitaja2025 -semifinaali<br />
            Jari peltola | Salon seudun ammattiopisto
          </div>
        </footer>
      </div>
    )
  }

  if (gameState.gameCompleted) {
    return (
      <div className={styles.layout}>
        <header className={styles.header}>
          <Link href="/" className={styles.logo}>TAITAJA TIETOTESTI</Link>
          <Link href="/login" className={styles.loginLink}>
            Kirjaudu sisään
          </Link>
        </header>
        <main className={styles.main}>
          <div className={styles.gameContainer}>
            <div className={styles.gameCompleted}>
              <h1>Peli päättyi!</h1>
              <div className={styles.finalScore}>
                Pisteet: {gameState.score}/{gameState.questions.length}
              </div>
              <div className={styles.completionMessage}>
                Sait {Math.round((gameState.score / gameState.questions.length) * 100)}% kysymyksistä oikein!
              </div>
              <div className={styles.gameEndActions}>
                <button onClick={handleViewScores} className={styles.viewScoresButton}>
                  Tallenna tulos
                </button>
                <button onClick={handlePlayAgain} className={styles.playAgainButton}>
                  Pelaa uudestaan
                </button>
              </div>
            </div>
          </div>
        </main>
        <footer className={styles.footer}>
          <div>
            Taitaja2025 -semifinaali<br />
            Jari Peltola | Salon seudun ammattiopisto
          </div>
        </footer>
      </div>
    )
  }

  const currentQuestion = gameState.questions[gameState.currentQuestionIndex]
  if (!currentQuestion) {
    return null
  }

  const options = [
    { key: 'A', text: currentQuestion.option_a },
    { key: 'B', text: currentQuestion.option_b },
    { key: 'C', text: currentQuestion.option_c },
    { key: 'D', text: currentQuestion.option_d }
  ]

  return (
    <div className={styles.layout}>
      <header className={styles.header}>
        <Link href="/" className={styles.logo}>TAITAJA TIETOTESTI</Link>
        <Link href="/login" className={styles.loginLink}>
          Kirjaudu sisään
        </Link>
      </header>

      <main className={styles.main}>
        <div className={styles.gameContainer}>
          <div className={styles.gameHeader}>
            <div className={styles.progress}>
              Kysymys {gameState.currentQuestionIndex + 1}/{gameState.questions.length}
            </div>
            <div className={styles.score}>
              Pisteet: {gameState.score}
            </div>
          </div>

          <div className={styles.question}>
            {currentQuestion.question}
          </div>

          <div className={styles.options}>
            {options.map((option) => {
              let optionClass = styles.option
              
              if (gameState.showFeedback) {
                optionClass += ` ${styles.disabled}`
                if (option.key === currentQuestion.correct_option) {
                  optionClass += ` ${styles.correct}`
                } else if (option.key === gameState.selectedAnswer) {
                  optionClass += ` ${styles.incorrect}`
                }
              } else if (option.key === gameState.selectedAnswer) {
                optionClass += ` ${styles.selected}`
              }

              return (
                <div
                  key={option.key}
                  className={optionClass}
                  onClick={() => handleAnswerSelect(option.key)}
                >
                  {option.text}
                </div>
              )
            })}
          </div>

          {!gameState.showFeedback ? (
            <button
              className={styles.answerButton}
              onClick={handleSubmitAnswer}
              disabled={!gameState.selectedAnswer}
            >
              Vastaa
            </button>
          ) : (
            <>
              <div className={`${styles.feedback} ${
                gameState.selectedAnswer === currentQuestion.correct_option 
                  ? styles.correct 
                  : styles.incorrect
              }`}>
                {gameState.selectedAnswer === currentQuestion.correct_option 
                  ? 'Oikein! Hienoa!' 
                  : `Väärin. Oikea vastaus oli: ${options.find(o => o.key === currentQuestion.correct_option)?.text}`
                }
              </div>
              <button
                className={styles.nextButton}
                onClick={handleNextQuestion}
              >
                {gameState.currentQuestionIndex + 1 >= gameState.questions.length 
                  ? 'Lopeta peli' 
                  : 'Seuraava kysymys'
                }
              </button>
            </>
          )}
        </div>
      </main>

      <footer className={styles.footer}>
        <div>
          Taitaja2025 -semifinaali<br />
          Jari Peltola | Salon seudun ammattiopisto
        </div>
      </footer>
    </div>
  )
}