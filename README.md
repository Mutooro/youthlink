# YouthLink Uganda 🇺🇬

Uganda's youth employment platform — internships, jobs, short contracts, and empowerment programs.

## Tech Stack
- **React 18** + Vite
- **React Router v6** for routing
- **Supabase** for database, auth, and file storage
- **CSS** (no framework — custom design system)

## Pages
| Route | Description |
|-------|-------------|
| `/` | Landing page with search, categories, recent jobs |
| `/jobs` | Browse & filter all listings |
| `/jobs/:id` | Job detail + apply |
| `/programs` | Youth programs & bootcamps |
| `/auth` | Sign in / Sign up |
| `/profile` | Edit profile + upload CV |
| `/dashboard` | Track applications & matches |

## Quick Start

### 1. Install dependencies
```bash
npm install
```

### 2. Set up environment variables
```bash
cp .env.example .env
```
Edit `.env` and add your Supabase URL and anon key from **Supabase → Settings → API**.

### 3. Set up the database
Run the SQL schema in **Supabase → SQL Editor**:
- See `schema.sql` or the Supabase Setup Guide HTML file

### 4. Run locally
```bash
npm run dev
```
Open http://localhost:5173

### 5. Build for production
```bash
npm run build
```

## Deploy to Vercel
1. Push to GitHub
2. Import repo at vercel.com
3. Add environment variables in Vercel dashboard
4. Deploy!

## Project Structure
```
src/
├── context/
│   └── AuthContext.jsx     # Global auth state
├── lib/
│   └── supabase.js         # Supabase client
├── components/
│   ├── Navbar.jsx/css
│   └── JobCard.jsx/css
├── pages/
│   ├── Home.jsx/css
│   ├── Jobs.jsx/css
│   ├── JobDetail.jsx/css
│   ├── Programs.jsx/css
│   ├── Auth.jsx/css
│   ├── Profile.jsx/css
│   └── Dashboard.jsx/css
├── App.jsx                 # Routes
├── main.jsx                # Entry point
└── index.css               # Design tokens + globals
```
