# LASE Portfolio

A modern portfolio website built with Next.js, Sanity CMS, and Supabase.

## 🚀 Getting Started

### Prerequisites

- Node.js 20.x or higher
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

## 📦 Build

To create a production build:

```bash
npm run build
```

To start the production server:

```bash
npm start
```

## 🚢 Deployment

### Deploying to Vercel

This project is configured for automatic deployment to Vercel via GitHub Actions.

#### Prerequisites

1. **Vercel Account**: Sign up at [vercel.com](https://vercel.com)
2. **GitHub Secrets**: Set up the following secrets in your GitHub repository:
   - `VERCEL_TOKEN` - Your Vercel API token (get from [Vercel Settings > Tokens](https://vercel.com/account/tokens))
   - `VERCEL_ORG_ID` - Your Vercel organization ID (found in your project settings)
   - `VERCEL_PROJECT_ID` - Your Vercel project ID (found in your project settings)

#### Automatic Deployment

The project is configured to automatically deploy when you push to the `main` branch. The GitHub Actions workflow will:
1. Checkout the code
2. Install dependencies
3. Build the project
4. Deploy to Vercel production

#### Manual Deployment

You can also deploy manually using the Vercel CLI:

```bash
npm i -g vercel
vercel
```

#### Environment Variables in Vercel

Make sure to add all environment variables in your Vercel project settings:
1. Go to your project in Vercel dashboard
2. Navigate to Settings > Environment Variables
3. Add all variables from `.env.example`:
   - `NEXT_PUBLIC_SANITY_PROJECT_ID`
   - `NEXT_PUBLIC_SANITY_DATASET`
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`

### Other Deployment Platforms

This Next.js app can be deployed to any platform that supports Node.js:

- **Netlify**: Connect your GitHub repo and configure build settings
- **Railway**: Import from GitHub and set environment variables
- **AWS Amplify**: Connect repository and configure build settings
- **Docker**: Build a container using the included Dockerfile (if available)

## 🛠️ Tech Stack

- **Framework**: Next.js 14
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **CMS**: Sanity
- **Database**: Supabase
- **Animations**: Framer Motion
- **Icons**: Lucide React

## 📝 Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm start` - Start production server
- `npm run lint` - Run ESLint

## 🔧 Configuration

### Sanity CMS

Configure your Sanity project in `src/sanity.config.ts` and set up your schemas in `src/lib/sanity/schemas/`.

### Supabase

Configure your Supabase client in `src/lib/supabase/client.ts`.

## 📄 License

Private project - All rights reserved
