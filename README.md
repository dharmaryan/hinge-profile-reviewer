# Hinge Profile Reviewer

Get brutally honest AI feedback on your Hinge profile from 4 models simultaneously — Claude, ChatGPT, Gemini, and Grok.

## Setup

```bash
npm install
cp .env.example .env.local
# Add your API keys to .env.local
npm run dev
```

## Environment Variables

| Variable | Description |
|---|---|
| `ANTHROPIC_API_KEY` | Anthropic API key (Claude + persona generation) |
| `OPENAI_API_KEY` | OpenAI API key (GPT-4.1 mini) |
| `GOOGLE_AI_API_KEY` | Google AI Studio key (Gemini 2.0 Flash) |
| `XAI_API_KEY` | xAI API key (Grok 2 Vision) |

## Deploy to Vercel

1. Push to GitHub
2. Import repo in [Vercel](https://vercel.com)
3. Add environment variables in Vercel dashboard
4. Deploy

> Note: The `/api/review` route has `maxDuration: 60` which requires Vercel Pro ($20/mo) for reliable operation. On Hobby plan, the 10s timeout may cause failures.
