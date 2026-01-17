import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { title, keywords } = body

    if (!title) {
      return NextResponse.json({ error: 'Title is required' }, { status: 400 })
    }

    const apiKey = process.env.GEMINI_API_KEY || process.env.OPENAI_API_KEY
    const model = process.env.GEMINI_MODEL || process.env.OPENAI_MODEL || 'gpt-4o-mini'

    if (!apiKey) {
      return NextResponse.json({ error: 'Generation API key not configured' }, { status: 501 })
    }

    // Compose a prompt for generating viral SEO titles
    const prompt = `You are an SEO expert. Generate 3 concise, clickable, SEO-optimized YouTube titles (short, emotional, keyword-rich) for the following video: "${title}". Use the keywords if provided: ${keywords ? keywords.join(', ') : 'none'}. Return a JSON array of titles only.`

    // Call the external completion API. This is a generic OpenAI-compatible request.
    const response = await fetch('https://api.openai.com/v1/responses', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model,
        input: prompt,
        max_tokens: 200,
        temperature: 0.8,
      }),
    })

    if (!response.ok) {
      const text = await response.text()
      console.error('Generation API error:', text)
      return NextResponse.json({ error: 'Generation failed' }, { status: 502 })
    }

    const json = await response.json()

    // Attempt to extract the generated text. The structure may vary by provider.
    let text = ''
    if (json.output) {
      if (Array.isArray(json.output) && json.output[0]?.content) {
        // Newer "responses" API
        const parts = json.output.map((o: any) => (o.content || '')).join('\n')
        text = parts
      } else if (typeof json.output === 'string') {
        text = json.output
      }
    }

    // Fallback: try other common fields
    if (!text && json.choices && json.choices[0]?.message?.content) {
      text = json.choices[0].message.content
    }

    // Try to parse JSON array from text
    let titles: string[] = []
    try {
      // Some responses may be plain text with lines; try to extract quoted lines
      const possibleJson = text.trim()
      if (possibleJson.startsWith('[')) {
        titles = JSON.parse(possibleJson)
      } else {
        // Split by new lines and remove prefixes
        titles = possibleJson.split(/\r?\n/).map((l: string) => l.replace(/^\W*\d+\W*/,'').trim()).filter(Boolean)
      }
    } catch (err) {
      // As a last resort, return the whole text as a single suggestion
      titles = [text.trim()].filter(Boolean)
    }

    return NextResponse.json({ titles })
  } catch (err: any) {
    console.error('Error in /api/video/generate:', err)
    return NextResponse.json({ error: err.message || 'Internal error' }, { status: 500 })
  }
}
