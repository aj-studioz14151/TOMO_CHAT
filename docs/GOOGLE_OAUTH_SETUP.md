# Enable Google OAuth Login - Quick Guide

## Why isn't Google login showing?

Google OAuth requires credentials to be set up. If you don't see the Google login button, it means the Google OAuth credentials are not configured in your environment variables.

## How to Enable Google OAuth

### Step 1: Create Google OAuth Credentials

1. Go to [Google Cloud Console](https://console.cloud.google.com/apis/credentials)
2. Create a new project or select an existing one
3. Click **"Create Credentials"** → **"OAuth 2.0 Client ID"**
4. Configure OAuth consent screen if prompted
5. Select **"Web application"** as application type
6. Add authorized redirect URIs:
   - For production: `https://your-domain.com/api/auth/callback/google`
   - For local development: `http://localhost:3000/api/auth/callback/google`
7. Click **"Create"** and copy your:
   - **Client ID**
   - **Client Secret**

### Step 2: Add to Environment Variables

Create a `.env` file in your project root (or update your existing one):

```bash
# Google OAuth
GOOGLE_CLIENT_ID=your_client_id_here
GOOGLE_CLIENT_SECRET=your_client_secret_here

# Optional: Force account selection every time
GOOGLE_FORCE_ACCOUNT_SELECTION=1
```

### Step 3: Restart Your Application

After adding the credentials, restart your development server:

```bash
pnpm dev
```

The Google login button will now appear on your sign-in page! 🎉

## For Vercel Deployment

Add these environment variables in your Vercel project settings:
1. Go to your project on Vercel
2. Settings → Environment Variables
3. Add `GOOGLE_CLIENT_ID` and `GOOGLE_CLIENT_SECRET`
4. Redeploy your application

---

## Troubleshooting

**Button still not showing?**
- Check that both `GOOGLE_CLIENT_ID` and `GOOGLE_CLIENT_SECRET` are set
- Verify there are no typos in the environment variable names
- Restart your dev server after changing .env
- Check browser console for any errors

**OAuth error when clicking login?**
- Verify your redirect URI is correctly configured in Google Cloud Console
- Make sure the URI matches exactly (including http/https)
- Check that your Google project's OAuth consent screen is configured

Need more help? Check the [Better Auth documentation](https://www.better-auth.com/docs/authentication/social)
