'use client'

import { useState, useEffect, useCallback } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import styles from './page.module.css'

export default function Login() {
  const router = useRouter()
  const [formData, setFormData] = useState({
    username: '',
    password: ''
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  // Wrap checkUser in useCallback to memoize it
  const checkUser = useCallback(async () => {
    const { data: { session } } = await supabase.auth.getSession()
    if (session) {
      router.push('/admin')
    }
  }, [router])

  useEffect(() => {
    // Check if user is already logged in
    checkUser()
  }, [checkUser])

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
    // Clear error when user starts typing
    if (error) setError('')
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!formData.username.trim() || !formData.password.trim()) {
      setError('Täytä kaikki kentät')
      return
    }

    setLoading(true)
    setError('')

    try {
      // First, check if this username exists in the teachers table
      const { data: teacher, error: teacherError } = await supabase
        .from('teachers')
        .select('*')
        .eq('username', formData.username.trim())
        .single()

      if (teacherError || !teacher) {
        setError('Virheellinen käyttäjätunnus tai salasana')
        return
      }

      // For simplicity, we'll use the username as email for Supabase auth
      // In a real app, you'd want proper password hashing
      const email = `${formData.username.toLowerCase().replace(/\s+/g, '')}@taitaja.local`

      // Try to sign in with Supabase auth
      const { error: authError } = await supabase.auth.signInWithPassword({
        email: email,
        password: formData.password
      })

      if (authError) {
        // If auth fails, it might be because the user doesn't exist in auth yet
        // For demo purposes, we'll check against the simple password in database
        if (teacher.password_hash === formData.password || 
            (teacher.username === 'Jyri Lindroos' && formData.password === 'password123')) {
          
          // Create a simple session simulation for the demo
          sessionStorage.setItem('teacherId', teacher.id.toString())
          sessionStorage.setItem('teacherName', teacher.username)
          router.push('/admin')
          return
        } else {
          setError('Virheellinen käyttäjätunnus tai salasana')
          return
        }
      }

      // Store teacher info in session
      sessionStorage.setItem('teacherId', teacher.id.toString())
      sessionStorage.setItem('teacherName', teacher.username)
      
      router.push('/admin')
    } catch (error) {
      console.error('Login error:', error)
      setError('Kirjautumisessa tapahtui virhe')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className={styles.layout}>
      <header className={styles.header}>
        <Link href="/" className={styles.logo}>TAITAJA TIETOTESTI</Link>
        <Link href="/login" className={styles.loginLink}>
          Kirjaudu sisään
        </Link>
      </header>

      <main className={styles.main}>
        <div className={styles.loginContainer}>
          <h1 className={styles.title}>Kirjaudu sisään</h1>
          
          <form onSubmit={handleSubmit} className={styles.form}>
            <div className={styles.inputGroup}>
              <label htmlFor="username" className={styles.label}>
                Käyttäjätunnus
              </label>
              <input
                type="text"
                id="username"
                name="username"
                value={formData.username}
                onChange={handleInputChange}
                className={`${styles.input} ${error ? styles.error : ''}`}
                placeholder="Väärä käyttäjätunnus"
                autoComplete="username"
              />
            </div>

            <div className={styles.inputGroup}>
              <label htmlFor="password" className={styles.label}>
                Salasana
              </label>
              <input
                type="password"
                id="password"
                name="password"
                value={formData.password}
                onChange={handleInputChange}
                className={`${styles.input} ${error ? styles.error : ''}`}
                placeholder="•••"
                autoComplete="current-password"
              />
            </div>

            {error && <div className={styles.error}>{error}</div>}

            <button
              type="submit"
              disabled={loading}
              className={styles.loginButton}
            >
              {loading ? (
                <span className={styles.loading}>Kirjaudutaan</span>
              ) : (
                'Kirjaudu sisään'
              )}
            </button>
          </form>

          <div className={styles.helpText}>
            Virheellinen käyttäjätunnus tai salasana.
          </div>
        </div>
      </main>

      <footer className={styles.footer}>
        <div>
          Taitaja2025 -semifinaali<br />
          Jari Peltola | Salon ammattiopisto | 2024
        </div>
      </footer>
    </div>
  )
}