// TEKOÄLYN SUORITTAMAA KOODIA - API-reititys ja tietokantaoperaatiot
import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const categoryId = searchParams.get('category_id')
    const limit = parseInt(searchParams.get('limit') || '50')

    let query = supabase
      .from('scores')
      .select(`
        *,
        categories (
          name
        )
      `)
      .order('score', { ascending: false })
      .order('created_at', { ascending: true })
      .limit(limit)

    if (categoryId) {
      query = query.eq('category_id', parseInt(categoryId))
    }

    const { data, error } = await query

    if (error) {
      throw error
    }

    return NextResponse.json({ scores: data })
  } catch (error) {
    console.error('Error fetching scores:', error)
    return NextResponse.json(
      { error: 'Failed to fetch scores' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { player_name, score, total_questions, category_id } = body

    // Validate required fields
    if (!player_name || typeof score !== 'number' || 
        typeof total_questions !== 'number' || !category_id) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      )
    }

    // Validate score range
    if (score < 0 || score > total_questions) {
      return NextResponse.json(
        { error: 'Invalid score range' },
        { status: 400 }
      )
    }

    // Validate name length
    if (player_name.trim().length === 0 || player_name.length > 50) {
      return NextResponse.json(
        { error: 'Player name must be 1-50 characters' },
        { status: 400 }
      )
    }

    // Insert the score
    const { data, error } = await supabase
      .from('scores')
      .insert([
        {
          player_name: player_name.trim(),
          score,
          total_questions,
          category_id
        }
      ])
      .select()
      .single()

    if (error) {
      throw error
    }

    return NextResponse.json({ 
      message: 'Score saved successfully',
      score: data 
    })
  } catch (error) {
    console.error('Error saving score:', error)
    return NextResponse.json(
      { error: 'Failed to save score' },
      { status: 500 }
    )
  }
}