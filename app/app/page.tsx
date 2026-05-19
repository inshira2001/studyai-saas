import Link from 'next/link'
import { BookOpen, HelpCircle, FileText, Zap, Brain, Target } from 'lucide-react'

export default function LandingPage() {
  return (
    <main className="min-h-screen bg-gray-950 text-white">
      {/* Navigation */}
      <nav className="border-b border-gray-800 bg-gray-950/80 backdrop-blur-sm sticky top-0 z-50">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-purple-500 to-blue-600 flex items-center justify-center">
              <Brain className="w-5 h-5 text-white" />
            </div>
            <span className="text-xl font-bold bg-gradient-to-r from-purple-400 to-blue-400 bg-clip-text text-transparent">
              StudyAI
            </span>
          </div>
          <Link
            href="/study"
            className="px-4 py-2 rounded-lg bg-purple-600 hover:bg-purple-500 transition-colors text-sm font-medium"
          >
            Start Studying
          </Link>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="max-w-6xl mx-auto px-4 sm:px-6 py-24 text-center">
        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-purple-500/10 border border-purple-500/20 text-purple-400 text-sm font-medium mb-8">
          <Zap className="w-4 h-4" />
          Powered by Groq AI — Ultra-fast inference
        </div>

        <h1 className="text-5xl sm:text-6xl lg:text-7xl font-extrabold tracking-tight mb-6">
          <span className="bg-gradient-to-r from-purple-400 via-pink-400 to-blue-400 bg-clip-text text-transparent">
            Study Smarter
          </span>
          <br />
          <span className="text-white">with AI</span>
        </h1>

        <p className="text-xl text-gray-400 max-w-2xl mx-auto mb-10 leading-relaxed">
          Paste your notes or textbook text and instantly generate{' '}
          <span className="text-purple-400 font-medium">flashcards</span>,{' '}
          <span className="text-blue-400 font-medium">quiz questions</span>, and{' '}
          <span className="text-green-400 font-medium">summaries</span> — powered by
          state-of-the-art AI.
        </p>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
          <Link
            href="/study"
            className="px-8 py-4 rounded-xl bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-500 hover:to-blue-500 transition-all text-lg font-semibold shadow-lg shadow-purple-500/25 hover:shadow-purple-500/40 hover:-translate-y-0.5 transform"
          >
            Start Studying — It&apos;s Free
          </Link>
          <a
            href="#features"
            className="px-8 py-4 rounded-xl border border-gray-700 hover:border-gray-600 text-gray-300 hover:text-white transition-all text-lg font-medium"
          >
            See How It Works
          </a>
        </div>

        {/* Stats row */}
        <div className="mt-16 grid grid-cols-3 gap-8 max-w-lg mx-auto">
          {[
            { value: '< 3s', label: 'Generation time' },
            { value: '100%', label: 'Free to use' },
            { value: '3', label: 'Study modes' },
          ].map((stat) => (
            <div key={stat.label} className="text-center">
              <div className="text-2xl font-bold text-white">{stat.value}</div>
              <div className="text-sm text-gray-500 mt-1">{stat.label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="max-w-6xl mx-auto px-4 sm:px-6 py-20">
        <h2 className="text-3xl font-bold text-center mb-4">Three Powerful Study Modes</h2>
        <p className="text-gray-400 text-center mb-12 max-w-xl mx-auto">
          Choose one, two, or all three — StudyAI generates exactly what you need from your material.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Flashcards */}
          <div className="bg-gray-900 border border-gray-800 rounded-2xl p-6 hover:border-purple-500/50 transition-all hover:-translate-y-1 transform">
            <div className="w-12 h-12 rounded-xl bg-purple-500/10 flex items-center justify-center mb-4">
              <BookOpen className="w-6 h-6 text-purple-400" />
            </div>
            <h3 className="text-lg font-semibold mb-2">Flashcards</h3>
            <p className="text-gray-400 text-sm leading-relaxed">
              Interactive flip cards with questions on the front and detailed answers on the back.
              Navigate through your deck at your own pace.
            </p>
            <div className="mt-4 flex items-center gap-2 text-xs text-purple-400">
              <div className="w-1.5 h-1.5 rounded-full bg-purple-400" />
              5–10 cards per generation
            </div>
          </div>

          {/* Quiz */}
          <div className="bg-gray-900 border border-gray-800 rounded-2xl p-6 hover:border-blue-500/50 transition-all hover:-translate-y-1 transform">
            <div className="w-12 h-12 rounded-xl bg-blue-500/10 flex items-center justify-center mb-4">
              <HelpCircle className="w-6 h-6 text-blue-400" />
            </div>
            <h3 className="text-lg font-semibold mb-2">Quiz Questions</h3>
            <p className="text-gray-400 text-sm leading-relaxed">
              Multiple-choice questions with instant feedback. See explanations for every answer
              and track your score in real time.
            </p>
            <div className="mt-4 flex items-center gap-2 text-xs text-blue-400">
              <div className="w-1.5 h-1.5 rounded-full bg-blue-400" />
              5 questions with A/B/C/D options
            </div>
          </div>

          {/* Summary */}
          <div className="bg-gray-900 border border-gray-800 rounded-2xl p-6 hover:border-green-500/50 transition-all hover:-translate-y-1 transform">
            <div className="w-12 h-12 rounded-xl bg-green-500/10 flex items-center justify-center mb-4">
              <FileText className="w-6 h-6 text-green-400" />
            </div>
            <h3 className="text-lg font-semibold mb-2">Smart Summary</h3>
            <p className="text-gray-400 text-sm leading-relaxed">
              Concise bullet-point summaries that extract the key ideas from your material.
              Copy with one click for quick review.
            </p>
            <div className="mt-4 flex items-center gap-2 text-xs text-green-400">
              <div className="w-1.5 h-1.5 rounded-full bg-green-400" />
              5–8 key bullet points
            </div>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="max-w-6xl mx-auto px-4 sm:px-6 py-20 border-t border-gray-800">
        <h2 className="text-3xl font-bold text-center mb-4">How It Works</h2>
        <p className="text-gray-400 text-center mb-12">Three steps to study-ready materials</p>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {[
            {
              step: '01',
              icon: <FileText className="w-6 h-6 text-purple-400" />,
              title: 'Paste Your Notes',
              desc: 'Copy any text — lecture notes, textbook chapters, articles. Up to 5,000 characters.',
            },
            {
              step: '02',
              icon: <Target className="w-6 h-6 text-blue-400" />,
              title: 'Choose Your Mode',
              desc: 'Select flashcards, quiz questions, or summary — or all three at once.',
            },
            {
              step: '03',
              icon: <Zap className="w-6 h-6 text-green-400" />,
              title: 'Study Instantly',
              desc: 'Groq AI generates your materials in under 3 seconds. Start studying right away.',
            },
          ].map((item) => (
            <div key={item.step} className="relative pl-8">
              <div className="absolute left-0 top-0 text-5xl font-black text-gray-800 select-none leading-none">
                {item.step}
              </div>
              <div className="pt-8">
                <div className="mb-3">{item.icon}</div>
                <h3 className="text-lg font-semibold mb-2">{item.title}</h3>
                <p className="text-gray-400 text-sm leading-relaxed">{item.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="max-w-6xl mx-auto px-4 sm:px-6 py-20">
        <div className="bg-gradient-to-r from-purple-900/40 to-blue-900/40 border border-purple-500/20 rounded-3xl p-12 text-center">
          <h2 className="text-3xl font-bold mb-4">Ready to study smarter?</h2>
          <p className="text-gray-400 mb-8 max-w-md mx-auto">
            No sign-up required. No credit card. Just paste your notes and go.
          </p>
          <Link
            href="/study"
            className="inline-block px-10 py-4 rounded-xl bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-500 hover:to-blue-500 transition-all text-lg font-semibold shadow-lg shadow-purple-500/25"
          >
            Start Studying Now
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-gray-800 py-8">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded bg-gradient-to-br from-purple-500 to-blue-600 flex items-center justify-center">
              <Brain className="w-4 h-4 text-white" />
            </div>
            <span className="text-sm font-semibold text-gray-400">StudyAI</span>
          </div>
          <p className="text-xs text-gray-600">
            Built with Next.js, Groq AI, and deployed on AWS ECS
          </p>
        </div>
      </footer>
    </main>
  )
}
