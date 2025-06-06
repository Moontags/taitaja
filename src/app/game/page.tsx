'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { supabase, Teacher, Category } from '@/lib/supabase'
import styles from './page.module.css'

export default function GameStart() {
  const router = useRouter()
  const [teachers, setTeachers] = useState<Teacher[]>([])
  const [categories, setCategories] = useState<Category[]>([])
  const [selectedTeacher, setSelectedTeacher] = useState<string>('')
  const [selectedCategory, setSelectedCategory] = useState<string>('')
  const [selectedQuestionCount, setSelectedQuestionCount] = useState<string>('5')
  const [loading, setLoading] = useState<boolean>(true)
  const [categoriesLoading, setCategoriesLoading] = useState<boolean>(false)
  const [error, setError] = useState<string>('')

  useEffect(() => {
    fetchTeachers()
  }, [])

  useEffect(() => {
    if (selectedTeacher) {
      fetchCategories(parseInt(selectedTeacher))
    } else {
      setCategories([])
      setSelectedCategory('')
    }
  }, [selectedTeacher])

  const fetchTeachers = async () => {
    try {
      setLoading(true)
      const { data, error } = await supabase
        .from('teachers')
        .select('*')
        .order('username')

      if (error) throw error
      setTeachers(data || [])
    } catch (error) {
      console.error('Error fetching teachers:', error)
      setError('Virhe opettajien haussa')
    } finally {
      setLoading(false)
    }
  }

  const fetchCategories = async (teacherId: number) => {
    try {
      setCategoriesLoading(true)
      const { data, error } = await supabase
        .from('categories')
        .select('*')
        .eq('teacher_id', teacherId)
        .order('name')

      if (error) throw error
      setCategories(data || [])
      setSelectedCategory('')
    } catch (error) {
      console.error('Error fetching categories:', error)
      setError('Virhe kategorioiden haussa')
    } finally {
      setCategoriesLoading(false)
    }
  }

  const handleStartGame = () => {
    if (!selectedTeacher || !selectedCategory || !selectedQuestionCount) {
      setError('Valitse kaikki vaaditut kentät')
      return
    }

    const params = new URLSearchParams({
      teacher: selectedTeacher,
      category: selectedCategory,
      count: selectedQuestionCount
    })

    router.push(`/game/play?${params.toString()}`)
  }

  const canStartGame = selectedTeacher && selectedCategory && selectedQuestionCount

  return (
    <div className={styles.layout}>
      <header className={styles.header}>
        <Link href="/" className={styles.logo}>TAITAJA TIETOTESTI</Link>
        <Link href="/login" className={styles.loginLink}>
          Kirjaudu sisään
        </Link>
      </header>

      <main className={styles.main}>
        <div className={styles.content}>
          <div className={styles.leftSection}>
            <h1 className={styles.title}>Aloita peli</h1>

            <div className={styles.formGroup}>
              <label htmlFor="teacher" className={styles.label}>
                Opettaja
              </label>
              <select
                id="teacher"
                className={styles.select}
                value={selectedTeacher}
                onChange={(e) => setSelectedTeacher(e.target.value)}
                disabled={loading}
              >
                <option value="">
                  {loading ? 'Ladataan...' : 'Valitse opettaja'}
                </option>
                {teachers.map((teacher) => (
                  <option key={teacher.id} value={teacher.id.toString()}>
                    {teacher.username}
                  </option>
                ))}
              </select>
              {error && <div className={styles.error}>{error}</div>}
            </div>

            <div className={styles.formGroup}>
              <label htmlFor="category" className={styles.label}>
                Kategoria
              </label>
              <select
                id="category"
                className={styles.select}
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                disabled={!selectedTeacher || categoriesLoading}
              >
                <option value="">
                  {!selectedTeacher 
                    ? 'Valitse ensin opettaja'
                    : categoriesLoading 
                    ? 'Ladataan...'
                    : 'Valitse aihelue'
                  }
                </option>
                {categories.map((category) => (
                  <option key={category.id} value={category.id.toString()}>
                    {category.name}
                  </option>
                ))}
              </select>
            </div>

            <div className={styles.formGroup}>
              <div className={styles.label}>Valitse kysymysten määrä</div>
              <div className={styles.radioGroup}>
                <label className={styles.radioOption}>
                  <input
                    type="radio"
                    name="questionCount"
                    value="5"
                    checked={selectedQuestionCount === '5'}
                    onChange={(e) => setSelectedQuestionCount(e.target.value)}
                    className={styles.radioInput}
                  />
                  <span className={styles.radioLabel}>Lyhyt (5)</span>
                </label>
                <label className={styles.radioOption}>
                  <input
                    type="radio"
                    name="questionCount"
                    value="10"
                    checked={selectedQuestionCount === '10'}
                    onChange={(e) => setSelectedQuestionCount(e.target.value)}
                    className={styles.radioInput}
                  />
                  <span className={styles.radioLabel}>Keskipitkä (10)</span>
                </label>
                <label className={styles.radioOption}>
                  <input
                    type="radio"
                    name="questionCount"
                    value="15"
                    checked={selectedQuestionCount === '15'}
                    onChange={(e) => setSelectedQuestionCount(e.target.value)}
                    className={styles.radioInput}
                  />
                  <span className={styles.radioLabel}>Pitkä (15)</span>
                </label>
              </div>
            </div>

            <button
              className={styles.startButton}
              onClick={handleStartGame}
              disabled={!canStartGame}
            >
              Aloita peli
            </button>
          </div>

          <div className={styles.rightSection}>
            <div className={styles.placeholderBox}>
              Kuva tai animaatio pelistä tulee tähän
            </div>
          </div>
        </div>
      </main>

      <footer className={styles.footer}>
        <div>
          Taitaja2025 -semifinaali<br />
          Jari Peltola | Salon ammttiopisto | 2024
        </div>
      </footer>
    </div>
  )
}