export interface Flashcard {
  question: string
  answer: string
}

export interface QuizQuestion {
  question: string
  options: string[]
  correctIndex: number
  explanation: string
}

export interface StudyOutput {
  flashcards: Flashcard[]
  quiz: QuizQuestion[]
  summary: string[]
}

export interface GenerateRequest {
  text: string
  options: {
    flashcards: boolean
    quiz: boolean
    summary: boolean
  }
}
