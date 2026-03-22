# Glados

## What it is

**Glados** is a fan-made web app inspired by *Portal*: you get a short **Aperture Science**–style landing screen, then a **chat session** with a **GLaDOS-flavored** assistant. Replies come from **Groq** (hosted large language models) through a small Next.js API, with a system prompt that keeps the tone, “test” framing, and story data on the rails.

It is **not** official Valve or *Portal* software—just a fun UI and writing experiment.

## Features

- **Landing → chat** — Intro copy and a **Begin Testing** button; the first assistant line **types in** like a terminal reveal.
- **Session HUD** — Subject id, chamber readouts, **release probability**, and related fields update as the model returns structured snippets the client parses.
- **Turn limit** — The evaluation is bounded so sessions end cleanly instead of running forever.
- **Multiple endings** — When the run finishes, you see a full-screen **ending card** (title, classification, body, GLaDOS note). The app defines **seven distinct endings** (archived, containment, retention, discharge, anomaly review, reclassified, undefined “anomaly”), plus a **generic fallback** if the API ever returns an unknown ending code.
- **Model fallback** — If one Groq model hits a rate limit, the server tries the next in its list so the app stays usable.
- **Favicon** — **`public/portal2.png`** is copied to **`app/icon.png`** and **`app/apple-icon.png`** so Next.js can use it as the tab / home-screen icon (not shown on the page itself).

## Run it locally

You need a [Groq](https://console.groq.com) API key.

```bash
npm install
```

Create `.env.local`:

```bash
GROQ_API_KEY=your_key_here
```

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Scripts

- `npm run dev` — development server  
- `npm run build` — production build  
- `npm run start` — run production build  
- `npm run lint` — lint  

---

*Portal*, *GLaDOS*, and *Aperture Science* are trademarks of Valve Corporation.
