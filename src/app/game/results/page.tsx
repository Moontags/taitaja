
'use client'

import { useState, useEffect, useCallback, Suspense } from 'react'
import Link from 'next/link'
import { useRouter, useSearchParams } from 'next/navigation'
import { supabase, Score, Category } from '@/lib/supabase'
import styles from './page.module.css'

type ScoreWithCategory = Score & {
  categories?: Category
}

function GameResultsContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [playerName, setPlayerName] = useState('')
  const [scoreSaved, setScoreSaved] = useState(false)
  const [highScores, setHighScores] = useState<ScoreWithCategory[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  const score = parseInt(searchParams.get('score') || '0')
  const total = parseInt(searchParams.get('total') || '0')
  const categoryId = searchParams.get('category')

  const fetchHighScores = useCallback(async () => {
    try {
      setLoading(true)
      setError('')
      
      console.log('Fetching high scores...')
      
      // First, let's check if the tables exist by doing a simple count
      const { count: scoresCount, error: scoresCountError } = await supabase
        .from('scores')
        .select('*', { count: 'exact', head: true })

      if (scoresCountError) {
        console.error('Scores table error:', scoresCountError)
        throw new Error(`Scores table issue: ${scoresCountError.message}`)
      }

      console.log(`Found ${scoresCount} scores in database`)

      // Check categories table
      const { count: categoriesCount, error: categoriesCountError } = await supabase
        .from('categories')
        .select('*', { count: 'exact', head: true })

      if (categoriesCountError) {
        console.error('Categories table error:', categoriesCountError)
        // Continue without categories if categories table doesn't exist
      }

      console.log(`Found ${categoriesCount} categories in database`)

      // Try the join query first
      const { data: joinedData, error: joinError } = await supabase
        .from('scores')
        .select(`
          *,
          categories (
            name
          )
        `)
        .order('score', { ascending: false })
        .order('created_at', { ascending: true })
        .limit(50)

      if (!joinError && joinedData) {
        console.log('Successfully fetched with join:', joinedData.length, 'records')
        setHighScores(joinedData)
        return
      }

      console.log('Join query failed, trying simple query. Join error:', joinError)

      // If join fails, try without join
      const { data: simpleData, error: simpleError } = await supabase
        .from('scores')
        .select('*')
        .order('score', { ascending: false })
        .order('created_at', { ascending: true })
        .limit(50)

      if (simpleError) {
        console.error('Simple query error:', simpleError)
        throw new Error(`Database query failed: ${simpleError.message}`)
      }

      console.log('Simple query successful:', simpleData?.length || 0, 'records')

      // Fetch category names separately if categories table exists
      let categories: { id: number; name: string }[] = []
      if (!categoriesCountError) {
        const { data: categoriesData, error: catError } = await supabase
          .from('categories')
          .select('id, name')

        if (!catError && categoriesData) {
          categories = categoriesData
          console.log('Fetched categories:', categories.length)
        }
      }

      // Merge the data
      const mergedData = simpleData?.map(score => ({
        ...score,
        categories: categories.find(cat => cat.id === score.category_id) || { name: 'Tuntematon' }
      })) || []

      setHighScores(mergedData)
      
    } catch (error: unknown) {
      console.error('Error fetching high scores:', error)
      console.error('Error type:', typeof error)
      console.error('Error constructor:', error?.constructor?.name)
      
      let errorMessage = 'Tuntematon virhe tulosten haussa'
      
      if (error instanceof Error) {
        errorMessage = error.message
      } else if (typeof error === 'object' && error !== null) {
        // Handle Supabase error format
        if ('message' in error && typeof (error as Record<string, unknown>).message === 'string') {
          errorMessage = (error as Record<string, unknown>).message as string
        } else if ('error' in error && typeof (error as Record<string, unknown>).error === 'string') {
          errorMessage = (error as Record<string, unknown>).error as string
        } else {
          errorMessage = `Virhe tulosten haussa: ${JSON.stringify(error)}`
        }
      } else if (typeof error === 'string') {
        errorMessage = error
      }

      // Check for specific database errors
      if (errorMessage.includes('relation') && errorMessage.includes('does not exist')) {
        errorMessage = 'Tietokanta ei ole vielä alustettu. Suorita supabase-setup.sql skripti.'
      } else if (errorMessage.includes('permission denied')) {
        errorMessage = 'Tietokantaoikeudet puuttuvat. Tarkista Supabase RLS-säännöt.'
      }

      setError(errorMessage)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    if (!categoryId) {
      router.push('/game')
      return
    }
    fetchHighScores()
  }, [categoryId, router, fetchHighScores])

  // Auto-hide success messages after 2 seconds
  useEffect(() => {
    if (success) {
      const timer = setTimeout(() => {
        setSuccess('')
      }, 2000)
      
      return () => clearTimeout(timer)
    }
  }, [success])

  const handleSaveScore = async () => {
    if (!playerName.trim()) {
      setError('Anna nimesi')
      return
    }

    if (!categoryId) {
      setError('Kategoria puuttuu')
      return
    }

    try {
      setLoading(true)
      setError('')

      console.log('Saving score:', {
        player_name: playerName.trim(),
        score,
        total_questions: total,
        category_id: parseInt(categoryId)
      })

      const { data, error } = await supabase
        .from('scores')
        .insert([
          {
            player_name: playerName.trim(),
            score: score,
            total_questions: total,
            category_id: parseInt(categoryId)
          }
        ])
        .select()

      if (error) {
        console.error('Supabase insert error:', error)
        throw error
      }

      console.log('Score saved successfully:', data)
      setScoreSaved(true)
      setSuccess('Tulos tallennettu!')
      await fetchHighScores()
      
    } catch (error: unknown) {
      console.error('Error saving score:', error)

      let errorMessage = 'Virhe tuloksen tallennuksessa'
      
      if (error instanceof Error) {
        errorMessage = `Virhe tuloksen tallennuksessa: ${error.message}`
      } else if (typeof error === 'object' && error !== null && 'message' in error) {
        const message = (error as Record<string, unknown>).message
        if (typeof message === 'string') {
          if (message.includes('relation "scores" does not exist')) {
            errorMessage = 'Tulosten taulu puuttuu. Suorita supabase-setup.sql skripti.'
          } else if (message.includes('violates foreign key constraint')) {
            errorMessage = 'Virheellinen kategoria ID'
          } else {
            errorMessage = `Virhe tuloksen tallennuksessa: ${message}`
          }
        }
      }

      setError(errorMessage)
    } finally {
      setLoading(false)
    }
  }

  const handlePlayAgain = () => {
    router.push('/game')
  }

  // TEKOÄLYN SUORITTAMAA KOODIA - Vaikeustasojärjestely
  // Group scores by difficulty level (question count) and category for display
  const getDifficultyLevel = (totalQuestions: number) => {
    if (totalQuestions <= 5) return 'Lyhyt (5 kysymystä)'
    if (totalQuestions <= 10) return 'Keskipitkä (10 kysymystä)'
    return 'Pitkä (15+ kysymystä)'
  }

  const scoresByDifficultyAndCategory = highScores.reduce((acc, score) => {
    const difficultyLevel = getDifficultyLevel(score.total_questions)
    const categoryName = score.categories?.name || 'Tuntematon'
    const key = `${difficultyLevel}_${categoryName}`
    
    if (!acc[key]) {
      acc[key] = {
        difficulty: difficultyLevel,
        category: categoryName,
        scores: []
      }
    }
    acc[key].scores.push(score)
    return acc
  }, {} as Record<string, { difficulty: string; category: string; scores: ScoreWithCategory[] }>)

  // Sort scores within each group and limit to top 5 per group for display
  Object.keys(scoresByDifficultyAndCategory).forEach(key => {
    scoresByDifficultyAndCategory[key].scores = scoresByDifficultyAndCategory[key].scores
      .sort((a, b) => {
        if (b.score !== a.score) return b.score - a.score
        return new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
      })
      .slice(0, 5)
  })

  // Group by difficulty level for better display
  const scoresByDifficulty = Object.values(scoresByDifficultyAndCategory).reduce((acc, group) => {
    if (!acc[group.difficulty]) {
      acc[group.difficulty] = []
    }
    acc[group.difficulty].push(group)
    return acc
  }, {} as Record<string, Array<{ difficulty: string; category: string; scores: ScoreWithCategory[] }>>)

  return (
    <div className={styles.layout}>
      <header className={styles.header}>
        <Link href="/" className={styles.logo}>TAITAJA TIETOTESTI</Link>
        <Link href="/login" className={styles.loginLink}>
          Kirjaudu sisään
        </Link>
      </header>

      <main className={styles.main}>
        <div className={styles.container}>
          {!scoreSaved ? (
            <div className={styles.endScreen}>
              <h1 className={styles.title}>Tuloksesi</h1>
              <div className={styles.scoreDisplay}>
                Pisteet: {score}/{total}
              </div>
              
              <div className={styles.nameForm}>
                <input
                  type="text"
                  placeholder="Anna nimesi"
                  value={playerName}
                  onChange={(e) => setPlayerName(e.target.value)}
                  className={styles.nameInput}
                  maxLength={50}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      handleSaveScore()
                    }
                  }}
                />
                <button
                  onClick={handleSaveScore}
                  disabled={loading || !playerName.trim()}
                  className={styles.saveButton}
                >
                  {loading ? 'Tallennetaan...' : 'Tallenna tulos'}
                </button>
              </div>

              {error && <div className={styles.error}>{error}</div>}
            </div>
          ) : (
            <div>
              {success && <div className={styles.success}>{success}</div>}
              
              <div className={styles.highScores}>
                <h2 className={styles.highScoresTitle}>Parhaat tulokset</h2>
                
                {loading ? (
                  <div className={styles.loading}>Ladataan tuloksia...</div>
                ) : error ? (
                  <div className={styles.error}>{error}</div>
                ) : Object.keys(scoresByDifficulty).length > 0 ? (
                  Object.entries(scoresByDifficulty).map(([difficulty, categoryGroups]) => (
                    <div key={difficulty} className={styles.difficultySection}>
                      <h3 className={styles.difficultyTitle}>{difficulty}</h3>
                      {categoryGroups.map(({ category, scores }) => (
                        <div key={`${difficulty}_${category}`} className={styles.scoresByCategory}>
                          <h4 className={styles.categoryTitle}>{category}</h4>
                          <table className={styles.scoresTable}>
                            <thead>
                              <tr>
                                <th>Sija</th>
                                <th>Nimi</th>
                                <th>Pisteet</th>
                                <th>%</th>
                                <th>Päivä</th>
                              </tr>
                            </thead>
                            <tbody>
                              {scores.map((scoreEntry, index) => (
                                <tr key={scoreEntry.id} className={index === 0 ? styles.firstPlace : ''}>
                                  <td>{index + 1}.</td>
                                  <td>{scoreEntry.player_name}</td>
                                  <td>{scoreEntry.score}/{scoreEntry.total_questions}</td>
                                  <td>{Math.round((scoreEntry.score / scoreEntry.total_questions) * 100)}%</td>
                                  <td>{new Date(scoreEntry.created_at).toLocaleDateString('fi-FI')}</td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      ))}
                    </div>
                  ))
                ) : (
                  <div className={styles.noScores}>Ei vielä tuloksia</div>
                )}
              </div>

              <button onClick={handlePlayAgain} className={styles.playAgainButton}>
                Pelaa uudestaan
              </button>
            </div>
          )}
        </div>
      </main>

      <footer className={styles.footer}>
        <div>
          Taitaja2025 -semifinaali<br />
          Etu- ja sukunimi | Oppilaitoksen nimi
        </div>
      </footer>
    </div>
  )
}

function LoadingSpinner() {
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
          Ladataan tuloksia...
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

export default function GameResults() {
  return (
    <Suspense fallback={<LoadingSpinner />}>
      <GameResultsContent />
    </Suspense>
  )
}