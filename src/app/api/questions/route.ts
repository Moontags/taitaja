
import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const categoryId = searchParams.get('category_id')
    const teacherId = searchParams.get('teacher_id')
    const limit = searchParams.get('limit')

    let query = supabase
      .from('questions')
      .select('*')
      .order('id')

    if (categoryId) {
      query = query.eq('category_id', parseInt(categoryId))
    }

    if (teacherId) {
      query = query.eq('teacher_id', parseInt(teacherId))
    }

    if (limit) {
      query = query.limit(parseInt(limit))
    }

    const { data, error } = await query

    if (error) {
      throw error
    }

    return NextResponse.json({ questions: data })
  } catch (error) {
    console.error('Error fetching questions:', error)
    return NextResponse.json(
      { error: 'Failed to fetch questions' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { 
      category_id, 
      teacher_id, 
      question, 
      option_a, 
      option_b, 
      option_c, 
      option_d, 
      correct_option 
    } = body

    // Validate required fields
    if (!category_id || !teacher_id || !question || !option_a || 
        !option_b || !option_c || !option_d || !correct_option) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      )
    }

    // Validate correct_option
    if (!['A', 'B', 'C', 'D'].includes(correct_option)) {
      return NextResponse.json(
        { error: 'Invalid correct_option value' },
        { status: 400 }
      )
    }

    // Validate field lengths
    if (question.trim().length === 0 || question.length > 500) {
      return NextResponse.json(
        { error: 'Question must be 1-500 characters' },
        { status: 400 }
      )
    }

    const options = [option_a, option_b, option_c, option_d]
    for (const option of options) {
      if (option.trim().length === 0 || option.length > 255) {
        return NextResponse.json(
          { error: 'Each option must be 1-255 characters' },
          { status: 400 }
        )
      }
    }

    // Insert the question
    const { data, error } = await supabase
      .from('questions')
      .insert([
        {
          category_id,
          teacher_id,
          question: question.trim(),
          option_a: option_a.trim(),
          option_b: option_b.trim(),
          option_c: option_c.trim(),
          option_d: option_d.trim(),
          correct_option
        }
      ])
      .select()
      .single()

    if (error) {
      throw error
    }

    return NextResponse.json({ 
      message: 'Question created successfully',
      question: data 
    })
  } catch (error) {
    console.error('Error creating question:', error)
    return NextResponse.json(
      { error: 'Failed to create question' },
      { status: 500 }
    )
  }
}