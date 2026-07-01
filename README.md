# LaunchPad

AI-powered startup planning app. Describe your business idea, set a budget, and get a full editable workflow roadmap with tool recommendations, daily reminders, and progress tracking.

## Features

- **Prompt-to-roadmap** — Describe any startup idea and get an 8-block business workflow (idea, product, marketing, finance, legal, operations, team, launch)
- **Visual workflow map** — Drag-and-drop square blocks connected like a mind map
- **Tool recommendations** — Curated tools for each business area, tailored to your budget tier
- **Budget guidance** — Set a starting budget and receive cost estimates plus tailored advice
- **Progress tracking** — Update each block, log notes, and track overall completion
- **Daily reminders** — Browser notifications on a customizable schedule

## Quick start

```bash
cd Projects/LaunchPad
npm install
npm run db:migrate
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Environment variables

Copy `.env` and optionally add your OpenAI key for smarter AI-generated roadmaps:

```env
DATABASE_URL="file:./dev.db"
OPENAI_API_KEY="sk-..."   # optional — works without it using built-in templates
```

Without `OPENAI_API_KEY`, LaunchPad uses intelligent fallback templates that still adapt to your idea and budget.

## Tech stack

- **Next.js 16** (App Router)
- **React Flow** (`@xyflow/react`) for the workflow canvas
- **Prisma + SQLite** for projects, nodes, reminders, and progress logs
- **OpenAI** (optional) for AI roadmap generation
- **Tailwind CSS** for styling
