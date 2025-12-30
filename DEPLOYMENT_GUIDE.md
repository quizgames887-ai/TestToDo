# 🚀 Deployment Guide: From Development to Production

This guide will walk you through deploying your TaskFlow application to production step by step.

## 📋 Overview

Your application has two parts:
1. **Backend**: Convex (automatically hosted by Convex)
2. **Frontend**: React app (needs to be deployed to a hosting service)

---

## 🎯 Step 1: Prepare Your Code for Production

### 1.1 Test Your Application Locally

Before deploying, make sure everything works:

```bash
# Make sure you're in the project directory
cd D:\TestToDo

# Install dependencies (if not already done)
npm install

# Build the production version locally to check for errors
npm run build

# Preview the production build
npm run preview
```

If you see any errors, fix them before proceeding.

### 1.2 Commit Your Code to Git

Make sure all your code is committed:

```bash
# Check what files have changed
git status

# Add all files
git add .

# Commit (if you haven't already)
git commit -m "Prepare for production deployment"
```

---

## 🔧 Step 2: Deploy Your Convex Backend

Convex automatically hosts your backend, but you need to deploy it to production.

### 2.1 Deploy Convex Functions

```bash
# Deploy your Convex backend to production
npm run convex:deploy
```

This will:
- Deploy all your Convex functions (tasks, projects, auth, etc.)
- Create a production deployment URL
- Set up your production database

**Note**: If this is your first time, you might need to log in:
```bash
npx convex login
```

### 2.2 Get Your Production Convex URL

After deployment, Convex will show you a URL like:
```
https://your-project-name.convex.cloud
```

**Save this URL** - you'll need it in the next step!

### 2.3 Set Up Environment Variables in Convex Dashboard

