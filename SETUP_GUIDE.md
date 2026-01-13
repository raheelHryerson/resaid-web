# Setup Guide: Auth + Database

## 🔐 Step 1: Setup Clerk (Authentication)

### Create Clerk Account
1. Go to https://dashboard.clerk.com/sign-up
2. Create your free account
3. Create a new application
4. Choose "Email & Password" as auth method

### Get Your Keys
1. Go to API Keys section
2. Copy `NEXT_PUBLIC_PUBLISHABLE_KEY`
3. Copy `SECRET_KEY`
4. Paste them into `.env.local`:
```
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_...
CLERK_SECRET_KEY=sk_test_...
```

### Test It
```bash
npm run dev
# Visit http://localhost:3000/sign-in
```

---

## 🗄️ Step 2: Setup Supabase (Database)

### Create Supabase Project
1. Go to https://supabase.com
2. Sign up (free tier available)
3. Create new project
4. Choose PostgreSQL
5. Wait for it to initialize (~2 min)

### Get Connection String
1. Go to Project Settings → Database
2. Copy the connection string: `postgresql://...`
3. Paste into `.env.local`:
```
DATABASE_URL=postgresql://user:password@host/database?schema=public
```

---

## 🔗 Step 3: Connect Database to App

### Create Tables
```bash
npx prisma migrate dev --name init
```

This will:
- Create User, Resume, Application tables
- Generate Prisma Client
- Set up migrations folder

### Test Connection
The tables are now ready in your database!

---

## 📋 What's Ready

✅ **Authentication**
- Sign in/Sign up pages
- Protected dashboard at `/dashboard`
- User profile with Clerk UserButton

✅ **Database Schema**
- Users linked to Clerk
- Resumes storage
- Job applications tracking

✅ **Next Steps**
- Resume upload API
- File storage (AWS S3 or Supabase Storage)
- Resume parsing
- Dashboard features

---

## 🚀 Quick Testing

1. Start dev server: `npm run dev`
2. Visit `http://localhost:3000`
3. Click "Get Started" → Sign up
4. You'll be redirected to `/dashboard`
5. See your name displayed!

---

## Troubleshooting

**Error: "Missing Clerk keys"**
- Make sure `.env.local` has your Clerk keys
- Restart dev server after adding keys

**Error: "Can't connect to database"**
- Check DATABASE_URL in `.env.local`
- Make sure Supabase project is initialized
- Run `npx prisma db push` to sync schema

**Clerk sign-in page not loading**
- Clear browser cache
- Check that `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY` is correct
- Make sure domain is whitelisted in Clerk dashboard

---

## Next: File Storage & Resume Parsing
Once database is working, we'll add:
1. Resume file upload to Supabase Storage
2. Resume parsing with AI
3. Autofill functionality
