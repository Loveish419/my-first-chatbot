# My First AI Chatbot

A simple AI chatbot for students learning web development and AI integration.

## What it does

You type a message, the browser sends it to a small Node.js backend, the backend asks the Groq AI for a reply, and the answer appears in the chat. The chat remembers earlier messages during your current session.

## Technologies used

- HTML, CSS, vanilla JavaScript (frontend)
- Node.js serverless function (backend)
- Groq API (AI responses)
- Vercel (hosting and local development)
- Git and GitHub (version control)

## Prerequisites

- Node.js 18 or newer: https://nodejs.org
- Git: https://git-scm.com
- A free Groq account and API key: https://console.groq.com
- A GitHub account and a Vercel account (free)

## Installation

```bash
git clone <your-repository-url>
cd my-first-chatbot
npm install
```

## Configure the Groq API key

1. Copy `.env.example` to a new file named `.env.local`.
2. Open `.env.local` and replace `your_groq_api_key_here` with your real key.
3. Never share this file or upload it to GitHub.

## Run locally

```bash
npm run dev
```

Open http://localhost:3000 in your browser.

## Deploy to Vercel

1. Push your project to GitHub (without `.env.local`).
2. Go to https://vercel.com/new and import your repository.
3. Under Environment Variables, add `GROQ_API_KEY` with your real key.
4. Click Deploy.

## Troubleshooting

- "Server is missing GROQ_API_KEY": check your `.env.local` file name and restart `npm run dev`.
- "Model not found" errors: Groq retires models over time. Update `MODEL` in `api/chat.js` using https://console.groq.com/docs/models.