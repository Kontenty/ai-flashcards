# 10x Flashcards

![Version](https://img.shields.io/badge/version-0.0.1-blue)
![Build Status](https://github.com/<owner>/<repo>/actions/workflows/ci.yml/badge.svg)
![License](https://img.shields.io/badge/license-unlicensed-lightgrey)

## Description

10x Flashcards is a web application designed to streamline and accelerate the creation of high-quality educational flashcards by combining AI-powered generation with manual editing and management capabilities. This MVP enables users to generate flashcards from pasted text, manually create, review, edit, and delete flashcards, manage user accounts with GDPR compliance, assign tags, view statistics, and conduct spaced repetition sessions using the SM-2 algorithm.

## Tech Stack

- **Frontend:** Astro 5.7.11, React 19.1.0
- **Styling:** Tailwind CSS 4.1.5, Shadcn/ui
- **Backend:** Supabase (Auth, PostgreSQL, Storage)
- **AI Integration:** Openrouter.ai (OpenAI API wrapper)
- **CI/CD:** GitHub Actions
- **Hosting:** DigitalOcean (Docker)
- **Language:** TypeScript
- **Linting:** ESLint
- **Unit testing:** Vitest + React Testing Library
- **End-to-end testing:** Playwright

## Table of Contents

- [Getting Started Locally](#getting-started-locally)
- [Available Scripts](#available-scripts)
- [Project Scope](#project-scope)
- [Project Status](#project-status)
- [License](#license)

## Getting Started Locally

### Prerequisites

- Node.js v22.15.0 (nvm, Volta)
- Supabase project with URL and ANON key
- Openrouter.ai or OpenAI API key

### Installation

```bash
git clone https://github.com/<owner>/<repo>.git
cd 10x-flashcards
pnpm install
```

### Environment Variables

Create a `.env` in the root:

```
SUPABASE_URL=your_supabase_url
SUPABASE_ANON_KEY=your_supabase_anon_key
OPEN_ROUTER_API_KEY=your_OPEN_ROUTER_API_KEY
# or OPENAI_API_KEY=your_openai_api_key
```

### Running the App

```bash
pnpm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## Available Scripts

- `pnpm run dev` - Start the development server
- `pnpm run build` - Build production assets
- `pnpm run preview` - Preview the production build
- `pnpm run astro` - Run the Astro CLI
- `pnpm run test:unit` - Run unit tests with Vitest
- `pnpm run test:unit:watch` - Run unit tests in watch mode
- `pnpm run test:coverage` - Generate test coverage report
- `pnpm run test:e2e` - Run end-to-end tests with Playwright

## Project Scope

### Core Features

- **AI-powered flashcard generation:** Generate flashcards from up to 5000 characters of input text (front ≤200 chars, back ≤500 chars).
- **Manual flashcard CRUD:** Create, view, edit, and delete flashcards with character limits.
- **User authentication:** Sign up, log in with email/password, and GDPR consent.
- **Tag management & statistics:** Assign tags and view statistics (flashcards per tag, recall rates).
- **Spaced repetition:** Conduct review sessions with the SM-2 algorithm.

### Out of Scope

- File imports (PDF, DOCX, etc.).
- Deck sharing or export.
- External educational platform integrations.
- Native mobile applications.
- Advanced repetition algorithms beyond SM-2.
- Additional security measures beyond GDPR compliance.

## Project Status

- **Version:** 0.0.1
- **Status:** MVP in active development
- **Metrics Tracked:**
  - AI flashcard acceptance rate
  - Percentage of flashcards generated via AI
  - Monthly active users
  - Average AI generation latency and usage

## License

This project is currently unlicensed. Please add a `LICENSE` file to specify terms.
