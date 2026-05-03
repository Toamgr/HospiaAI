# HOSPIA AI — Full Local App

This is a local working HOSPIA app with:

- React/Vite frontend
- Node/Express backend
- OpenAI API connection
- AI Service Coach
- Guest Simulation evaluator
- Manager Analysis

## Setup

1. Install Node.js.
2. Unzip this folder.
3. Open terminal inside the folder.
4. Run:

```bash
npm install
```

5. Copy `.env.example` and rename the copy to `.env`.

6. Paste your OpenAI API key inside `.env`:

```env
OPENAI_API_KEY=sk-your-real-key-here
PORT=3001
MODEL=gpt-4.1-mini
```

7. Run:

```bash
npm start
```

8. Open the frontend URL printed by Vite, usually:

```bash
http://localhost:5173
```

## Important

Never put the API key inside React files.
Only put it in `.env`.
