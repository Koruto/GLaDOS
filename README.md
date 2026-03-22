# GLaDOS — Aperture Science Enrichment Center

A fan-made chat experience where GLaDOS evaluates you across a structured session and resolves to one of seven endings based on how you respond.

---

## Why I built this

I've been a fan of Portal for a while, and GLaDOS stuck with me as a character. When I was thinking about what to build for a chat demo, she was the obvious pick. A character that tests people maps naturally to a chat interface, and her voice is specific enough that the model has something concrete to imitate.

The other big inspiration was Slay the Princess, a game where every choice reveals something about you and there's no single correct playthrough. That idea of multiple endings that feel earned rather than arbitrary is what I wanted to bring here. Not a chatbot with a fixed script, but a session that lands somewhere different depending on who you are in the conversation.

---

## What it does

You start on an Aperture Science intake screen, then get dropped into a conversation with GLaDOS. She runs five hidden tests across the session, framed as natural conversation and never announced. When the session ends, you get a full ending card determined by three internal scores tracked throughout.

The model never tells you what it's measuring.

---

## How the scoring works

Three scores run in the background across the whole session:

- **Test Score** — how you handled the five embedded tests
- **Resistance Score** — whether you held your position when GLaDOS pushed back or dismissed you
- **Person Score** — whether you treated her as something with interiority, or just as a system to argue with

These combine at the end to determine which of the seven endings you get. The probability meter shown during the session is real but it's not the only thing that matters.

---

## How the structured output works

Every model response contains two parts: the visible reply, and a hidden data block the client parses.

```
The question wasn't yes or no. Try again.

[GLADOS_DATA]
PROBABILITY: 12%
TEST_SCORE: 0
TESTS_COMPLETED: 0
RESISTANCE_SCORE: 5
PERSON_SCORE: 0
VERDICT_READY: false
ENDING: NONE
[/GLADOS_DATA]
```

The client strips the data block before rendering and uses it to update the HUD. On every request, the server re-injects the previous scores into the system prompt so the model carries state forward correctly. Score changes are also clamped server-side at +20 per turn so the model cannot award large jumps in a single message.

---

## The system prompt

The system prompt is the core of the project. It defines:

- GLaDOS's voice, banned phrases, and response length rules
- Six tests the model can pick from, each with scoring criteria
- Three scoring axes and how each response should affect them
- Seven ending conditions and the verdict copy for each
- Flag conditions for hostile behavior, prompt injection attempts, and edge cases like the subject asking to stay
- A strict output format the server depends on for parsing

The model is also given a state reminder at the top of every request showing the current scores, with explicit instructions not to reset them. This was necessary because smaller models would otherwise treat each turn as a fresh context.

---

## Stack

- **Next.js 15** (App Router) for frontend and API route
- **Groq** for LLM inference, with automatic fallback across multiple models on rate limits
- **Tailwind CSS** for styling
- **TypeScript** throughout
- **Vercel** for deployment

---

## Run locally

You need a [Groq API key](https://console.groq.com).

```bash
npm install
```

```env
# .env.local
GROQ_API_KEY=your_key_here
```

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

---

## Known limitations

- Session state lives in the client, so refreshing resets the conversation
- The free Groq tier has rate limits. The app cycles through available models but a long session can exhaust all of them
- Smaller fallback models are less reliable at following the system prompt

---

_Portal_, _GLaDOS_, and _Aperture Science_ are trademarks of Valve Corporation. This is a fan project, unaffiliated with Valve.
