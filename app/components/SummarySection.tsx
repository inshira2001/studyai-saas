'use client'

import { useState } from 'react'
import { Copy, Check, FileText } from 'lucide-react'
import { cn } from '@/lib/utils'

interface SummarySectionProps {
  summary: string[]
}

export default function SummarySection({ summary }: SummarySectionProps) {
  const [copied, setCopied] = useState(false)

  async function copyAll() {
    const text = summary
      .map((point, i) => `${i + 1}. ${point}`)
      .join('\n')

    try {
      await navigator.clipboard.writeText(text)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch {
      // Fallback for environments without clipboard API
      const textarea = document.createElement('textarea')
      textarea.value = text
      textarea.style.position = 'fixed'
      textarea.style.opacity = '0'
      document.body.appendChild(textarea)
      textarea.select()
      document.execCommand('copy')
      document.body.removeChild(textarea)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    }
  }

  return (
    <div className="bg-gray-900 border border-gray-800 rounded-2xl p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-2">
          <FileText className="w-4 h-4 text-green-400" />
          <span className="text-sm font-medium text-gray-300">
            {summary.length} key points
          </span>
        </div>
        <button
          onClick={copyAll}
          className={cn(
            'flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all border',
            copied
              ? 'bg-green-500/15 border-green-500/30 text-green-400'
              : 'bg-gray-800 border-gray-700 text-gray-400 hover:border-green-500/40 hover:text-green-400'
          )}
        >
          {copied ? (
            <>
              <Check className="w-3.5 h-3.5" />
              Copied!
            </>
          ) : (
            <>
              <Copy className="w-3.5 h-3.5" />
              Copy all
            </>
          )}
        </button>
      </div>

      {/* Summary bullets */}
      <ol className="space-y-3">
        {summary.map((point, index) => (
          <li
            key={index}
            className="flex items-start gap-4 group"
          >
            {/* Number + left border accent */}
            <div className="flex-shrink-0 flex flex-col items-center">
              <div className="w-7 h-7 rounded-full bg-green-500/10 border border-green-500/20 flex items-center justify-center">
                <span className="text-xs font-bold text-green-400">
                  {index + 1}
                </span>
              </div>
              {index < summary.length - 1 && (
                <div className="w-px flex-1 mt-2 bg-green-500/10 min-h-[8px]" />
              )}
            </div>

            {/* Point text */}
            <div
              className={cn(
                'flex-1 pb-3 border-l-2 pl-4 transition-colors',
                'border-green-500/20 group-hover:border-green-500/40'
              )}
            >
              <p className="text-gray-200 text-sm leading-relaxed">{point}</p>
            </div>
          </li>
        ))}
      </ol>

      {/* Copy button at the bottom too for long summaries */}
      {summary.length > 4 && (
        <div className="mt-6 pt-4 border-t border-gray-800 flex justify-center">
          <button
            onClick={copyAll}
            className={cn(
              'flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-medium transition-all border',
              copied
                ? 'bg-green-500/15 border-green-500/30 text-green-400'
                : 'bg-gray-800 border-gray-700 text-gray-400 hover:border-green-500/40 hover:text-green-400'
            )}
          >
            {copied ? (
              <>
                <Check className="w-4 h-4" />
                Copied to clipboard!
              </>
            ) : (
              <>
                <Copy className="w-4 h-4" />
                Copy all {summary.length} points
              </>
            )}
          </button>
        </div>
      )}
    </div>
  )
}
