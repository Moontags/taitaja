import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

export type Teacher = {
  id: number
  username: string
  password_hash: string
}

export type Category = {
  id: number
  name: string
  teacher_id: number
}

export type Question = {
  id: number
  category_id: number
  teacher_id: number
  question: string
  option_a: string
  option_b: string
  option_c: string
  option_d: string
  correct_option: 'A' | 'B' | 'C' | 'D'
}

export type Score = {
  id: number
  player_name: string
  score: number
  total_questions: number
  category_id: number
  created_at: string
}