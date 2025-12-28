# Vercel Deployment Guide

## Steps to Deploy Frontend to Vercel

### 1. Build Configuration
The project is already configured with `vercel.json` to handle SPA routing.

### 2. Environment Variables
In Vercel Dashboard, go to your project settings and add:

```
VITE_API_URL=https://your-backend-url.com/api
```

**Important:** 
- Replace `https://your-backend-url.com/api` with your actual backend API URL
- **CRITICAL:** The URL MUST end with `/api` because the backend routes are prefixed with `/api`
- Example: `https://backend-9leq.onrender.com/api` ✅
- Wrong: `https://backend-9leq.onrender.com` ❌ (will cause 404 errors)

### 3. Build Settings
Vercel will automatically detect Vite projects. Ensure:
- **Framework Preset:** Vite
- **Build Command:** `npm run build`
- **Output Directory:** `dist`
- **Install Command:** `npm install`

### 4. Deploy
1. Push your code to GitHub/GitLab/Bitbucket
2. Import the repository in Vercel
3. Add the environment variable `VITE_API_URL`
4. Deploy

## Troubleshooting

### 404 Errors on Routes
- ✅ Fixed with `vercel.json` rewrites configuration
- All routes now redirect to `index.html` for client-side routing

### API Connection Issues
- Make sure `VITE_API_URL` is set correctly in Vercel environment variables
- Ensure your backend CORS allows requests from your Vercel domain
- Backend URL should not have a trailing slash

### Build Errors
- Ensure all dependencies are in `package.json`
- Check that Node.js version is compatible (Vercel uses Node 18+ by default)