1. Go to [Convex Dashboard](https://dashboard.convex.dev)
2. Select your project
3. Navigate to **Settings** → **Environment Variables**
4. Add these variables:

   **For JWT Authentication** (from `SETUP_JWT_KEYS.md`):
   - `JWT_PRIVATE_KEY`: Your private key (the long key from `convex-jwt-keys.txt`)
   - `JWKS`: Your JWKS JSON (from `convex-jwt-keys.txt`)

   **For AI Features** (optional):
   - `OPENAI_API_KEY`: Your OpenAI API key (if you're using AI features)

   **For Auth** (if needed):
   - `CONVEX_SITE_URL`: Your production frontend URL (you'll set this after deploying frontend)

---

## 🌐 Step 3: Deploy Your Frontend

We'll use **Vercel** (recommended) or **Netlify** - both are free and easy to use.

### Option A: Deploy to Vercel (Recommended)

#### 3.1 Create a Vercel Account

1. Go to [vercel.com](https://vercel.com)
2. Sign up with GitHub (recommended) or email

#### 3.2 Install Vercel CLI (Optional but Recommended)

```bash
npm install -g vercel
```

#### 3.3 Deploy via Vercel Dashboard

1. Go to [vercel.com/new](https://vercel.com/new)
2. Click **"Import Project"**
3. Connect your GitHub account (or upload your code)
4. Select your repository
5. Configure the project:
   - **Framework Preset**: Vite
   - **Root Directory**: `./` (default)
   - **Build Command**: `npm run build`
   - **Output Directory**: `dist`
   - **Install Command**: `npm install`

#### 3.4 Add Environment Variables in Vercel

Before deploying, add your environment variable:

1. In Vercel project settings, go to **Settings** → **Environment Variables**
2. Add:
   - **Name**: `VITE_CONVEX_URL`
   - **Value**: Your production Convex URL (from Step 2.2)
   - **Environment**: Production, Preview, Development (select all)

#### 3.5 Deploy

Click **"Deploy"** and wait for it to finish (usually 1-2 minutes).

#### 3.6 Get Your Production URL

After deployment, Vercel will give you a URL like:
```
https://your-project-name.vercel.app
```

**Save this URL!**

---

### Option B: Deploy to Netlify

#### 3.1 Create a Netlify Account

1. Go to [netlify.com](https://netlify.com)
2. Sign up with GitHub (recommended) or email

#### 3.2 Deploy via Netlify Dashboard

1. Go to [app.netlify.com](https://app.netlify.com)
2. Click **"Add new site"** → **"Import an existing project"**
3. Connect your Git provider
4. Select your repository
5. Configure build settings:
   - **Build command**: `npm run build`
   - **Publish directory**: `dist`
   - **Base directory**: `./` (leave empty)

#### 3.3 Add Environment Variables

1. Go to **Site settings** → **Environment variables**
2. Add:
   - **Key**: `VITE_CONVEX_URL`
   - **Value**: Your production Convex URL
   - **Scopes**: All scopes

#### 3.4 Deploy

Click **"Deploy site"** and wait for it to finish.

---

## 🔗 Step 4: Connect Frontend and Backend

### 4.1 Update Convex Site URL

1. Go back to [Convex Dashboard](https://dashboard.convex.dev)
2. Navigate to **Settings** → **Environment Variables**
3. Add or update:
   - **Name**: `CONVEX_SITE_URL`
   - **Value**: Your production frontend URL (from Step 3.6)
   - This is needed for authentication to work properly

### 4.2 Verify Environment Variables

Make sure you have these set in **both** places:

**In Convex Dashboard:**
- ✅ `JWT_PRIVATE_KEY`
- ✅ `JWKS`
- ✅ `CONVEX_SITE_URL` (your frontend URL)
- ✅ `OPENAI_API_KEY` (if using AI features)

**In Vercel/Netlify:**
- ✅ `VITE_CONVEX_URL` (your Convex URL)

---

## ✅ Step 5: Test Your Production Deployment

### 5.1 Visit Your Production URL

Open your production frontend URL (e.g., `https://your-project.vercel.app`)

### 5.2 Test Key Features

1. **Registration/Login**: Create a new account or log in
2. **Create Task**: Create a test task
3. **Real-time Updates**: Open the app in two browser tabs and verify updates sync
4. **AI Features**: Test AI suggestions (if enabled)

### 5.3 Check for Errors

- Open browser DevTools (F12)
- Check the Console tab for errors
- Check the Network tab for failed requests

---

## 🔄 Step 6: Set Up Continuous Deployment (Optional but Recommended)

### For Vercel:

Vercel automatically deploys when you push to your main branch. Just:

1. Make changes to your code
2. Commit and push:
   ```bash
   git add .
   git commit -m "Your changes"
   git push
   ```
3. Vercel will automatically deploy!

### For Netlify:

Same as Vercel - automatic deployments on push to main branch.

---

## 🛠️ Step 7: Update Convex Functions After Code Changes

Whenever you change your Convex backend code:

```bash
npm run convex:deploy
```

This updates your production backend with the latest changes.

---

## 📝 Quick Reference: Deployment Checklist

Before going live, make sure:

- [ ] Code is committed to Git
- [ ] `npm run build` works without errors
- [ ] Convex backend is deployed (`npm run convex:deploy`)
- [ ] Convex environment variables are set (JWT keys, etc.)
- [ ] Frontend is deployed (Vercel/Netlify)
- [ ] Frontend environment variable `VITE_CONVEX_URL` is set
- [ ] `CONVEX_SITE_URL` in Convex points to your frontend URL
- [ ] Production site is tested (login, create task, etc.)
- [ ] No console errors in browser DevTools

---

## 🆘 Troubleshooting

### Problem: "Missing VITE_CONVEX_URL"

**Solution**: Make sure you set `VITE_CONVEX_URL` in your hosting platform's environment variables.

### Problem: Authentication not working

**Solution**: 
1. Check that `JWT_PRIVATE_KEY` and `JWKS` are set in Convex
2. Verify `CONVEX_SITE_URL` matches your frontend URL exactly
3. Redeploy after changing environment variables

### Problem: Build fails

**Solution**:
1. Test locally: `npm run build`
2. Check for TypeScript errors
3. Make sure all dependencies are in `package.json`

### Problem: Changes not showing up

**Solution**:
1. Clear browser cache (Ctrl+Shift+R)
2. Check if deployment completed successfully
3. For backend changes, run `npm run convex:deploy`
4. For frontend changes, check deployment logs in Vercel/Netlify

---

## 🎉 You're Done!

Your application is now live in production! Share your URL with users.

### Next Steps (Optional):

1. **Custom Domain**: Add your own domain in Vercel/Netlify settings
2. **Analytics**: Set up analytics to track usage
3. **Monitoring**: Set up error tracking (e.g., Sentry)
4. **Backup**: Convex automatically backs up your data

---

## 📚 Additional Resources

- [Convex Deployment Docs](https://docs.convex.dev/deploy)
- [Vercel Documentation](https://vercel.com/docs)
- [Netlify Documentation](https://docs.netlify.com)

---

**Need Help?** Check the troubleshooting section or review the error messages in your browser console and deployment logs.

