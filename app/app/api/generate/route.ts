import { NextRequest, NextResponse } from 'next/server'
import { getGroqClient } from '@/lib/groq'
import type { GenerateRequest, StudyOutput } from '@/types'

export const dynamic = 'force-dynamic'

const MAX_TEXT_LENGTH = 5000

export async function POST(request: NextRequest) {
  let body: GenerateRequest

  try {
    body = await request.json()
  } catch {
    return NextResponse.json(
      { error: 'Invalid JSON in request body' },
      { status: 400 }
    )
  }

  const { text, options } = body

  // Validate input
  if (!text || typeof text !== 'string' || text.trim().length === 0) {
    return NextResponse.json(
      { error: 'Text is required and must not be empty' },
      { status: 400 }
    )
  }

  if (!options || (!options.flashcards && !options.quiz && !options.summary)) {
    return NextResponse.json(
      { error: 'At least one study option must be selected' },
      { status: 400 }
    )
  }

  const trimmedText = text.trim().slice(0, MAX_TEXT_LENGTH)

  // Build the output schema description based on selected options
  const outputParts: string[] = []

  if (options.flashcards) {
    outputParts.push(
      `"flashcards": an array of 5 to 10 objects, each with exactly two string fields: "question" and "answer". The question should test understanding of a key concept. The answer should be thorough but concise.`
    )
  }

  if (options.quiz) {
    outputParts.push(
      `"quiz": an array of exactly 5 objects, each with: "question" (string), "options" (array of exactly 4 strings labeled A, B, C, D — do NOT include the letter prefix, just the answer text), "correctIndex" (integer 0-3 where 0=A, 1=B, 2=C, 3=D), "explanation" (string explaining why the correct answer is right).`
    )
  }

  if (options.summary) {
    outputParts.push(
      `"summary": an array of 5 to 8 strings, each being a concise bullet point capturing a key idea or fact from the material. Do not include bullet symbols or numbering — just the text.`
    )
  }

  const systemPrompt = `You are a study material generator. You MUST respond with ONLY a valid JSON object — no markdown, no code blocks, no backticks, no explanations, no preamble. Just raw JSON that starts with { and ends with }. Any deviation from pure JSON will cause a system failure.`

  const userPrompt = `Generate study materials from the following text.

OUTPUT FORMAT: Return ONLY a JSON object with these fields:
${outputParts.join('\n')}

Do NOT include keys for unselected modes. Do NOT wrap in markdown or code blocks. Return ONLY the JSON object.

TEXT TO STUDY:
${trimmedText}`

  try {
    const completion = await getGroqClient().chat.completions.create({
      model: 'llama-3.1-8b-instant',
      temperature: 0.3,
      max_tokens: 4096,
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userPrompt },
      ],
    })

    const rawContent = completion.choices[0]?.message?.content

    if (!rawContent) {
      return NextResponse.json(
        { error: 'AI returned an empty response. Please try again.' },
        { status: 500 }
      )
    }

    // Strip any accidental markdown code fences the model may have added
    let jsonString = rawContent.trim()

    // Remove ```json ... ``` or ``` ... ``` wrappers if present
    const fenceMatch = jsonString.match(/^```(?:json)?\s*([\s\S]*?)\s*```$/)
    if (fenceMatch) {
      jsonString = fenceMatch[1].trim()
    }

    // Find first { and last } to extract just the JSON object
    const firstBrace = jsonString.indexOf('{')
    const lastBrace = jsonString.lastIndexOf('}')
    if (firstBrace !== -1 && lastBrace !== -1 && lastBrace > firstBrace) {
      jsonString = jsonString.slice(firstBrace, lastBrace + 1)
    }

    let parsed: Partial<StudyOutput>
    try {
      parsed = JSON.parse(jsonString)
    } catch {
      console.error('JSON parse failed. Raw AI content:', rawContent)
      return NextResponse.json(
        {
          error:
            'AI returned malformed JSON. Please try again — this occasionally happens with complex inputs.',
        },
        { status: 500 }
      )
    }

    // Sanitize and normalize the response
    const output: Partial<StudyOutput> = {}

    if (options.flashcards && Array.isArray(parsed.flashcards)) {
      output.flashcards = parsed.flashcards
        .filter(
          (f) =>
            f &&
            typeof f.question === 'string' &&
            typeof f.answer === 'string'
        )
        .slice(0, 10)
    } else if (options.flashcards) {
      output.flashcards = []
    }

    if (options.quiz && Array.isArray(parsed.quiz)) {
      output.quiz = parsed.quiz
        .filter(
          (q) =>
            q &&
            typeof q.question === 'string' &&
            Array.isArray(q.options) &&
            q.options.length === 4 &&
            typeof q.correctIndex === 'number' &&
            q.correctIndex >= 0 &&
            q.correctIndex <= 3 &&
            typeof q.explanation === 'string'
        )
        .slice(0, 5)
    } else if (options.quiz) {
      output.quiz = []
    }

    if (options.summary && Array.isArray(parsed.summary)) {
      output.summary = parsed.summary
        .filter((s) => typeof s === 'string' && s.trim().length > 0)
        .slice(0, 8)
    } else if (options.summary) {
      output.summary = []
    }

    return NextResponse.json(output, {
      headers: { 'Content-Type': 'application/json' },
    })
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Unknown error'
    console.error('Groq API error:', message)

    // Surface a user-friendly message while logging the real error
    const isApiKeyError =
      message.toLowerCase().includes('api key') ||
      message.toLowerCase().includes('401') ||
      message.toLowerCase().includes('unauthorized')

    return NextResponse.json(
      {
        error: isApiKeyError
          ? 'API key is invalid or missing. Check your GROQ_API_KEY environment variable.'
          : 'Failed to generate study materials. Please try again in a moment.',
      },
      { status: 500 }
    )
  }
}
