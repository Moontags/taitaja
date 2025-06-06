'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [authenticated, setAuthenticated] = useState(false)

  useEffect(() => {
    // Check if user is authenticated
    const teacherId = sessionStorage.getItem('teacherId')
    const teacherName = sessionStorage.getItem('teacherName')
    
    if (teacherId && teacherName) {
      setAuthenticated(true)
    } else {
      router.push('/login')
    }
    
    setLoading(false)
  }, [router])

  if (loading) {
    return (
      <div style={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center', 
        minHeight: '100vh',
        fontFamily: 'Arial, sans-serif'
      }}>
        Tarkistetaan käyttöoikeuksia...
      </div>
    )
  }

  if (!authenticated) {
    return null
  }

  return <>{children}</>
}