# Befaq Tadrib - Project Notes & Workflow

## 1. Development & Deployment Workflow
- **Local Development First:** All coding, UI design, and testing must be done locally. View changes live on `http://localhost:8080/`.
- **Git Push on Command:** Do not push to GitHub automatically on every change. Only push when the user explicitly says "কাজ শেষ, গিটহাবে পুশ করো" (Task finished, push to GitHub) or similar.
- **Auto Vercel Deployment:** Once pushed to GitHub (`main` branch), Vercel will automatically redeploy the site. No manual Vercel configuration is needed after the initial setup.

## 2. Design System (Dark Theme)
- When converting sections to the dark theme, use the following core classes to maintain consistency with the established premium aesthetic:
  - Background: `bg-dark-luxe`
  - Pattern overlay: `bg-star-pattern opacity-[0.03]`
  - Glowing Orb (usually top-center): `absolute -top-40 left-1/2 -translate-x-1/2 h-[460px] w-[900px] rounded-full bg-gold/15 blur-[140px]`
  - Borders/Separators: `bg-gradient-to-r from-transparent via-gold/60 to-transparent`

*Note: Always read this file in new chat sessions to understand the user's preferred workflow and design guidelines.*
