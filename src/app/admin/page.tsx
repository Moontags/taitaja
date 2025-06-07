'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { supabase, Category } from '@/lib/supabase'
import styles from './page.module.css'

export default function AdminCategories() {
  const router = useRouter()
  const [categories, setCategories] = useState<Category[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [showModal, setShowModal] = useState(false)
  const [editingCategory, setEditingCategory] = useState<Category | null>(null)
  const [newCategoryName, setNewCategoryName] = useState('')
  const [teacherId, setTeacherId] = useState<number | null>(null)
  const [teacherName, setTeacherName] = useState('')

  useEffect(() => {
    // Get teacher info from session
    const id = sessionStorage.getItem('teacherId')
    const name = sessionStorage.getItem('teacherName')
    
    if (id && name) {
      setTeacherId(parseInt(id))
      setTeacherName(name)
      fetchCategories(parseInt(id))
    }
  }, [])

  // Auto-hide success messages after 2 seconds
  useEffect(() => {
    if (success) {
      const timer = setTimeout(() => {
        setSuccess('')
      }, 2000)
      
      return () => clearTimeout(timer)
    }
  }, [success])

  const fetchCategories = async (tId: number) => {
    try {
      setLoading(true)
      const { data, error } = await supabase
        .from('categories')
        .select('*')
        .eq('teacher_id', tId)
        .order('name')

      if (error) throw error
      setCategories(data || [])
    } catch (error) {
      console.error('Error fetching categories:', error)
      setError('Virhe kategorioiden haussa')
    } finally {
      setLoading(false)
    }
  }

  const handleLogout = () => {
    sessionStorage.removeItem('teacherId')
    sessionStorage.removeItem('teacherName')
    router.push('/login')
  }

  const handleAddCategory = () => {
    setEditingCategory(null)
    setNewCategoryName('')
    setShowModal(true)
  }

  const handleEditCategory = (category: Category) => {
    setEditingCategory(category)
    setNewCategoryName(category.name)
    setShowModal(true)
  }

  const handleSaveCategory = async () => {
    if (!newCategoryName.trim() || !teacherId) {
      setError('Kategorian nimi on pakollinen')
      return
    }

    try {
      setError('')
      setSuccess('')

      if (editingCategory) {
        // Update existing category
        const { error } = await supabase
          .from('categories')
          .update({ name: newCategoryName.trim() })
          .eq('id', editingCategory.id)

        if (error) throw error
        setSuccess('Kategoria päivitetty!')
      } else {
        // Create new category
        const { error } = await supabase
          .from('categories')
          .insert([
            {
              name: newCategoryName.trim(),
              teacher_id: teacherId
            }
          ])

        if (error) throw error
        setSuccess('Kategoria luotu!')
      }

      setShowModal(false)
      fetchCategories(teacherId)
    } catch (error) {
      console.error('Error saving category:', error)
      setError('Virhe kategorian tallennuksessa')
    }
  }

  const handleDeleteCategory = async (category: Category) => {
    if (!confirm(`Haluatko varmasti poistaa kategorian "${category.name}"? Tämä poistaa myös kaikki sen kysymykset.`)) {
      return
    }

    try {
      setError('')
      setSuccess('')

      // First delete all questions in this category
      const { error: questionsError } = await supabase
        .from('questions')
        .delete()
        .eq('category_id', category.id)

      if (questionsError) throw questionsError

      // Then delete the category
      const { error } = await supabase
        .from('categories')
        .delete()
        .eq('id', category.id)

      if (error) throw error

      setSuccess('Kategoria poistettu!')
      if (teacherId) {
        fetchCategories(teacherId)
      }
    } catch (error) {
      console.error('Error deleting category:', error)
      setError('Virhe kategorian poistamisessa')
    }
  }

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
          <div className={styles.pageHeader}>
            <h1 className={styles.title}>Kategoriat</h1>
            <button onClick={handleAddCategory} className={styles.addButton}>
              Luo uusi kategoria
            </button>
          </div>

          {error && <div className={styles.error}>{error}</div>}
          {success && <div className={styles.success}>{success}</div>}

          {loading ? (
            <div className={styles.loading}>Ladataan kategorioita...</div>
          ) : categories.length > 0 ? (
            <div className={styles.categoriesList}>
              {categories.map((category) => (
                <div key={category.id} className={styles.categoryItem}>
                  <Link 
                    href={`/admin/categories/${category.id}`} 
                    className={styles.categoryName}
                  >
                    {category.name}
                  </Link>
                  <div className={styles.categoryActions}>
                    <button
                      onClick={() => handleEditCategory(category)}
                      className={`${styles.actionButton} ${styles.editButton}`}
                    >
                      Muokkaa
                    </button>
                    <button
                      onClick={() => handleDeleteCategory(category)}
                      className={`${styles.actionButton} ${styles.deleteButton}`}
                    >
                      Poista
                    </button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className={styles.emptyState}>
              <h3>Ei kategorioita</h3>
              <p>Et ole vielä luonut yhtään kategoriaa.</p>
              <button onClick={handleAddCategory} className={styles.addButton}>
                Luo ensimmäinen kategoria
              </button>
            </div>
          )}
        </div>
      </main>

      {showModal && (
        <div className={styles.modal}>
          <div className={styles.modalContent}>
            <h2 className={styles.modalHeader}>
              {editingCategory ? 'Muokkaa kategoriaa' : 'Luo uusi kategoria'}
            </h2>
            
            <div className={styles.formGroup}>
              <label htmlFor="categoryName" className={styles.label}>
                Kategorian nimi
              </label>
              <input
                type="text"
                id="categoryName"
                value={newCategoryName}
                onChange={(e) => setNewCategoryName(e.target.value)}
                className={styles.input}
                placeholder="Esim. Matematiikka"
                maxLength={255}
              />
            </div>

            <div className={styles.modalActions}>
              <button
                onClick={() => setShowModal(false)}
                className={`${styles.modalButton} ${styles.cancelButton}`}
              >
                Peruuta
              </button>
              <button
                onClick={handleSaveCategory}
                disabled={!newCategoryName.trim()}
                className={`${styles.modalButton} ${styles.saveButton}`}
              >
                {editingCategory ? 'Päivitä' : 'Luo'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}