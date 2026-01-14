# Render Deployment Guide for Yt-Ai

## ✅ Fixed Issues
- **MongoDB Version Conflict**: Downgraded from v7 to v5.9.2 (compatible with NextAuth adapter)
- **React Version Conflict**: Downgraded from v19 to v18.2.0 (compatible with Next.js 14)

## 🚀 Deployment Steps

### 1. Push Your Changes to GitHub
```bash
git add .
git commit -m "Fix dependency conflicts for Render deployment"
git push origin main
```

### 2. Deploy on Render

#### Option A: Using render.yaml (Recommended)
1. Go to [Render Dashboard](https://dashboard.render.com/)
2. Click **New +** → **Blueprint**
3. Connect your GitHub repository: `D216-cloud/Yt-Ai`
4. Render will automatically detect `render.yaml`
5. Add your environment variables in the Render dashboard

#### Option B: Manual Setup
1. Go to [Render Dashboard](https://dashboard.render.com/)
2. Click **New +** → **Web Service**
3. Connect your GitHub repository: `D216-cloud/Yt-Ai`
4. Configure:
   - **Name**: yt-ai
   - **Environment**: Node
   - **Region**: Oregon (or your preferred)
   - **Branch**: main
   - **Build Command**: `npm install && npm run build`
   - **Start Command**: `npm start`
   - **Plan**: Free

### 3. Set Environment Variables

In Render dashboard, add these environment variables:

```
GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret
YOUTUBE_CLIENT_ID=your_youtube_client_id
YOUTUBE_CLIENT_SECRET=your_youtube_client_secret
YOUTUBE_API_KEY=your_youtube_api_key
MONGO_URI=your_mongodb_uri
NEXTAUTH_URL=https://your-app-name.onrender.com
NEXTAUTH_SECRET=your_secret_key
JWT_SECRET=your_jwt_secret
```

**Important**: Update `NEXTAUTH_URL` with your actual Render URL after deployment!

### 4. Deploy
Click **Create Web Service** and wait for the build to complete.

## 📝 Post-Deployment

### Update OAuth Redirect URIs
After deployment, update your Google OAuth settings:

1. **Google Cloud Console** → Your Project → Credentials
2. Add authorized redirect URIs:
   ```
   https://your-app-name.onrender.com/api/auth/callback/google
   ```

3. **YouTube API** (if different project):
   ```
   https://your-app-name.onrender.com/api/youtube/auth
   ```

### Update NEXTAUTH_URL
1. Go to Render dashboard → Your service → Environment
2. Update `NEXTAUTH_URL` to your actual URL: `https://your-app-name.onrender.com`
3. Click **Save Changes** and redeploy if needed

## 🔍 Testing Your Deployment

Once deployed, your app will be available at:
```
https://your-app-name.onrender.com
```

### Verify:
- ✅ Homepage loads correctly
- ✅ Google OAuth login works
- ✅ YouTube connection works
- ✅ Database connection is successful

## 🐛 Troubleshooting

### Build Fails
- Check Render logs for specific errors
- Ensure all environment variables are set
- Verify Node.js version (22.16.0)

### OAuth Not Working
- Verify redirect URIs in Google Cloud Console
- Check `NEXTAUTH_URL` matches your Render URL
- Ensure `NEXTAUTH_SECRET` is set

### Database Connection Issues
- Verify `MONGO_URI` is correct
- Ensure MongoDB Atlas allows connections from all IPs (0.0.0.0/0)
- Check MongoDB Atlas cluster is active

## 📦 Package Versions (Fixed)
- mongodb: `^5.9.2` (was 7.0.0)
- react: `^18.2.0` (was 19)
- react-dom: `^18.2.0` (was 19)

## 🎉 Success!
Your app should now be live and accessible to everyone!
