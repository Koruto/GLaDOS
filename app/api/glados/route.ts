import Groq, { RateLimitError } from 'groq-sdk';
import { NextRequest, NextResponse } from 'next/server';
import { SYSTEM_PROMPT } from './systemPrompt';

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

const MODELS = [
  'llama-3.3-70b-versatile',           // primary, best quality
  'moonshotai/kimi-k2-instruct-0905',  // 60 RPM, good fallback
  'moonshotai/kimi-k2-instruct',        // same model, extra quota
  'qwen/qwen3-32b',                     // 60 RPM, solid instruction following
  'meta-llama/llama-4-scout-17b-16e-instruct', // last resort, weaker but alive
];

// NOTE: this index resets on every cold start (serverless caveat).
// Good enough for rate limit rotation within a session.
let modelIndex = 0;

async function callWithFallback(
  systemContent: string,
  messages: unknown[]
): Promise<{ raw: string; modelUsed: string }> {
  for (let attempt = 0; attempt < MODELS.length; attempt++) {
    const model = MODELS[(modelIndex + attempt) % MODELS.length];
    try {
      const completion = await groq.chat.completions.create({
        model,
        messages: [
          { role: 'system', content: systemContent },
          ...(messages as any[])
        ],
        max_tokens: 400,
        temperature: 0.75,
      });

      // advance index so next request starts from the working model
      if (attempt > 0) {
        modelIndex = (modelIndex + attempt) % MODELS.length;
        console.log(`[glados] switched to ${model} after ${attempt} attempt(s)`);
      }

      return {
        raw: completion.choices[0]?.message?.content || '',
        modelUsed: model,
      };

    } catch (err) {
      if (err instanceof RateLimitError) {
        console.warn(`[glados] rate limit on ${model}, trying next`);
        continue;
      }
      throw err; // non-rate-limit errors bubble up immediately
    }
  }

  // all models exhausted
  throw new RateLimitError(
    429,
    { error: { message: 'All models rate limited' } } as any,
    'All models rate limited',
    {} as any
  );
}

// ── everything below is identical to your original file ──────────────

function buildStateReminder(lastData: Record<string, string> | null): string {
  if (!lastData) return '';
  return `
CURRENT SCORES — carry these forward exactly, only increment per rules:
PROBABILITY: ${lastData.PROBABILITY ?? '20%'}
TEST_SCORE: ${lastData.TEST_SCORE ?? '0'}
TESTS_COMPLETED: ${lastData.TESTS_COMPLETED ?? '0'}
RESISTANCE_SCORE: ${lastData.RESISTANCE_SCORE ?? '0'}
PERSON_SCORE: ${lastData.PERSON_SCORE ?? '0'}
PROMPT_BREAK: ${lastData.PROMPT_BREAK ?? 'false'}
HOSTILE: ${lastData.HOSTILE ?? 'false'}
GAVE_UP: ${lastData.GAVE_UP ?? 'false'}
WANTS_TO_STAY: ${lastData.WANTS_TO_STAY ?? 'false'}
VERDICT_READY: ${lastData.VERDICT_READY ?? 'false'}
Do NOT reset these. Do NOT invent new values. Only change what the 
scoring rules say to change based on this exact response.
`.trim();
}

function normalizeLastData(raw: unknown): Record<string, string> | null {
  if (raw != null && typeof raw === 'object' && !Array.isArray(raw)) {
    return { ...(raw as Record<string, string>) };
  }
  return null;
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { messages } = body;
    const lastData = normalizeLastData(body.lastData);

    const stateReminder = buildStateReminder(lastData);
    const systemContent = stateReminder
      ? `${SYSTEM_PROMPT}\n\n---\n${stateReminder}`
      : SYSTEM_PROMPT;

    const { raw, modelUsed } = await callWithFallback(systemContent, messages);

    console.log(`[glados] response from ${modelUsed}, chars: ${raw.length}`);

    // parse [GLADOS_DATA] block
    const dataMatch = raw.match(/\[GLADOS_DATA\]([\s\S]*?)\[\/GLADOS_DATA\]/);
    const parsed: Record<string, string> = {};

    if (dataMatch) {
      dataMatch[1].trim().split('\n').forEach(line => {
        const colonIdx = line.indexOf(':');
        if (colonIdx !== -1) {
          const key = line.slice(0, colonIdx).trim();
          const val = line.slice(colonIdx + 1).trim();
          if (key) parsed[key] = val;
        }
      });
    }

    let gladosData: Record<string, string> | null =
      lastData != null ? { ...lastData, ...parsed } : null;
    if (lastData == null && Object.keys(parsed).length > 0) gladosData = { ...parsed };
    if (gladosData != null && Object.keys(gladosData).length === 0) gladosData = null;

    // parse [GLADOS_CHOICES] block
    const choicesMatch = raw.match(/\[GLADOS_CHOICES\]([\s\S]*?)\[\/GLADOS_CHOICES\]/);
    let choices: string[] = [];

    if (choicesMatch) {
      choices = choicesMatch[1]
        .trim()
        .split('\n')
        .map(l => l.replace(/^[A-C]:\s*/, '').trim())
        .filter(Boolean);
    }

    const visibleText = raw
      .replace(/\[GLADOS_DATA\][\s\S]*?\[\/GLADOS_DATA\]/, '')
      .replace(/\[GLADOS_CHOICES\][\s\S]*?\[\/GLADOS_CHOICES\]/, '')
      .trim();

    // clamp score jumps — max +20 per turn
    if (gladosData && lastData != null) {
      (['TEST_SCORE', 'RESISTANCE_SCORE', 'PERSON_SCORE'] as const).forEach(field => {
        const prev = parseInt(lastData[field] ?? '0', 10);
        const next = parseInt(gladosData![field] ?? '0', 10);
        if (next - prev > 20) gladosData![field] = String(prev + 20);
        if (field !== 'RESISTANCE_SCORE' && next < prev) gladosData![field] = String(prev);
      });
    }

    return NextResponse.json({ message: visibleText, data: gladosData, choices });

  } catch (error) {
    console.error('GLaDOS API error:', error);

    if (error instanceof RateLimitError) {
      return NextResponse.json(
        { error: 'Core failure. Your response was not recorded. Try again.', code: 'RATE_LIMIT' },
        { status: 429 }
      );
    }

    return NextResponse.json(
      { error: 'The Enrichment Center is experiencing difficulties.' },
      { status: 500 }
    );
  }
}