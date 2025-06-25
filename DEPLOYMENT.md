# 🚀 Coffee Chat - Deployment Guide

This guide will walk you through deploying the Coffee Chat application to production.

## 📋 Prerequisites

Before deploying, ensure you have:

- [ ] GitHub repository with the Coffee Chat code
- [ ] MongoDB Atlas account
- [ ] Firebase project (for Google OAuth)
- [ ] Cloudinary account (for image uploads)
- [ ] Vercel account (for frontend)
- [ ] Render account (for backend)

## 🔧 Environment Setup

### 1. MongoDB Atlas Setup

1. **Create MongoDB Atlas Cluster**
   - Go to [MongoDB Atlas](https://www.mongodb.com/atlas)
   - Create a new project
   - Build a new cluster (M0 Free tier is sufficient for testing)
   - Choose your preferred cloud provider and region

2. **Configure Database Access**
   - Go to Database Access
   - Create a new database user
   - Set username and password (save these!)
   - Set privileges to "Read and write to any database"

3. **Configure Network Access**
   - Go to Network Access
   - Add IP Address: `0.0.0.0/0` (allows access from anywhere)
   - Or add specific IPs for better security

4. **Get Connection String**
   - Go to Clusters → Connect
   - Choose "Connect your application"
   - Copy the connection string
   - Replace `<password>` with your database user password

### 2. Firebase Setup

1. **Create Firebase Project**
   - Go to [Firebase Console](https://console.firebase.google.com/)
   - Create a new project
   - Enable Google Analytics (optional)

2. **Enable Authentication**
   - Go to Authentication → Sign-in method
   - Enable Google provider
   - Add your domain to authorized domains

3. **Create Service Account**
   - Go to Project Settings → Service Accounts
   - Click "Generate new private key"
   - Download the JSON file
   - Save the credentials for backend configuration

### 3. Cloudinary Setup

1. **Create Cloudinary Account**
   - Go to [Cloudinary](https://cloudinary.com/)
   - Sign up for a free account

2. **Get Credentials**
   - Go to Dashboard
   - Note your Cloud Name, API Key, and API Secret
   - Create an upload preset named "coffee-chat"

## 🌐 Backend Deployment (Render)

### 1. Prepare Backend for Deployment

1. **Update package.json**
   ```json
   {
     "scripts": {
       "start": "node server.js",
       "dev": "nodemon server.js"
     },
     "engines": {
       "node": ">=18.0.0"
     }
   }
   ```

2. **Create .env file for production**
   ```env
   PORT=3000
   NODE_ENV=production
   MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/coffee-chat
   JWT_SECRET=your-super-secret-jwt-key-change-this
   JWT_EXPIRE=7d
   FIREBASE_PROJECT_ID=your-firebase-project-id
   FIREBASE_PRIVATE_KEY_ID=your-private-key-id
   FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\nYour Private Key Here\n-----END PRIVATE KEY-----\n"
   FIREBASE_CLIENT_EMAIL=firebase-adminsdk-xxxxx@your-project.iam.gserviceaccount.com
   FIREBASE_CLIENT_ID=your-client-id
   FIREBASE_AUTH_URI=https://accounts.google.com/o/oauth2/auth
   FIREBASE_TOKEN_URI=https://oauth2.googleapis.com/token
   FIREBASE_AUTH_PROVIDER_X509_CERT_URL=https://www.googleapis.com/oauth2/v1/certs
   FIREBASE_CLIENT_X509_CERT_URL=https://www.googleapis.com/robot/v1/metadata/x509/firebase-adminsdk-xxxxx%40your-project.iam.gserviceaccount.com
   CLOUDINARY_CLOUD_NAME=your-cloud-name
   CLOUDINARY_API_KEY=your-api-key
   CLOUDINARY_API_SECRET=your-api-secret
   CLOUDINARY_UPLOAD_PRESET=coffee-chat
   FRONTEND_URL=https://your-frontend-domain.vercel.app
   ```

### 2. Deploy to Render

1. **Connect Repository**
   - Go to [Render](https://render.com/)
   - Sign up/Login with GitHub
   - Click "New +" → "Web Service"
   - Connect your GitHub repository

2. **Configure Service**
   - **Name**: `coffee-chat-backend`
   - **Environment**: `Node`
   - **Build Command**: `npm install`
   - **Start Command**: `npm start`
   - **Plan**: Free (or paid for better performance)

3. **Add Environment Variables**
   - Go to Environment tab
   - Add all variables from your .env file
   - Make sure to use production values

4. **Deploy**
   - Click "Create Web Service"
   - Wait for deployment to complete
   - Note your service URL (e.g., `https://coffee-chat-backend.onrender.com`)

## 🎨 Frontend Deployment (Vercel)

### 1. Prepare Frontend for Deployment

1. **Update API URLs**
   - In all components, update API calls to use your backend URL
   - Replace `http://localhost:3000` with your Render backend URL

2. **Create vercel.json** (already created)
   ```json
   {
     "buildCommand": "npm run build",
     "outputDirectory": "dist",
     "framework": "vite",
     "rewrites": [
       {
         "source": "/(.*)",
         "destination": "/index.html"
       }
     ]
   }
   ```

### 2. Deploy to Vercel

1. **Connect Repository**
   - Go to [Vercel](https://vercel.com/)
   - Sign up/Login with GitHub
   - Click "New Project"
   - Import your GitHub repository

2. **Configure Project**
   - **Framework Preset**: Vite
   - **Root Directory**: `frontend`
   - **Build Command**: `npm run build`
   - **Output Directory**: `dist`

3. **Add Environment Variables** (if needed)
   - Go to Settings → Environment Variables
   - Add any frontend-specific variables

4. **Deploy**
   - Click "Deploy"
   - Wait for deployment to complete
   - Note your frontend URL (e.g., `https://coffee-chat.vercel.app`)

## 🔄 Update Backend CORS

After deploying the frontend, update your backend CORS settings:

1. **Update Backend Environment**
   - Go to Render dashboard
   - Update `FRONTEND_URL` to your Vercel frontend URL

2. **Redeploy Backend**
   - Trigger a new deployment in Render

## 🧪 Testing Deployment

### 1. Test Backend API
```bash
# Test health check
curl https://your-backend-url.onrender.com/

# Test groups endpoint
curl https://your-backend-url.onrender.com/api/groups
```

### 2. Test Frontend
- Visit your Vercel frontend URL
- Test user registration/login
- Test creating groups and events
- Test image uploads

### 3. Test Integration
- Create a user account
- Create a group
- Create an event
- Upload images
- Join/leave groups and events

## 🔒 Security Considerations

### 1. Environment Variables
- Never commit .env files to Git
- Use strong, unique JWT secrets
- Rotate API keys regularly

### 2. CORS Configuration
- Only allow your frontend domain
- Remove wildcard CORS in production

### 3. Database Security
- Use strong database passwords
- Enable MongoDB Atlas security features
- Consider IP whitelisting for production

### 4. API Security
- Implement rate limiting
- Add request validation
- Monitor API usage

## 📊 Monitoring & Maintenance

### 1. Set Up Monitoring
- Enable Render logs
- Set up error tracking (Sentry)
- Monitor API response times

### 2. Regular Maintenance
- Update dependencies regularly
- Monitor database performance
- Backup data regularly

### 3. Scaling Considerations
- Upgrade Render plan for more traffic
- Consider CDN for static assets
- Implement caching strategies

## 🆘 Troubleshooting

### Common Issues

1. **CORS Errors**
   - Check FRONTEND_URL in backend environment
   - Verify CORS configuration in server.js

2. **Database Connection Issues**
   - Verify MongoDB Atlas connection string
   - Check network access settings
   - Ensure database user has correct permissions

3. **Image Upload Failures**
   - Verify Cloudinary credentials
   - Check upload preset configuration
   - Ensure proper CORS headers

4. **Authentication Issues**
   - Verify Firebase configuration
   - Check JWT secret configuration
   - Ensure proper token handling

### Getting Help

- Check Render logs for backend errors
- Check Vercel logs for frontend errors
- Review browser console for client-side errors
- Test API endpoints directly with Postman/curl

## 🎉 Success!

Once deployed successfully, your Coffee Chat application will be live and accessible to users worldwide!

**Frontend**: `https://your-app.vercel.app`
**Backend**: `https://your-backend.onrender.com`
**Database**: MongoDB Atlas

Remember to:
- Share your application with users
- Gather feedback
- Monitor performance
- Plan for future enhancements

Happy coding! ☕ 