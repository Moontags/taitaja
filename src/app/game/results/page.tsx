'use client'

import { useState, useEffect, useCallback } from 'react'
import Link from 'next/link'
import { useRouter, useSearchParams } from 'next/navigation'
import { supabase, Score, Category } from '@/lib/supabase'
import styles from './page.module.css'

type ScoreWithCategory = Score & {
  categories?: Category
}

export default function GameResults() {
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

  // Group scores by category for display
  const scoresByCategory = highScores.reduce((acc, score) => {
    const categoryName = score.categories?.name || 'Tuntematon'
    if (!acc[categoryName]) {
      acc[categoryName] = []
    }
    acc[categoryName].push(score)
    return acc
  }, {} as Record<string, ScoreWithCategory[]>)

  // Limit to top 3 per category for display
  Object.keys(scoresByCategory).forEach(category => {
    scoresByCategory[category] = scoresByCategory[category].slice(0, 3)
  })

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
                <h2 className={styles.highScoresTitle}>High scores</h2>
                
                {loading ? (
                  <div className={styles.loading}>Ladataan tuloksia...</div>
                ) : error ? (
                  <div className={styles.error}>{error}</div>
                ) : Object.keys(scoresByCategory).length > 0 ? (
                  Object.entries(scoresByCategory).map(([categoryName, scores]) => (
                    <div key={categoryName} className={styles.scoresByCategory}>
                      <h3 className={styles.categoryTitle}>{categoryName}</h3>
                      <table className={styles.scoresTable}>
                        <thead>
                          <tr>
                            <th></th>
                            <th>Nimi</th>
                            <th>Pisteet</th>
                            <th>%</th>
                          </tr>
                        </thead>
                        <tbody>
                          {scores.map((scoreEntry, index) => (
                            <tr key={scoreEntry.id}>
                              <td>{index + 1}.</td>
                              <td>{scoreEntry.player_name}</td>
                              <td>{scoreEntry.score}/{scoreEntry.total_questions}</td>
                              <td>{Math.round((scoreEntry.score / scoreEntry.total_questions) * 100)}%</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
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