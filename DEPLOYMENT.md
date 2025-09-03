# VizGraph Deployment Guide

## Overview
VizGraph is deployed using:
- **Backend**: Render (Node.js/Express)
- **Frontend**: Netlify (React)
- **Database**: MongoDB Atlas

## Backend Deployment (Render)

1. **Create a Render Account**: Sign up at [render.com](https://render.com)

2. **Connect Your Repository**: 
   - Connect your GitHub repository to Render
   - Select "Web Service" for deployment

3. **Configure Build Settings**:
   - **Build Command**: `cd server && npm install`
   - **Start Command**: `cd server && npm start`
   - **Environment**: Node.js

4. **Set Environment Variables**:
   ```
   NODE_ENV=production
   MONGO_URI=your_mongodb_atlas_connection_string
   JWT_SECRET=your_jwt_secret_key
   GOOGLE_CLIENT_ID=your_google_oauth_client_id
   GOOGLE_CLIENT_SECRET=your_google_oauth_client_secret
   OPENAI_API_KEY=your_openai_api_key
   ```

5. **Deploy**: Render will automatically build and deploy your backend

## Frontend Deployment (Netlify)

1. **Create a Netlify Account**: Sign up at [netlify.com](https://netlify.com)

2. **Connect Your Repository**:
   - Connect your GitHub repository to Netlify
   - Select the repository containing your React app

3. **Configure Build Settings**:
   - **Base directory**: `client`
   - **Build command**: `npm run build`
   - **Publish directory**: `client/build`

4. **Set Environment Variables**:
   ```
   REACT_APP_API_URL=https://your-render-backend-url.onrender.com/api
   REACT_APP_GOOGLE_CLIENT_ID=your_google_oauth_client_id
   ```

5. **Deploy**: Netlify will automatically build and deploy your frontend

## MongoDB Atlas Setup

1. **Create a MongoDB Atlas Account**: Sign up at [mongodb.com/atlas](https://mongodb.com/atlas)

2. **Create a Cluster**: 
   - Choose a free tier cluster
   - Select a region close to your users

3. **Configure Database Access**:
   - Create a database user with read/write permissions
   - Note the username and password

4. **Configure Network Access**:
   - Allow access from anywhere (0.0.0.0/0) for Render deployment
   - Or add Render's IP addresses if available

5. **Get Connection String**:
   - Click "Connect" on your cluster
   - Choose "Connect your application"
   - Copy the connection string and replace `<password>` with your database user password

## Google OAuth Setup

1. **Google Cloud Console**: Go to [console.cloud.google.com](https://console.cloud.google.com)

2. **Create a Project**: Create a new project or select an existing one

3. **Enable Google+ API**: 
   - Go to "APIs & Services" → "Library"
   - Search for "Google+ API" and enable it

4. **Create OAuth Credentials**:
   - Go to "APIs & Services" → "Credentials"
   - Click "Create Credentials" → "OAuth 2.0 Client ID"
   - Configure the consent screen if prompted

5. **Configure OAuth Client**:
   - **Application type**: Web application
   - **Authorized JavaScript origins**: 
     - `http://localhost:3000` (development)
     - `https://your-netlify-domain.netlify.app` (production)
   - **Authorized redirect URIs**: Same as above

6. **Copy Client ID**: Use this in your environment variables

## OpenAI Setup (Optional)

1. **OpenAI Account**: Sign up at [platform.openai.com](https://platform.openai.com)

2. **Create API Key**:
   - Go to "API Keys" section
   - Create a new secret key
   - Copy and save it securely

3. **Set Usage Limits**: Configure billing and usage limits as needed

## Post-Deployment Checklist

- [ ] Backend is accessible at Render URL
- [ ] Frontend is accessible at Netlify URL  
- [ ] Database connection is working
- [ ] User registration/login works
- [ ] File upload functionality works
- [ ] Chart generation works
- [ ] Google OAuth works
- [ ] AI summary generation works (if OpenAI key provided)
- [ ] Admin panel is accessible
- [ ] All API endpoints respond correctly

## Environment Variables Summary

### Backend (.env)
```
NODE_ENV=production
MONGO_URI=mongodb+srv://username:password@cluster.mongodb.net/database
JWT_SECRET=your_super_secret_jwt_key
GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret
OPENAI_API_KEY=sk-your_openai_api_key
```

### Frontend (client/.env)
```
REACT_APP_API_URL=https://your-backend.onrender.com/api
REACT_APP_GOOGLE_CLIENT_ID=your_google_client_id
```

## Troubleshooting

### Common Issues:

1. **CORS Errors**: Make sure your backend allows your frontend domain
2. **API Connection**: Verify the REACT_APP_API_URL is correct
3. **OAuth Issues**: Check authorized domains in Google Cloud Console
4. **Database Connection**: Verify MongoDB Atlas IP whitelist includes 0.0.0.0/0
5. **Environment Variables**: Double-check all environment variables are set correctly

### Monitoring:
- Check Render logs for backend errors
- Check Netlify deploy logs for frontend build issues
- Use browser developer tools to debug client-side issues