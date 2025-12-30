# ✅ Quick Deployment Checklist

Use this checklist to ensure you don't miss any steps during deployment.

## Pre-Deployment

- [ ] Code is working locally (`npm run dev`)
- [ ] Production build works (`npm run build`)
- [ ] All code is committed to Git
- [ ] No console errors in development

## Backend (Convex)

- [ ] Run `npm run convex:deploy`
- [ ] Save production Convex URL
- [ ] Set `JWT_PRIVATE_KEY` in Convex Dashboard
- [ ] Set `JWKS` in Convex Dashboard
- [ ] Set `OPENAI_API_KEY` (if using AI features)

## Frontend (Vercel/Netlify)

- [ ] Create account on hosting platform
- [ ] Connect Git repository
- [ ] Configure build settings:
  - Build command: `npm run build`
  - Output directory: `dist`
- [ ] Set `VITE_CONVEX_URL` environment variable
- [ ] Deploy and get production URL

## Connect Everything

- [ ] Set `CONVEX_SITE_URL` in Convex Dashboard (your frontend URL)
- [ ] Verify all environment variables are set correctly

## Testing

- [ ] Visit production URL
- [ ] Test user registration
- [ ] Test user login
- [ ] Test creating a task
- [ ] Test updating a task
- [ ] Test real-time sync (open in 2 tabs)
- [ ] Check browser console for errors
- [ ] Test on mobile device (if applicable)

## Post-Deployment

- [ ] Share URL with team/users
- [ ] Set up custom domain (optional)
- [ ] Monitor for errors in first 24 hours

---

**Quick Commands Reference:**

```bash
# Deploy Convex backend
npm run convex:deploy

# Build frontend locally
npm run build

# Preview production build
npm run preview
```

