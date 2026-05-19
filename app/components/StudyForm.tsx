'use client'

import { useState } from 'react'
import { BookOpen, HelpCircle, FileText, Loader2, Zap } from 'lucide-react'
import { cn } from '@/lib/utils'
import type { GenerateRequest } from '@/types'

interface StudyFormProps {
  onSubmit: (text: string, options: GenerateRequest['options']) => void
  isLoading: boolean
}

const MAX_CHARS = 5000

export default function StudyForm({ onSubmit, isLoading }: StudyFormProps) {
  const [text, setText] = useState('')
  const [options, setOptions] = useState<GenerateRequest['options']>({
    flashcards: true,
    quiz: false,
    summary: false,
  })

  const charCount = text.length
  const isOverLimit = charCount > MAX_CHARS
  const hasOptions = options.flashcards || options.quiz || options.summary
  const canSubmit = text.trim().length > 0 && hasOptions && !isOverLimit && !isLoading

  function toggleOption(key: keyof GenerateRequest['options']) {
    setOptions((prev) => ({ ...prev, [key]: !prev[key] }))
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!canSubmit) return
    onSubmit(text.trim(), options)
  }

  const studyModes = [
    {
      key: 'flashcards' as const,
      label: 'Flashcards',
      description: 'Flip cards to test recall',
      icon: BookOpen,
      color: 'purple',
      activeClasses:
        'border-purple-500 bg-purple-500/10 text-purple-300',
      inactiveClasses:
        'border-gray-700 bg-gray-900 text-gray-400 hover:border-gray-600',
    },
    {
      key: 'quiz' as const,
      label: 'Quiz Questions',
      description: 'Multiple choice with scoring',
      icon: HelpCircle,
      color: 'blue',
      activeClasses:
        'border-blue-500 bg-blue-500/10 text-blue-300',
      inactiveClasses:
        'border-gray-700 bg-gray-900 text-gray-400 hover:border-gray-600',
    },
    {
      key: 'summary' as const,
      label: 'Summary',
      description: 'Key bullet points',
      icon: FileText,
      color: 'green',
      activeClasses:
        'border-green-500 bg-green-500/10 text-green-300',
      inactiveClasses:
        'border-gray-700 bg-gray-900 text-gray-400 hover:border-gray-600',
    },
  ]

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Text input area */}
      <div className="space-y-2">
        <label
          htmlFor="study-text"
          className="block text-sm font-medium text-gray-300"
        >
          Your Study Material
        </label>
        <div className="relative">
          <textarea
            id="study-text"
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder="Paste your notes, chapter text, or study material here..."
            rows={8}
            disabled={isLoading}
            className={cn(
              'w-full min-h-[200px] px-4 py-3 rounded-xl bg-gray-900 border text-white placeholder-gray-600',
              'text-sm leading-relaxed resize-y transition-colors',
              'focus:outline-none focus:ring-2 focus:ring-purple-500/50',
              isOverLimit
                ? 'border-red-500/60 focus:ring-red-500/50'
                : 'border-gray-700 focus:border-purple-500/60',
              isLoading && 'opacity-60 cursor-not-allowed'
            )}
          />
        </div>
        {/* Character count */}
        <div className="flex justify-between items-center text-xs">
          <span className="text-gray-600">
            Paste any text — lecture notes, textbook chapters, articles
          </span>
          <span
            className={cn(
              'font-mono tabular-nums',
              isOverLimit
                ? 'text-red-400'
                : charCount > MAX_CHARS * 0.85
                ? 'text-yellow-400'
                : 'text-gray-500'
            )}
          >
            {charCount.toLocaleString()} / {MAX_CHARS.toLocaleString()} characters
          </span>
        </div>
        {isOverLimit && (
          <p className="text-xs text-red-400">
            Text exceeds {MAX_CHARS.toLocaleString()} character limit. Please trim it down.
          </p>
        )}
      </div>

      {/* Study mode selection */}
      <div className="space-y-3">
        <label className="block text-sm font-medium text-gray-300">
          What to Generate
        </label>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {studyModes.map((mode) => {
            const isActive = options[mode.key]
            const Icon = mode.icon

            return (
              <button
                key={mode.key}
                type="button"
                onClick={() => toggleOption(mode.key)}
                disabled={isLoading}
                className={cn(
                  'relative flex items-start gap-3 p-4 rounded-xl border transition-all text-left',
                  'focus:outline-none focus:ring-2 focus:ring-purple-500/50',
                  isActive ? mode.activeClasses : mode.inactiveClasses,
                  isLoading && 'opacity-60 cursor-not-allowed'
                )}
              >
                {/* Checkbox indicator */}
                <div
                  className={cn(
                    'mt-0.5 w-4 h-4 rounded border-2 flex items-center justify-center flex-shrink-0 transition-colors',
                    isActive
                      ? mode.color === 'purple'
                        ? 'bg-purple-500 border-purple-500'
                        : mode.color === 'blue'
                        ? 'bg-blue-500 border-blue-500'
                        : 'bg-green-500 border-green-500'
                      : 'border-gray-600'
                  )}
                >
                  {isActive && (
                    <svg className="w-2.5 h-2.5 text-white" viewBox="0 0 10 8" fill="none">
                      <path
                        d="M1 4L3.5 6.5L9 1"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                  )}
                </div>

                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <Icon className="w-4 h-4" />
                    <span className="text-sm font-medium">{mode.label}</span>
                  </div>
                  <p className="text-xs mt-0.5 opacity-70">{mode.description}</p>
                </div>
              </button>
            )
          })}
        </div>
        {!hasOptions && (
          <p className="text-xs text-yellow-400">
            Select at least one option to generate study materials
          </p>
        )}
      </div>

      {/* Submit button */}
      <button
        type="submit"
        disabled={!canSubmit}
        className={cn(
          'w-full py-4 rounded-xl font-semibold text-base transition-all flex items-center justify-center gap-2',
          canSubmit
            ? 'bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-500 hover:to-blue-500 text-white shadow-lg shadow-purple-500/25 hover:shadow-purple-500/40 hover:-translate-y-0.5 transform'
            : 'bg-gray-800 text-gray-500 cursor-not-allowed'
        )}
      >
        {isLoading ? (
          <>
            <Loader2 className="w-5 h-5 animate-spin" />
            Generating...
          </>
        ) : (
          <>
            <Zap className="w-5 h-5" />
            Study Now!
          </>
        )}
      </button>
    </form>
  )
}
