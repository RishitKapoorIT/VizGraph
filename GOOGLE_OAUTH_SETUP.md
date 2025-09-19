# Google OAuth Setup Guide

## Steps to Enable Google Sign-In

### 1. Go to Google Cloud Console
- Visit: https://console.cloud.google.com/
- Sign in with your Google account

### 2. Create a New Project (or select existing)
- Click "Select a project" → "New Project"
- Enter project name: "VizGraph" 
- Click "Create"

### 3. Enable Google+ API
- Go to "APIs & Services" → "Library"
- Search for "Google+ API"
- Click on it and press "Enable"

### 4. Create OAuth 2.0 Credentials
- Go to "APIs & Services" → "Credentials"
- Click "Create Credentials" → "OAuth 2.0 Client IDs"
- Configure OAuth consent screen if prompted:
  - User Type: External
  - App name: VizGraph
  - User support email: your-email@domain.com
  - Developer contact: your-email@domain.com

### 5. Configure OAuth Client
- Application type: "Web application"
- Name: "VizGraph Web Client"
- Authorized JavaScript origins:
  - http://localhost:3000
  - http://127.0.0.1:3000
- Authorized redirect URIs:
  - http://localhost:3000
  - http://127.0.0.1:3000

### 6. Get Your Client ID
- Copy the "Client ID" (looks like: 123456789-abcdef.apps.googleusercontent.com)
- Replace "your-google-client-id.apps.googleusercontent.com" in `client/src/index.js`

### 7. Update Backend API
Make sure your backend `/api/auth/google` endpoint handles Google tokens:

```javascript
// In your server/routes/auth.js or similar
app.post('/api/auth/google', async (req, res) => {
  try {
    const { token } = req.body;
    
    // Verify the Google token
    const ticket = await client.verifyIdToken({
      idToken: token,
      audience: process.env.GOOGLE_CLIENT_ID,
    });
    
    const payload = ticket.getPayload();
    const { email, name, picture } = payload;
    
    // Find or create user in your database
    let user = await User.findOne({ email });
    if (!user) {
      user = new User({ 
        email, 
        name, 
        avatar: picture,
        provider: 'google' 
      });
      await user.save();
    }
    
    // Generate your app's JWT token
    const appToken = jwt.sign({ userId: user._id }, process.env.JWT_SECRET);
    
    res.json({ token: appToken, user });
  } catch (error) {
    res.status(400).json({ message: 'Google authentication failed' });
  }
});
```

### 8. Test Google Sign-In
- Run your app: `npm start`
- Click "Sign in with Google"
- Select your Google account
- Should redirect to dashboard on success

## Troubleshooting

### "Access blocked: Authorization Error"
- Make sure your domain is added to "Authorized JavaScript origins"
- Check that OAuth consent screen is properly configured

### "invalid_client: no registered origin"
- Add http://localhost:3000 to authorized origins
- Make sure there are no trailing slashes

### Backend errors
- Install google-auth-library: `npm install google-auth-library`
- Set GOOGLE_CLIENT_ID in your .env file
- Make sure your `/api/auth/google` endpoint exists
