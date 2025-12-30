# Troubleshooting Guide

## Connection Issues: "No connection between frontend and backend"

If you're seeing a loading screen that never finishes, or the app shows "Loading System" without any database actions, this usually means the frontend can't connect to your Convex backend.

### Common Causes

1. **Missing `VITE_CONVEX_URL` environment variable**
2. **Incorrect Convex URL**
3. **Convex backend not deployed**
4. **Environment variable not set in production**

### How to Fix

#### Step 1: Get Your Convex URL

1. Go to [Convex Dashboard](https://dashboard.convex.dev)
2. Select your project
3. Go to **Settings** → **Deployment**
4. Copy your **Production URL** (looks like: `https://your-project.convex.cloud`)

#### Step 2: Set Environment Variable in Vercel

1. Go to your Vercel project dashboard
2. Navigate to **Settings** → **Environment Variables**
3. Click **Add New**
4. Add:
   - **Name**: `VITE_CONVEX_URL`
   - **Value**: Your Convex production URL (from Step 1)
   - **Environment**: Select all (Production, Preview, Development)
5. Click **Save**

#### Step 3: Redeploy

After adding the environment variable, you need to redeploy:

1. Go to **Deployments** tab in Vercel
2. Click the **⋯** menu on the latest deployment
3. Click **Redeploy**
4. Or push a new commit to trigger a new deployment

#### Step 4: Verify

1. Visit your production URL
2. Open browser DevTools (F12)
3. Check the Console tab - you should NOT see any errors about `VITE_CONVEX_URL`
4. The app should load normally

### For Netlify

Same process, but:
1. Go to **Site settings** → **Environment variables**
2. Add `VITE_CONVEX_URL` with your Convex URL
3. Redeploy the site

### Testing Locally

If you want to test locally:

1. Run `npx convex dev` (this creates a `.env.local` file)
2. Or manually create `.env.local`:
   ```env
   VITE_CONVEX_URL=https://your-project.convex.cloud
   ```
3. Restart your dev server: `npm run dev`

### Variable Exists But Still Not Working?

If `VITE_CONVEX_URL` already exists in Vercel but you're still having connection issues:

1. **Verify the Value is Correct:**
   - In Vercel, go to Settings → Environment Variables
   - Click on `VITE_CONVEX_URL` to view/edit it
   - Make sure it matches your Convex Production URL exactly
   - Should be: `https://your-project-name.convex.cloud`
   - No trailing slashes, no extra spaces

2. **Update the Variable (if needed):**
   - Click the variable to edit it
   - Update the value with the correct Convex URL
   - Make sure all environments (Production, Preview, Development) are selected
   - Click Save

3. **Redeploy After Updating:**
   - Go to Deployments tab
   - Click ⋯ on the latest deployment
   - Click Redeploy
   - Wait for deployment to complete

4. **Check if Convex Backend is Deployed:**
   - Run `npm run convex:deploy` locally
   - Or check Convex Dashboard → Deployments
   - Make sure your functions are deployed

5. **Verify URL Format:**
   - Should start with `https://`
   - Should end with `.convex.cloud`
   - No `http://` (must be HTTPS)
   - No trailing `/`

### Still Having Issues?

1. **Check the browser console** - Look for error messages
2. **Verify Convex is deployed** - Run `npm run convex:deploy`
3. **Check the Convex dashboard** - Make sure your functions are deployed
4. **Verify the URL format** - Should start with `https://` and end with `.convex.cloud`
5. **Clear browser cache** - Hard refresh (Ctrl+Shift+R or Cmd+Shift+R)
6. **Check Network tab** - Look for failed requests to Convex

### Error Messages

- **"Missing VITE_CONVEX_URL environment variable"**
  → Set the environment variable in your hosting platform

- **"Unable to connect to the backend"**
  → Check that your Convex URL is correct and the backend is deployed

- **"Loading..." forever**
  → Usually means the environment variable is missing or incorrect

