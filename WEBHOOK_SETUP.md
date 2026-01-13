# Clerk Webhook Setup Guide

## What This Does
The webhook at `/api/webhooks/clerk` automatically syncs Clerk users to your PostgreSQL database when they sign up, update their profile, or delete their account.

**Events handled:**
- `user.created` → Creates User record in database
- `user.updated` → Updates User record in database
- `user.deleted` → Deletes User record from database

## Setup Steps

### 1. Get Your Webhook Signing Secret

1. Go to [Clerk Dashboard](https://dashboard.clerk.com)
2. Select your project (ResAid)
3. Navigate to **Webhooks** (left sidebar)
4. Click **+ Create** or **Add endpoint**
5. Enter the Endpoint URL: `http://localhost:3000/api/webhooks/clerk` (for local testing)
   - Later, change to: `https://yourdomain.com/api/webhooks/clerk` (for production)
6. Select events to subscribe to:
   - ✅ `user.created`
   - ✅ `user.updated`
   - ✅ `user.deleted`
7. Click **Create**
8. You'll see a **Signing Secret** - copy it

### 2. Add Secret to Environment

Add this to `.env.local`:
```
CLERK_WEBHOOK_SECRET=whsec_xxxxxxxxxxxxxxxxxxxx
```

Replace `xxxxxxxxxxxxxxxxxxxx` with your actual signing secret from step 1.

### 3. Test the Webhook Locally

#### Option A: Using Clerk's SVX Testing Tool (Easiest)

1. In Clerk Dashboard → Webhooks, find your endpoint
2. Click the **Test** button
3. Select `user.created` event
4. Click **Send Example**
5. Check your Next.js dev server console for "User created:" message

#### Option B: Using Clerk CLI

```bash
# Install if you don't have it
npm install -g @clerk/cli

# Sign in
clerk login

# Trigger test webhook
clerk webhooks trigger user.created --port 3000
```

#### Option C: Sign Up in Your App

1. Start dev server: `npm run dev`
2. Go to `http://localhost:3000`
3. Click "Get Started" → Sign Up with email/password
4. Complete signup
5. Check console - you should see "User created: [user-id] [email]"
6. Check Supabase → `User` table - new user should appear there

### 4. Verify It Works

After a user signs up or updates their profile:

**Check database:**
```sql
SELECT * FROM "User" ORDER BY "createdAt" DESC LIMIT 1;
```

You should see the user record with:
- `clerkId` - matching their Clerk user ID
- `email` - their email address
- `firstName`, `lastName` - their name (if provided)
- `avatarUrl` - their profile picture (if they have one)

### 5. Deploy to Production

When you deploy to Vercel:

1. Update the webhook endpoint URL in Clerk Dashboard to: `https://yourdomain.vercel.app/api/webhooks/clerk`
2. Add `CLERK_WEBHOOK_SECRET` to Vercel environment variables
3. Clerk will send real webhook events to production

## Troubleshooting

### Webhook not firing?
- ✅ Check `.env.local` has `CLERK_WEBHOOK_SECRET`
- ✅ Verify endpoint URL is correct in Clerk Dashboard
- ✅ Check Clerk webhooks logs for errors
- ✅ Restart dev server after adding env var

### "Webhook signature verification failed"?
- ✅ Make sure `CLERK_WEBHOOK_SECRET` matches exactly (copy-paste from Clerk)
- ✅ Check for typos in the secret

### User not appearing in database?
- ✅ Check your Next.js console for errors
- ✅ Verify `CLERK_WEBHOOK_SECRET` is correct
- ✅ Check Supabase connection string in `.env`
- ✅ Run `npx prisma generate` to regenerate Prisma client

## How the System Works

```
User Signs Up at /sign-up
        ↓
Clerk handles authentication & stores user
        ↓
Clerk sends webhook POST to /api/webhooks/clerk
        ↓
Our code verifies signature with CLERK_WEBHOOK_SECRET
        ↓
Extract user data: email, name, avatar
        ↓
Prisma creates/updates User record in PostgreSQL
        ↓
✅ User now in your database!
        ↓
Dashboard can now query database for user's resumes, applications, etc.
```

## Next Steps

Once webhook is working:
1. Test signing up a new user
2. Verify they appear in Supabase User table
3. Build the Resume Upload API endpoint
4. Implement resume parsing
5. Add AI answer generation
6. Build Chrome extension
