# LASE Portfolio

A modern portfolio website built with Next.js, Sanity CMS, and Supabase.

## ðŸš€ Getting Started

### Prerequisites

- Node.js 20.9 or higher (Node.js 24.x recommended; matches Vercel)
- npm or yarn
- Sanity account and project
- Supabase account and project

### Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd lase-portfolio
```

2. Install dependencies:
```bash
npm install
```

3. Set up environment variables:
```bash
cp .env.example .env.local
```

4. Fill in your environment variables in `.env.local`:
- `NEXT_PUBLIC_SANITY_PROJECT_ID` - Your Sanity project ID
- `NEXT_PUBLIC_SANITY_DATASET` - Your Sanity dataset (usually "production")
- `NEXT_PUBLIC_SUPABASE_URL` - Your Supabase project URL
- `NEXT_PUBLIC_SUPABASE_ANON_KEY` - Your Supabase anonymous key

5. Run the development server:
```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to see your site.

## ðŸ“¦ Build

To create a production build:

```bash
npm run build
```

To start the production server:

```bash
npm start
```

## ðŸš¢ Deployment

### Deploying to Vercel

This project is configured for automatic deployment to Vercel via GitHub Actions.

#### Prerequisites

1. **Vercel Account**: Sign up at [vercel.com](https://vercel.com)
2. **GitHub Secrets**: Set up the following secrets in your GitHub repository:
   - `VERCEL_TOKEN` - Your Vercel API token (get from [Vercel Settings > Tokens](https://vercel.com/account/tokens))
   - `VERCEL_ORG_I¶»§q«^