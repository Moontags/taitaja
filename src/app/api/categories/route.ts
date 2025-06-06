// TEKOÄLYN SUORITTAMAA KOODIA - Kategorioiden API-hallinta
import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const teacherId = searchParams.get('teacher_id')

    let query = supabase
      .from('categories')
      .select('*')
      .order('name')

    if (teacherId) {
      query = query.eq('teacher_id', parseInt(teacherId))
    }

    const { data, error } = await query

    if (error) {
      throw error
    }

    return NextResponse.json({ categories: data })
  } catch (error) {
    console.error('Error fetching categories:', error)
    return NextResponse.json(
      { error: 'Failed to fetch categories' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { name, teacher_id } = body

    // Validate required fields
    if (!name || !teacher_id) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      )
    }

    // Validate name length
    if (name.trim().length === 0 || name.length > 255) {
      return NextResponse.json(
        { error: 'Category name must be 1-255 characters' },
        { status: 400 }
      )
    }

    // Insert the category
    const { data, error } = await supabase
      .from('categories')
      .insert([
        {
          name: name.trim(),
          teacher_id
        }
      ])
      .select()
      .single()

    if (error) {
      throw error
    }

    return NextResponse.json({ 
      message: 'Category created successfully',
      category: data 
    })
  } catch (error) {
    console.error('Error creating category:', error)
    return NextResponse.json(
      { error: 'Failed to create category' },
      { status: 500 }
    )
  }
}