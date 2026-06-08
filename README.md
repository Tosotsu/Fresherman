# Fresherman — Personal Information Vault

Secure web app for storing and organizing all your personal information in one place — documents, education history, medical records, vehicle details, and more. Powered by Supabase for auth and real-time data storage.

**Live:** [fresherman.vercel.app](https://fresherman.vercel.app)

## What It Does

- Store personal details, IDs, and documents digitally
- Manage education and employment history in structured records
- Keep medical records and health information accessible
- Track vehicle registration, insurance, and service history
- Secure login via Supabase Auth — data is private per user

## Tech Stack

| Layer | Tech |
|-------|------|
| Framework | React 18 + TypeScript |
| Build | Vite |
| Styling | Tailwind CSS + shadcn/ui |
| Backend / Auth | Supabase (PostgreSQL + Auth) |
| Deployment | Vercel |

## Practical Use

Digital alternative to keeping physical folders of important documents — especially useful for students and young professionals who need quick access to their certificates, IDs, and records without digging through paperwork.

## Run Locally

```bash
npm install
cp .env.example .env   # add your Supabase project URL and anon key
npm run dev
```

See `setup.js` to initialize Supabase tables before first run.
