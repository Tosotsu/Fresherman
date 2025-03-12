# Secure Life Hub

A comprehensive application for securely storing and managing your personal information.

## Features

- **Personal Information Management**: Store and organize all your personal details in one secure place.
- **Document Storage**: Maintain digital copies of important documents like IDs, certificates, and more.
- **Education & Employment History**: Keep track of your academic and professional journey.
- **Medical Records**: Store important health information in one place.
- **Vehicle Details**: Manage information about your vehicles, including registration and insurance details.
- **Secure Authentication**: Powered by Supabase for secure user authentication and data storage.

## Getting Started

### Prerequisites

- Node.js (v14+)
- NPM or Yarn
- A Supabase account and project

### Installation

1. Clone the repository:
```bash
git clone https://github.com/yourusername/secure-life-hub.git
cd secure-life-hub
```

2. Install dependencies:
```bash
npm install
```

3. Set up your environment variables:
Create a `.env` file in the root directory with the following:
```
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
```

4. Set up your Supabase database:
- Go to your Supabase project dashboard
- Navigate to SQL Editor
- Create a new query
- Copy and paste the contents of `src/integrations/supabase/schema.sql`
- Run the query

5. Create a demo user:
- Go to Authentication > Users in your Supabase dashboard
- Click "Add User"
- Enter:
  - Email: demo@example.com
  - Password: password
- Click "Create User"

6. Start the development server:
```bash
npm run dev
```

## Authentication Setup (Important)

If you're experiencing authentication issues (such as "Too many sign-up attempts" or "Invalid login credentials"), follow these steps:

### 1. Run the Database Schema

The first step is to set up your database schema correctly:

1. Log in to your [Supabase Dashboard](https://app.supabase.com/)
2. Navigate to your project
3. Go to the SQL Editor (in the sidebar)
4. Create a new query
5. Copy and paste the contents of `src/integrations/supabase/schema.sql` file
6. Run the query

This will:
- Create all necessary tables with proper structures
- Set up Row Level Security (RLS) policies
- Create a trigger to automatically create profiles for new users

### 2. Create a Demo User

You can create a demo user in two ways:

#### Option A: Using the SQL Script

1. Go to the SQL Editor in your Supabase Dashboard
2. Create a new query
3. Copy and paste the contents of `src/integrations/supabase/create-demo-user.sql` file
4. Run the query

#### Option B: Manually in the Dashboard

1. Go to Authentication > Users in your Supabase Dashboard
2. Click "Add User"
3. Enter:
   - Email: demo@example.com
   - Password: password
4. Click "Create User"

### 3. Handle Rate Limits

If you're still seeing rate limit errors:

1. Wait 10-15 minutes before trying again
2. Sign up/sign in attempts are limited by Supabase to prevent abuse
3. The application has delays to avoid hitting rate limits

## Troubleshooting

- **Profile not created for new users**: Make sure you've run the schema.sql script which contains the trigger to create profiles.
- **Demo login fails**: Verify that the demo user exists in your Auth > Users section.
- **Rate limit errors persist**: Wait longer between sign-up/sign-in attempts. Supabase rate limits are strict.
- **Personal info not showing**: Check if there's a record in the personal_info table for your user. If not, create one manually or through the application.

## Built With

- [React](https://reactjs.org/) - Frontend framework
- [TypeScript](https://www.typescriptlang.org/) - Type-safe JavaScript
- [Vite](https://vitejs.dev/) - Build tool
- [Tailwind CSS](https://tailwindcss.com/) - CSS framework
- [Supabase](https://supabase.io/) - Backend-as-a-Service
- [Shadcn/ui](https://ui.shadcn.com/) - UI components
- [React Router](https://reactrouter.com/) - Routing

## License

This project is licensed under the MIT License.

## What technologies are used for this project?

This project is built with .

- Vite
- TypeScript
- React
- shadcn-ui
- Tailwind CSS



