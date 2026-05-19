'use client'

import { useState } from 'react'
import { ChevronLeft, ChevronRight, RotateCcw } from 'lucide-react'
import { cn } from '@/lib/utils'
import type { Flashcard } from '@/types'

interface FlashcardDeckProps {
  flashcards: Flashcard[]
}

export default function FlashcardDeck({ flashcards }: FlashcardDeckProps) {
  const [currentIndex, setCurrentIndex] = useState(0)
  const [isFlipped, setIsFlipped] = useState(false)
  const [completedCards, setCompletedCards] = useState<Set<number>>(new Set())

  const total = flashcards.length
  const current = flashcards[currentIndex]

  function flipCard() {
    setIsFlipped((prev) => !prev)
    if (!isFlipped) {
      setCompletedCards((prev) => new Set(prev).add(currentIndex))
    }
  }

  function goToPrevious() {
    if (currentIndex === 0) return
    setCurrentIndex((i) => i - 1)
    setIsFlipped(false)
  }

  function goToNext() {
    if (currentIndex === total - 1) return
    setCurrentIndex((i) => i + 1)
    setIsFlipped(false)
  }

  function resetDeck() {
    setCurrentIndex(0)
    setIsFlipped(false)
    setCompletedCards(new Set())
  }

  if (!current) return null

  return (
    <div className="bg-gray-900 border border-gray-800 rounded-2xl p-6">
      {/* Progress bar and counter */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <span className="text-sm font-medium text-gray-300">
            Card{' '}
            <span className="text-purple-400 font-bold">{currentIndex + 1}</span>
            {' '}of{' '}
            <span className="text-white font-bold">{total}</span>
          </span>
          <div className="flex gap-1">
            {flashcards.map((_, i) => (
              <button
                key={i}
                onClick={() => {
                  setCurrentIndex(i)
                  setIsFlipped(false)
                }}
                className={cn(
                  'w-2 h-2 rounded-full transition-all',
                  i === currentIndex
                    ? 'bg-purple-500 w-4'
                    : completedCards.has(i)
                    ? 'bg-purple-700'
                    : 'bg-gray-700'
                )}
              />
            ))}
          </div>
        </div>
        <button
          onClick={resetDeck}
          className="flex items-center gap-1.5 text-xs text-gray-500 hover:text-gray-300 transition-colors"
        >
          <RotateCcw className="w-3.5 h-3.5" />
          Reset
        </button>
      </div>

      {/* Flip hint */}
      <p className="text-xs text-gray-600 text-center mb-4">
        {isFlipped ? 'Showing answer — click to see question' : 'Click the card to reveal the answer'}
      </p>

      {/* 3D Flip Card */}
      <div
        className="perspective cursor-pointer mb-6"
        onClick={flipCard}
        style={{ perspective: '1000px' }}
      >
        <div
          className="relative w-full transition-transform duration-500 ease-in-out"
          style={{
            transformStyle: 'preserve-3d',
            transform: isFlipped ? 'rotateY(180deg)' : 'rotateY(0deg)',
            minHeight: '200px',
          }}
        >
          {/* Front — Question */}
          <div
            className="absolute inset-0 w-full rounded-xl bg-gradient-to-br from-purple-900/30 to-gray-900 border border-purple-500/30 p-6 flex flex-col items-center justify-center"
            style={{ backfaceVisibility: 'hidden', WebkitBackfaceVisibility: 'hidden' }}
          >
            <div className="text-xs font-medium text-purple-400 uppercase tracking-widest mb-4">
              Question
            </div>
            <p className="text-white text-center text-lg font-medium leading-relaxed">
              {current.question}
            </p>
          </div>

          {/* Back — Answer */}
          <div
            className="absolute inset-0 w-full rounded-xl bg-gradient-to-br from-blue-900/30 to-gray-900 border border-blue-500/30 p-6 flex flex-col items-center justify-center"
            style={{
              backfaceVisibility: 'hidden',
              WebkitBackfaceVisibility: 'hidden',
              transform: 'rotateY(180deg)',
            }}
          >
            <div className="text-xs font-medium text-blue-400 uppercase tracking-widest mb-4">
              Answer
            </div>
            <p className="text-white text-center text-base leading-relaxed">
              {current.answer}
            </p>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <div className="flex items-center justify-between">
        <button
          onClick={goToPrevious}
          disabled={currentIndex === 0}
          className={cn(
            'flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all',
            currentIndex === 0
              ? 'text-gray-700 cursor-not-allowed'
              : 'text-gray-300 hover:text-white hover:bg-gray-800'
          )}
        >
          <ChevronLeft className="w-4 h-4" />
          Previous
        </button>

        <div className="flex flex-col items-center gap-1">
          <div className="text-xs text-gray-600">
            {completedCards.size} / {total} reviewed
          </div>
          <div className="w-24 h-1.5 bg-gray-800 rounded-full overflow-hidden">
            <div
              className="h-full bg-purple-500 rounded-full transition-all"
              style={{ width: `${(completedCards.size / total) * 100}%` }}
            />
          </div>
        </div>

        <button
          onClick={goToNext}
          disabled={currentIndex === total - 1}
          className={cn(
            'flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all',
            currentIndex === total - 1
              ? 'text-gray-700 cursor-not-allowed'
              : 'text-gray-300 hover:text-white hover:bg-gray-800'
          )}
        >
          Next
          <ChevronRight className="w-4 h-4" />
        </button>
      </div>

      {/* Completion message */}
      {completedCards.size === total && (
        <div className="mt-4 p-3 rounded-lg bg-purple-500/10 border border-purple-500/20 text-center">
          <p className="text-purple-400 text-sm font-medium">
            You&apos;ve reviewed all {total} cards!
          </p>
        </div>
      )}
    </div>
  )
}
