'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Brain, ArrowLeft } from 'lucide-react'
import StudyForm from '@/components/StudyForm'
import FlashcardDeck from '@/components/FlashcardDeck'
import QuizSection from '@/components/QuizSection'
import SummarySection from '@/components/SummarySection'
import type { StudyOutput, GenerateRequest } from '@/types'

export default function StudyPage() {
  const [isLoading, setIsLoading] = useState(false)
  const [results, setResults] = useState<StudyOutput | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [selectedOptions, setSelectedOptions] = useState<{
    flashcards: boolean
    quiz: boolean
    summary: boolean
  } | null>(null)

  async function handleSubmit(
    text: string,
    options: GenerateRequest['options']
  ) {
    setIsLoading(true)
    setError(null)
    setResults(null)
    setSelectedOptions(options)

    try {
      const response = await fetch('/api/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text, options }),
      })

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error: 'Unknown error' }))
        throw new Error(errorData.error ?? `Request failed with status ${response.status}`)
      }

      const data: StudyOutput = await response.json()
      setResults(data)

      // Scroll to results
      setTimeout(() => {
        document.getElementById('results')?.scrollIntoView({ behavior: 'smooth', block: 'start' })
      }, 100)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }

  const hasResults =
    results &&
    (
      (results.flashcards && results.flashcards.length > 0) ||
      (results.quiz && results.quiz.length > 0) ||
      (results.summary && results.summary.length > 0)
    )

  return (
    <main className="min-h-screen bg-gray-950 text-white">
      {/* Navigation */}
      <nav className="border-b border-gray-800 bg-gray-950/80 backdrop-blur-sm sticky top-0 z-50">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 py-4 flex items-center gap-4">
          <Link
            href="/"
            className="flex items-center gap-1.5 text-gray-400 hover:text-white transition-colors text-sm"
          >
            <ArrowLeft className="w-4 h-4" />
            Back
          </Link>
          <div className="flex items-center gap-2 ml-2">
            <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-purple-500 to-blue-600 flex items-center justify-center">
              <Brain className="w-4 h-4 text-white" />
            </div>
            <span className="text-lg font-bold bg-gradient-to-r from-purple-400 to-blue-400 bg-clip-text text-transparent">
              StudyAI
            </span>
          </div>
        </div>
      </nav>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 py-10">
        {/* Page header */}
        <div className="mb-8 text-center">
          <h1 className="text-3xl font-bold mb-2">Generate Study Materials</h1>
          <p className="text-gray-400">
            Paste your notes below, choose what to generate, and click Study Now
          </p>
        </div>

        {/* Study Form */}
        <StudyForm onSubmit={handleSubmit} isLoading={isLoading} />

        {/* Error state */}
        {error && (
          <div className="mt-6 p-4 rounded-xl bg-red-500/10 border border-red-500/30 text-red-400 text-sm">
            <strong className="font-semibold">Error: </strong>
            {error}
          </div>
        )}

        {/* Loading state */}
        {isLoading && (
          <div className="mt-12 flex flex-col items-center gap-4 text-gray-400">
            <div className="relative w-14 h-14">
              <div className="absolute inset-0 rounded-full border-4 border-gray-800" />
              <div className="absolute inset-0 rounded-full border-4 border-t-purple-500 animate-spin" />
            </div>
            <div className="text-center">
              <p className="font-medium text-white">Generating your study materials...</p>
              <p className="text-sm mt-1">Groq AI is processing your notes</p>
            </div>
          </div>
        )}

        {/* Results */}
        {hasResults && !isLoading && (
          <div id="results" className="mt-12 space-y-8">
            <div className="text-center">
              <h2 className="text-2xl font-bold mb-1">Your Study Materials</h2>
              <p className="text-gray-400 text-sm">Click on cards, answer questions, and review your summary</p>
            </div>

            {/* Flashcards */}
            {selectedOptions?.flashcards && results.flashcards && results.flashcards.length > 0 && (
              <section>
                <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-purple-400 inline-block" />
                  Flashcards
                  <span className="text-sm font-normal text-gray-500">
                    ({results.flashcards.length} cards)
                  </span>
                </h3>
                <FlashcardDeck flashcards={results.flashcards} />
              </section>
            )}

            {/* Quiz */}
            {selectedOptions?.quiz && results.quiz && results.quiz.length > 0 && (
              <section>
                <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-blue-400 inline-block" />
                  Quiz Questions
                  <span className="text-sm font-normal text-gray-500">
                    ({results.quiz.length} questions)
                  </span>
                </h3>
                <QuizSection questions={results.quiz} />
              </section>
            )}

            {/* Summary */}
            {selectedOptions?.summary && results.summary && results.summary.length > 0 && (
              <section>
                <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-green-400 inline-block" />
                  Summary
                  <span className="text-sm font-normal text-gray-500">
                    ({results.summary.length} key points)
                  </span>
                </h3>
                <SummarySection summary={results.summary} />
              </section>
            )}

            {/* Generate again button */}
            <div className="text-center pt-4 pb-8">
              <button
                onClick={() => {
                  setResults(null)
                  setSelectedOptions(null)
                  window.scrollTo({ top: 0, behavior: 'smooth' })
                }}
                className="px-6 py-3 rounded-xl border border-gray-700 hover:border-gray-500 text-gray-300 hover:text-white transition-all text-sm font-medium"
              >
                Generate New Materials
              </button>
            </div>
          </div>
        )}
      </div>
    </main>
  )
}
