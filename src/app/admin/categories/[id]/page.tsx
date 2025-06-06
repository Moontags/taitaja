'use client'

import { useState, useEffect, useCallback } from 'react'
import Link from 'next/link'
import { useRouter, useParams } from 'next/navigation'
import { supabase, Question, Category } from '@/lib/supabase'
import styles from './page.module.css'

type QuestionFormData = {
  question: string
  option_a: string
  option_b: string
  option_c: string
  option_d: string
  correct_option: 'A' | 'B' | 'C' | 'D'
}

export default function AdminQuestions() {
  const router = useRouter()
  const params = useParams()
  const categoryId = parseInt(params.id as string)
  
  const [questions, setQuestions] = useState<Question[]>([])
  const [category, setCategory] = useState<Category | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [showModal, setShowModal] = useState(false)
  const [editingQuestion, setEditingQuestion] = useState<Question | null>(null)
  const [formData, setFormData] = useState<QuestionFormData>({
    question: '',
    option_a: '',
    option_b: '',
    option_c: '',
    option_d: '',
    correct_option: 'A'
  })
  const [teacherId, setTeacherId] = useState<number | null>(null)
  const [teacherName, setTeacherName] = useState('')

  const fetchCategoryAndQuestions = useCallback(async (tId: number) => {
    try {
      setLoading(true)
      
      // Fetch category
      const { data: categoryData, error: categoryError } = await supabase
        .from('categories')
        .select('*')
        .eq('id', categoryId)
        .eq('teacher_id', tId)
        .single()

      if (categoryError) throw categoryError
      if (!categoryData) {
        router.push('/admin')
        return
      }
      
      setCategory(categoryData)

      // Fetch questions
      const { data: questionsData, error: questionsError } = await supabase
        .from('questions')
        .select('*')
        .eq('category_id', categoryId)
        .eq('teacher_id', tId)
        .order('id')

      if (questionsError) throw questionsError
      setQuestions(questionsData || [])
    } catch (error) {
      console.error('Error fetching data:', error)
      setError('Virhe tietojen haussa')
    } finally {
      setLoading(false)
    }
  }, [categoryId, router])

  useEffect(() => {
    // Get teacher info from session
    const id = sessionStorage.getItem('teacherId')
    const name = sessionStorage.getItem('teacherName')
    
    if (id && name) {
      setTeacherId(parseInt(id))
      setTeacherName(name)
      fetchCategoryAndQuestions(parseInt(id))
    }
  }, [categoryId, fetchCategoryAndQuestions])

  const handleLogout = () => {
    sessionStorage.removeItem('teacherId')
    sessionStorage.removeItem('teacherName')
    router.push('/login')
  }

  const handleAddQuestion = () => {
    setEditingQuestion(null)
    setFormData({
      question: '',
      option_a: '',
      option_b: '',
      option_c: '',
      option_d: '',
      correct_option: 'A'
    })
    setShowModal(true)
  }

  const handleEditQuestion = (question: Question) => {
    setEditingQuestion(question)
    setFormData({
      question: question.question,
      option_a: question.option_a,
      option_b: question.option_b,
      option_c: question.option_c,
      option_d: question.option_d,
      correct_option: question.correct_option
    })
    setShowModal(true)
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
  }

  const handleCorrectOptionChange = (option: 'A' | 'B' | 'C' | 'D') => {
    setFormData(prev => ({
      ...prev,
      correct_option: option
    }))
  }

  const handleSaveQuestion = async () => {
    if (!formData.question.trim() || !formData.option_a.trim() || 
        !formData.option_b.trim() || !formData.option_c.trim() || 
        !formData.option_d.trim() || !teacherId) {
      setError('Täytä kaikki kentät')
      return
    }

    try {
      setError('')
      setSuccess('')

      if (editingQuestion) {
        // Update existing question
        const { error } = await supabase
          .from('questions')
          .update({
            question: formData.question.trim(),
            option_a: formData.option_a.trim(),
            option_b: formData.option_b.trim(),
            option_c: formData.option_c.trim(),
            option_d: formData.option_d.trim(),
            correct_option: formData.correct_option
          })
          .eq('id', editingQuestion.id)

        if (error) throw error
        setSuccess('Kysymys päivitetty!')
      } else {
        // Create new question
        const { error } = await supabase
          .from('questions')
          .insert([
            {
              category_id: categoryId,
              teacher_id: teacherId,
              question: formData.question.trim(),
              option_a: formData.option_a.trim(),
              option_b: formData.option_b.trim(),
              option_c: formData.option_c.trim(),
              option_d: formData.option_d.trim(),
              correct_option: formData.correct_option
            }
          ])

        if (error) throw error
        setSuccess('Kysymys luotu!')
      }

      setShowModal(false)
      fetchCategoryAndQuestions(teacherId)
    } catch (error) {
      console.error('Error saving question:', error)
      setError('Virhe kysymyksen tallennuksessa')
    }
  }

  const handleDeleteQuestion = async (question: Question) => {
    if (!confirm(`Haluatko varmasti poistaa kysymyksen "${question.question}"?`)) {
      return
    }

    try {
      setError('')
      setSuccess('')

      const { error } = await supabase
        .from('questions')
        .delete()
        .eq('id', question.id)

      if (error) throw error

      setSuccess('Kysymys poistettu!')
      if (teacherId) {
        fetchCategoryAndQuestions(teacherId)
      }
    } catch (error) {
      console.error('Error deleting question:', error)
      setError('Virhe kysymyksen poistamisessa')
    }
  }

  const isFormValid = formData.question.trim() && formData.option_a.trim() && 
                     formData.option_b.trim() && formData.option_c.trim() && 
                     formData.option_d.trim()

  return (
    <div className={styles.layout}>
      <header className={styles.header}>
        <Link href="/" className={styles.logo}>TAITAJA TIETOTESTI</Link>
        <div className={styles.headerRight}>
          <span className={styles.welcomeText}>Tervetuloa, {teacherName}</span>
          <button onClick={handleLogout} className={styles.logoutButton}>
            Kirjaudu ulos
          </button>
        </div>
      </header>

      <main className={styles.main}>
        <div className={styles.container}>
          <div className={styles.breadcrumb}>
            <Link href="/admin" className={styles.breadcrumbLink}>
              Takaisin
            </Link>
          </div>

          <div className={styles.pageHeader}>
            <div className={styles.titleSection}>
              <h1 className={styles.title}>
                {category?.name || 'Kysymykset'}
              </h1>
              <div className={styles.subtitle}>
                {questions.length} kysymystä
              </div>
            </div>
            <div className={styles.headerActions}>
              <button onClick={handleAddQuestion} className={styles.addButton}>
                Lisää uusi kysymys
              </button>
            </div>
          </div>

          {error && <div className={styles.error}>{error}</div>}
          {success && <div className={styles.success}>{success}</div>}

          {loading ? (
            <div className={styles.loading}>Ladataan kysymyksiä...</div>
          ) : questions.length > 0 ? (
            <div className={styles.questionsList}>
              {questions.map((question) => (
                <div key={question.id} className={styles.questionItem}>
                  <div className={styles.questionHeader}>
                    <div className={styles.questionText}>
                      {question.question}
                    </div>
                    <div className={styles.questionActions}>
                      <button
                        onClick={() => handleEditQuestion(question)}
                        className={`${styles.actionButton} ${styles.editButton}`}
                      >
                        Muokkaa
                      </button>
                      <button
                        onClick={() => handleDeleteQuestion(question)}
                        className={`${styles.actionButton} ${styles.deleteButton}`}
                      >
                        Poista
                      </button>
                    </div>
                  </div>
                  <div className={styles.questionOptions}>
                    <div className={`${styles.option} ${question.correct_option === 'A' ? styles.correct : styles.incorrect}`}>
                      <span className={styles.optionLabel}>A:</span>
                      {question.option_a}
                    </div>
                    <div className={`${styles.option} ${question.correct_option === 'B' ? styles.correct : styles.incorrect}`}>
                      <span className={styles.optionLabel}>B:</span>
                      {question.option_b}
                    </div>
                    <div className={`${styles.option} ${question.correct_option === 'C' ? styles.correct : styles.incorrect}`}>
                      <span className={styles.optionLabel}>C:</span>
                      {question.option_c}
                    </div>
                    <div className={`${styles.option} ${question.correct_option === 'D' ? styles.correct : styles.incorrect}`}>
                      <span className={styles.optionLabel}>D:</span>
                      {question.option_d}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className={styles.emptyState}>
              <h3>Ei kysymyksiä</h3>
              <p>Et ole vielä luonut yhtään kysymystä tähän kategoriaan.</p>
              <button onClick={handleAddQuestion} className={styles.addButton}>
                Luo ensimmäinen kysymys
              </button>
            </div>
          )}
        </div>
      </main>

      {showModal && (
        <div className={styles.modal}>
          <div className={styles.modalContent}>
            <h2 className={styles.modalHeader}>
              {editingQuestion ? 'Muokkaa kysymystä' : 'Luo uusi kysymys'}
            </h2>
            
            <div className={styles.formGroup}>
              <label htmlFor="question" className={styles.label}>
                Kysymys
              </label>
              <textarea
                id="question"
                name="question"
                value={formData.question}
                onChange={handleInputChange}
                className={styles.textarea}
                placeholder="Kirjoita kysymys tähän..."
                maxLength={500}
              />
            </div>

            <div className={styles.formGroup}>
              <label htmlFor="option_a" className={styles.label}>
                Vaihtoehto A
              </label>
              <input
                type="text"
                id="option_a"
                name="option_a"
                value={formData.option_a}
                onChange={handleInputChange}
                className={styles.input}
                placeholder="Vaihtoehto A"
                maxLength={255}
              />
            </div>

            <div className={styles.formGroup}>
              <label htmlFor="option_b" className={styles.label}>
                Vaihtoehto B
              </label>
              <input
                type="text"
                id="option_b"
                name="option_b"
                value={formData.option_b}
                onChange={handleInputChange}
                className={styles.input}
                placeholder="Vaihtoehto B"
                maxLength={255}
              />
            </div>

            <div className={styles.formGroup}>
              <label htmlFor="option_c" className={styles.label}>
                Vaihtoehto C
              </label>
              <input
                type="text"
                id="option_c"
                name="option_c"
                value={formData.option_c}
                onChange={handleInputChange}
                className={styles.input}
                placeholder="Vaihtoehto C"
                maxLength={255}
              />
            </div>

            <div className={styles.formGroup}>
              <label htmlFor="option_d" className={styles.label}>
                Vaihtoehto D
              </label>
              <input
                type="text"
                id="option_d"
                name="option_d"
                value={formData.option_d}
                onChange={handleInputChange}
                className={styles.input}
                placeholder="Vaihtoehto D"
                maxLength={255}
              />
            </div>

            <div className={styles.correctAnswerGroup}>
              <div className={styles.label}>Oikea vastaus</div>
              <div className={styles.radioOptions}>
                {(['A', 'B', 'C', 'D'] as const).map((option) => (
                  <div 
                    key={option}
                    className={`${styles.radioOption} ${formData.correct_option === option ? styles.selected : ''}`}
                    onClick={() => handleCorrectOptionChange(option)}
                  >
                    <input
                      type="radio"
                      name="correct_option"
                      value={option}
                      checked={formData.correct_option === option}
                      onChange={() => handleCorrectOptionChange(option)}
                      className={styles.radioInput}
                    />
                    <label className={styles.radioLabel}>
                      {option}: {formData[`option_${option.toLowerCase()}` as keyof QuestionFormData]}
                    </label>
                  </div>
                ))}
              </div>
            </div>

            <div className={styles.modalActions}>
              <button
                onClick={() => setShowModal(false)}
                className={`${styles.modalButton} ${styles.cancelButton}`}
              >
                Peruuta
              </button>
              <button
                onClick={handleSaveQuestion}
                disabled={!isFormValid}
                className={`${styles.modalButton} ${styles.saveButton}`}
              >
                {editingQuestion ? 'Päivitä' : 'Luo'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}