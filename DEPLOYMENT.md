# Deployment Checklist

## ✅ Completed

1. **Environment Variables Template**
   - Created `.env.example` with all required variables
   - Documented Sanity and Supabase configuration

2. **Next.js Configuration**
   - Optimized `next.config.mjs` for production:
     - Enabled React Strict Mode
     - Enabled SWC minification
     - Enabled compression

3. **Sanity Client Optimization**
   - Updated to use CDN in production for better performance
   - Added proper error handling and validation

4. **GitHub Actions Workflow**
   - Optimized deployment workflow with:
     - Node.js caching for faster builds
     - Environment variables support
     - Proper build verification

5. **Documentation**
   - Updated README with comprehensive deployment instructions
   - Added setup and configuration guides

## 🔧 Required Actions Before Deployment

### 1. Environment Variables Setup

#### For Local Development:
1. Copy `.env.example` to `.env.local`
2. Fill in your actual values:
   ```bash
   NEXT_PUBLIC_SANITY_PROJECT_ID=your-actual-project-id
   NEXT_PUBLIC_SANITY_DATASET=production
   NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your-actual-anon-key
   ```

#### For Vercel Deployment:
1. Go to your Vercel project dashboard
2. Navigate to **Settings > Environment Variables**
3. Add all four environment variables:
   - `NEXT_PUBLIC_SANITY_PROJECT_ID`
   - `NEXT_PUBLIC_SANITY_DATASET`
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
4. Set them for **Production**, **Preview**, and **Development** environments

### 2. GitHub Secrets Setup (for CI/CD)

If using GitHub Actions for automatic deployment, add these secrets in your GitHub repository:

1. Go to **Settings > Secrets and variables > Actions**
2. Add the following secrets:
   - `VERCEL_TOKEN` - Get from [Vercel Account Settings > Tokens](https://vercel.com/account/tokens)
   - `VERCEL_ORG_ID` - Found in your Vercel project settings
   - `VERCEL_PROJECT_ID` - Found in your Vercel project settings
   - `NEXT_PUBLIC_SANITY_PROJECT_ID` (optional, if not set in Vercel)
   - `NEXT_PUBLIC_SANITY_DATASET` (optional, if not set in Vercel)
   - `NEXT_PUBLIC_SUPABASE_URL` (optional, if not set in Vercel)
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY` (optional, if not set in Vercel)

### 3. Verify Build

Before deploying, ensure the project builds successfully:

```bash
npm install
npm run build
```

If there are any build errors, fix them before deploying.

### 4. Test Locally

Test the production build locally:

```bash
npm run build
npm start
```

Visit `http://localhost:3000` and verify everything works correctly.

### 5. Deploy

#### Option A: Automatic Deployment (Recommended)
- Push to the `main` branch
- GitHub Actions will automatically build and deploy to Vercel

#### Option B: Manual Deployment
```bash
npm i -g vercel
vercel --prod
```

## 📋 Pre-Deployment Checklist

- [ ] All environment variables are set in Vercel dashboard
- [ ] GitHub secrets are configured (if using CI/CD)
- [ ] Project builds successfully (`npm run build`)
- [ ] Production build runs locally (`npm start`)
- [ ] All external services (Sanity, Supabase) are configured
- [ ] Domain is configured (if using custom domain)
- [ ] Analytics/tracking is set up (if needed)

## 🚨 Common Issues

### Build Fails
- Ensure all dependencies are installed: `npm install`
- Check that all environment variables are set
- Verify Node.js version matches (20.x)

### Environment Variables Not Working
- Ensure variables are prefixed with `NEXT_PUBLIC_` for client-side access
- Restart the Vercel deployment after adding new variables
- Check variable names match exactly (case-sensitive)

### Sanity/Supabase Connection Issues
- Verify API keys are correct
- Check that CORS is configured in Supabase (if needed)
- Ensure Sanity dataset exists and is accessible

## 📞 Support

If you encounter issues during deployment:
1. Check Vercel deployment logs
2. Review GitHub Actions workflow logs (if using CI/CD)
3. Verify all environment variables are correctly set
4. Ensure all dependencies are up to date
