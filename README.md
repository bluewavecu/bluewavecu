# Bluewave Credit Union

Bluewave Credit Union is a modern digital banking website foundation for `bluewavecu.com`, focused on secure finance, seamless online banking, and a premium fintech experience.

## Tech Stack

- Next.js App Router
- TypeScript
- Tailwind CSS
- ESLint
- Framer Motion
- Lucide React
- clsx
- tailwind-merge

## Local Setup

Install dependencies:

```bash
npm install
```

Run the development server:

```bash
npm run dev
```

Open `http://localhost:3000`.

## Commands

```bash
npm run dev
npm run lint
npm run build
npm start
```

## Folder Structure

```text
src/
  app/
  components/
    layout/
    ui/
    home/
  lib/
  data/
  hooks/
  types/
  styles/
```

## Branding Assets

- Main logo: `/public/images/logo.webp`
- Favicon/app icon: `/public/images/icon.webp`
- Primary Navy: `#0A2A5E`
- Royal Blue: `#0D47A1`
- Ocean Blue: `#00A8E8`
- Light Blue: `#5ED7FF`
- Gray: `#6B7280`

## Deployment Note For Render

Use the Node runtime on Render. Set the build command to `npm run build` and the start command to `npm start`. Configure production environment variables in Render before deployment when backend services are added.

## Project Safety Note

Always read `README.md`, `PROJECT_LOG.md`, and `CODEX_RULES.md` before making changes. Do not overwrite completed work unless specifically instructed. Extend the existing foundation and components instead of rebuilding from scratch.

## Completed Work Log

- Step 1: Initial Bluewave Credit Union foundation setup.
