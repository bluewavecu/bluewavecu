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
    auth/
    dashboard/
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
- Step 2: Authentication pages and protected banking app shell foundation.
- Step 2 follow-up: Footer copy/contact updates, mobile app coming-soon page, and homepage testimonial carousel.

## Step 2 Notes

- Added static `/login` and `/register` pages with premium auth UI only.
- Added protected app layout foundation with sidebar, mobile navigation, app header, and dashboard routes.
- Added mocked banking data for profile, accounts, card, transactions, loan offer, and support messages.
- No real authentication, database, or banking API integration exists yet.
- Pending next step: database schema and backend API foundation.

## Current Public Content Updates

- Footer contact address: `2000 McKinney Ave, Dallas, TX 75201`
- Footer phone number: `(646) 776-4480`
- Footer insurance note now states: `Bluewave Credit Union is federally insured by the NCUA. Membership eligibility applies. Equal Housing Opportunity.`
- `/mobile-app` is a coming-soon maintenance page.
- Homepage CTA now links clearly to member login and account registration.
- Homepage testimonials are sample member feedback for layout and content presentation.
