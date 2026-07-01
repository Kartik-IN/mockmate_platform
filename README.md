# MockMate Platform

AI mock interview assistant built with Next.js, Vapi voice workflows, and Gemini.

## Features

- Voice-based mock interview experience powered by Vapi.
- Interview question generation with AI.
- Resume parsing endpoint + UI panel to extract skills and interview focus areas.
- Feedback generation from interview transcripts.

## Getting Started

Install dependencies and run dev server:

```bash
npm install
npm run dev
```

Then open [http://localhost:3000](http://localhost:3000).

## Environment Variables

Create a `.env.local` file and configure at least:

- `NEXT_PUBLIC_VAPI_WEB_TOKEN`
- `NEXT_PUBLIC_VAPI_WORKFLOW_ID`
- `GOOGLE_GENERATIVE_AI_API_KEY`
- Firebase credentials used in `firebase/admin.ts` and `firebase/client.ts`

## Main Routes

- `/` — Home page and interview cards
- `/interview` — Start Vapi interview flow + resume parsing panel
- `/api/vapi/generate` — AI-generated interview question set
- `/api/resume/parse` — Resume parsing endpoint
