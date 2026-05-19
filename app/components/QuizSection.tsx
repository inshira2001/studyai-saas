'use client'

import { useState } from 'react'
import { CheckCircle, XCircle, HelpCircle } from 'lucide-react'
import { cn } from '@/lib/utils'
import type { QuizQuestion } from '@/types'

interface QuizSectionProps {
  questions: QuizQuestion[]
}

type AnswerState = {
  selectedIndex: number
  isCorrect: boolean
}

const OPTION_LABELS = ['A', 'B', 'C', 'D']

export default function QuizSection({ questions }: QuizSectionProps) {
  const [answers, setAnswers] = useState<Map<number, AnswerState>>(new Map())
  const [showExplanation, setShowExplanation] = useState<Set<number>>(new Set())

  const totalAnswered = answers.size
  const correctCount = Array.from(answers.values()).filter((a) => a.isCorrect).length

  function selectAnswer(questionIndex: number, optionIndex: number) {
    // Already answered
    if (answers.has(questionIndex)) return

    const isCorrect = optionIndex === questions[questionIndex].correctIndex

    setAnswers((prev) => {
      const next = new Map(prev)
      next.set(questionIndex, { selectedIndex: optionIndex, isCorrect })
      return next
    })

    // Auto-show explanation
    setShowExplanation((prev) => new Set(prev).add(questionIndex))
  }

  function resetQuiz() {
    setAnswers(new Map())
    setShowExplanation(new Set())
  }

  return (
    <div className="bg-gray-900 border border-gray-800 rounded-2xl p-6 space-y-6">
      {/* Score Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-blue-500/10 border border-blue-500/20">
            <HelpCircle className="w-4 h-4 text-blue-400" />
            <span className="text-sm font-semibold text-blue-300">
              {correctCount} / {questions.length} correct
            </span>
          </div>
          {totalAnswered > 0 && (
            <span className="text-xs text-gray-500">
              {totalAnswered} of {questions.length} answered
            </span>
          )}
        </div>
        {totalAnswered > 0 && (
          <button
            onClick={resetQuiz}
            className="text-xs text-gray-500 hover:text-gray-300 transition-colors underline underline-offset-2"
          >
            Reset Quiz
          </button>
        )}
      </div>

      {/* Score progress bar */}
      {totalAnswered > 0 && (
        <div className="space-y-1.5">
          <div className="w-full h-2 bg-gray-800 rounded-full overflow-hidden">
            <div
              className="h-full bg-blue-500 rounded-full transition-all"
              style={{ width: `${(totalAnswered / questions.length) * 100}%` }}
            />
          </div>
        </div>
      )}

      {/* Questions */}
      <div className="space-y-8">
        {questions.map((question, qIndex) => {
          const answer = answers.get(qIndex)
          const isAnswered = answer !== undefined
          const showExp = showExplanation.has(qIndex)

          return (
            <div key={qIndex} className="space-y-3">
              {/* Question text */}
              <div className="flex items-start gap-3">
                <span className="flex-shrink-0 w-7 h-7 rounded-full bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-xs font-bold text-blue-400">
                  {qIndex + 1}
                </span>
                <p className="text-white font-medium leading-relaxed pt-0.5">
                  {question.question}
                </p>
              </div>

              {/* Options */}
              <div className="ml-10 space-y-2">
                {question.options.map((option, oIndex) => {
                  const isSelected = answer?.selectedIndex === oIndex
                  const isCorrectOption = oIndex === question.correctIndex
                  const label = OPTION_LABELS[oIndex]

                  let optionStyle = 'border-gray-700 bg-gray-800/50 text-gray-300 hover:border-blue-500/50 hover:bg-blue-500/5'

                  if (isAnswered) {
                    if (isCorrectOption) {
                      optionStyle = 'border-green-500/60 bg-green-500/10 text-green-300'
                    } else if (isSelected && !isCorrectOption) {
                      optionStyle = 'border-red-500/60 bg-red-500/10 text-red-300'
                    } else {
                      optionStyle = 'border-gray-700 bg-gray-800/30 text-gray-500 opacity-60'
                    }
                  }

                  return (
                    <button
                      key={oIndex}
                      onClick={() => selectAnswer(qIndex, oIndex)}
                      disabled={isAnswered}
                      className={cn(
                        'w-full flex items-center gap-3 px-4 py-3 rounded-lg border text-left transition-all text-sm',
                        optionStyle,
                        !isAnswered && 'cursor-pointer',
                        isAnswered && 'cursor-default'
                      )}
                    >
                      {/* Option letter */}
                      <span
                        className={cn(
                          'flex-shrink-0 w-6 h-6 rounded-full border text-xs font-bold flex items-center justify-center',
                          isAnswered && isCorrectOption
                            ? 'border-green-500 text-green-400'
                            : isAnswered && isSelected && !isCorrectOption
                            ? 'border-red-500 text-red-400'
                            : 'border-current'
                        )}
                      >
                        {label}
                      </span>

                      <span className="flex-1">{option}</span>

                      {/* Result icon */}
                      {isAnswered && isCorrectOption && (
                        <CheckCircle className="w-4 h-4 text-green-400 flex-shrink-0" />
                      )}
                      {isAnswered && isSelected && !isCorrectOption && (
                        <XCircle className="w-4 h-4 text-red-400 flex-shrink-0" />
                      )}
                    </button>
                  )
                })}
              </div>

              {/* Explanation */}
              {isAnswered && showExp && (
                <div className="ml-10 p-3 rounded-lg bg-gray-800/60 border border-gray-700">
                  <p className="text-xs font-semibold text-gray-400 mb-1">Explanation</p>
                  <p className="text-sm text-gray-300 leading-relaxed">
                    {question.explanation}
                  </p>
                </div>
              )}

              {/* Toggle explanation */}
              {isAnswered && (
                <button
                  onClick={() =>
                    setShowExplanation((prev) => {
                      const next = new Set(prev)
                      if (next.has(qIndex)) {
                        next.delete(qIndex)
                      } else {
                        next.add(qIndex)
                      }
                      return next
                    })
                  }
                  className="ml-10 text-xs text-gray-500 hover:text-gray-300 transition-colors"
                >
                  {showExp ? 'Hide explanation' : 'Show explanation'}
                </button>
              )}
            </div>
          )
        })}
      </div>

      {/* Final score when all answered */}
      {totalAnswered === questions.length && (
        <div
          className={cn(
            'p-4 rounded-xl border text-center',
            correctCount === questions.length
              ? 'bg-green-500/10 border-green-500/30 text-green-300'
              : correctCount >= questions.length / 2
              ? 'bg-blue-500/10 border-blue-500/30 text-blue-300'
              : 'bg-red-500/10 border-red-500/30 text-red-300'
          )}
        >
          <p className="font-bold text-lg">
            {correctCount === questions.length
              ? 'Perfect Score!'
              : correctCount >= Math.ceil(questions.length / 2)
              ? 'Good job!'
              : 'Keep studying!'}
          </p>
          <p className="text-sm mt-1 opacity-80">
            You scored {correctCount} out of {questions.length} (
            {Math.round((correctCount / questions.length) * 100)}%)
          </p>
        </div>
      )}
    </div>
  )
}
