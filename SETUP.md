# Chef Claude - Complete Setup Guide

This guide will help you set up the complete Chef Claude MERN stack application from scratch.

## Prerequisites

Before you begin, make sure you have the following installed:
- Node.js (v18 or higher)
- npm or yarn
- Git
- MongoDB Atlas account (or local MongoDB)
- Google Cloud Console account
- Google AI Studio account

## Quick Start

### 1. Clone and Setup

```bash
# Clone the repository
git clone <your-repo-url>
cd chef-claude

# Initialize git (if starting fresh)
git init
git add .
git commit -m "Initial commit: Chef Claude MERN app setup"
```

### 2. Backend Setup

```bash
cd backend

# Install dependencies
npm install

# Copy environment file
cp env.example .env

# Edit .env with your actual values
nano .env  # or use your preferred editor
```

**Backend Environment Variables (.env):**
```env
# Database
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/chef-claude

# JWT Secret (generate a strong random string)
JWT_SECRET=your-super-secret-jwt-key-here

# Google OAuth (from Google Cloud Console)
GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-client-secret

# Gemini AI (from Google AI Studio)
GEMINI_API_KEY=your-gemini-api-key

# Server
PORT=5000
NODE_ENV=development
FRONTEND_URL=http://localhost:3000
```

### 3. Frontend Setup

```bash
cd ../frontend

# Install dependencies
npm install

# Copy environment file
cp env.example .env

# Edit .env with your actual values
nano .env
```

**Frontend Environment Variables (.env):**
```env
# API Configuration
REACT_APP_API_URL=http://localhost:5000

# Development
REACT_APP_NODE_ENV=development
```

### 4. Start Development Servers

**Terminal 1 - Backend:**
```bash
cd backend
npm run dev
```

**Terminal 2 - Frontend:**
```bash
cd frontend
npm run dev
```

The application will be available at:
- Frontend: http://localhost:3000
- Backend API: http://localhost:5000

## Detailed Setup Instructions

### MongoDB Setup

#### Option 1: MongoDB Atlas (Recommended)

1. Go to [MongoDB Atlas](https://www.mongodb.com/cloud/atlas)
2. Create a free account and cluster
3. Create a database user
4. Whitelist your IP address
5. Get your connection string and add it to `backend/.env`

#### Option 2: Local MongoDB

```bash
# Install MongoDB locally
# On macOS with Homebrew:
brew install mongodb-community

# On Ubuntu:
sudo apt-get install mongodb

# Start MongoDB service
sudo systemctl start mongod
```

### Google OAuth Setup

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select existing
3. Enable the Google+ API
4. Go to "Credentials" → "Create Credentials" → "OAuth 2.0 Client ID"
5. Set authorized redirect URIs:
   - `http://localhost:5000/api/auth/google/callback` (development)
   - `https://yourdomain.com/api/auth/google/callback` (production)
6. Copy Client ID and Secret to your `.env` file

### Gemini AI Setup

1. Go to [Google AI Studio](https://aistudio.google.com/)
2. Create an API key
3. Copy the API key to your `.env` file

## Docker Setup (Alternative)

If you prefer using Docker:

```bash
# Start all services with Docker Compose
docker-compose up -d

# View logs
docker-compose logs -f

# Stop services
docker-compose down
```

## Testing the Setup

### 1. Backend Health Check

```bash
curl http://localhost:5000/api/health
```

Expected response:
```json
{
  "status": "OK",
  "timestamp": "2024-01-01T00:00:00.000Z",
  "uptime": 123.456
}
```

### 2. Frontend Access

Visit http://localhost:3000 and verify:
- ✅ Page loads without errors
- ✅ Navigation works
- ✅ Google sign-in button is visible

### 3. Authentication Test

1. Click "Sign in with Google"
2. Complete Google OAuth flow
3. Verify you're redirected back and logged in

### 4. Recipe Generation Test

1. Enter some ingredients (e.g., "chicken, rice, broccoli")
2. Click "Generate Recipe"
3. Verify a recipe is generated and displayed

## API Testing with Postman

### Authentication Flow

1. **GET** `http://localhost:5000/api/auth/google`
   - Should redirect to Google OAuth

2. **GET** `http://localhost:5000/api/auth/me`
   - Headers: `Authorization: Bearer <your-jwt-token>`
   - Should return user profile

### Recipe Generation

```bash
# Generate recipe
curl -X POST http://localhost:5000/api/recipes/generate \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <your-jwt-token>" \
  -d '{
    "ingredients": ["chicken", "rice", "broccoli"],
    "preferences": {
      "difficulty": "medium",
      "maxTime": 60
    }
  }'
```

## Common Issues and Solutions

### 1. MongoDB Connection Error

**Error:** `MongoServerError: Authentication failed`

**Solution:**
- Check your MongoDB URI format
- Verify username/password are correct
- Ensure IP is whitelisted in MongoDB Atlas

### 2. Google OAuth Error

**Error:** `redirect_uri_mismatch`

**Solution:**
- Add exact callback URL to Google Cloud Console
- Check for trailing slashes in URLs
- Verify domain matches exactly

### 3. Gemini API Error

**Error:** `Invalid API key`

**Solution:**
- Verify API key is correct
- Check API key permissions
- Ensure billing is enabled (for some features)

### 4. CORS Error

**Error:** `Access to fetch at 'http://localhost:5000' from origin 'http://localhost:3000' has been blocked by CORS policy`

**Solution:**
- Check `FRONTEND_URL` in backend `.env`
- Verify CORS configuration in `server.js`

## Production Deployment

### Environment Variables

Update your environment variables for production:

```env
# Backend (.env)
NODE_ENV=production
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/chef-claude
FRONTEND_URL=https://yourdomain.com
# ... other variables

# Frontend (.env)
REACT_APP_API_URL=https://api.yourdomain.com
REACT_APP_NODE_ENV=production
```

### Deployment Platforms

**Backend:**
- Heroku
- Railway
- DigitalOcean App Platform
- AWS EC2/ECS

**Frontend:**
- Vercel
- Netlify
- GitHub Pages
- AWS S3 + CloudFront

### Security Checklist

- [ ] Use strong JWT secrets
- [ ] Enable HTTPS in production
- [ ] Set up proper CORS origins
- [ ] Use environment variables for all secrets
- [ ] Enable rate limiting
- [ ] Set up monitoring and logging

## Next Steps

Once your setup is complete:

1. **Test all features:**
   - User registration/login
   - Recipe generation
   - Recipe saving
   - Profile management

2. **Customize the application:**
   - Modify the UI/UX
   - Add new features
   - Integrate additional APIs

3. **Deploy to production:**
   - Set up CI/CD pipeline
   - Configure monitoring
   - Set up backups

## Support

If you encounter issues:

1. Check the logs in both frontend and backend
2. Verify all environment variables are set correctly
3. Test API endpoints individually
4. Check network connectivity
5. Review the troubleshooting section above

## Contributing

To contribute to this project:

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

Happy cooking with Chef Claude! 🍳👨‍🍳
