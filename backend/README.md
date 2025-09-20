# Chef Claude Backend

Express.js API server for the Chef Claude AI Recipe Generator application.

## Features

- 🔐 Google OAuth authentication with JWT tokens
- 🤖 AI recipe generation using Google Gemini API
- 📚 Recipe management (save, like, comment)
- 👤 User profiles and preferences
- 🔍 Recipe search and filtering
- 📊 Rate limiting and security middleware

## Quick Start

### 1. Install Dependencies

```bash
npm install
```

### 2. Environment Setup

Copy the example environment file and configure your variables:

```bash
cp env.example .env
```

Required environment variables:

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

### 3. Run the Server

Development mode with auto-restart:
```bash
npm run dev
```

Production mode:
```bash
npm start
```

The server will start on `http://localhost:5000`

## API Endpoints

### Authentication
- `GET /api/auth/google` - Initiate Google OAuth
- `GET /api/auth/google/callback` - Google OAuth callback
- `GET /api/auth/me` - Get current user profile
- `PUT /api/auth/preferences` - Update user preferences
- `POST /api/auth/logout` - Logout user
- `DELETE /api/auth/account` - Delete user account

### Recipes
- `POST /api/recipes/generate` - Generate AI recipe
- `GET /api/recipes` - Get all recipes (with filters)
- `GET /api/recipes/:id` - Get single recipe
- `POST /api/recipes/:id/save` - Save recipe to user collection
- `DELETE /api/recipes/:id/save` - Remove recipe from collection
- `POST /api/recipes/:id/like` - Like/unlike recipe
- `POST /api/recipes/:id/comments` - Add comment to recipe
- `PUT /api/recipes/:id` - Update recipe (author only)
- `DELETE /api/recipes/:id` - Delete recipe (author only)

### Users
- `GET /api/users/me/recipes` - Get user's saved recipes
- `GET /api/users/me/favorites` - Get user's favorite recipes
- `GET /api/users/me/created` - Get user's created recipes
- `GET /api/users/me/stats` - Get user statistics
- `GET /api/users/:id/profile` - Get public user profile
- `GET /api/users/:id/recipes` - Get user's public recipes
- `PUT /api/users/me/profile` - Update user profile

## Database Models

### User
- Basic profile information
- Google OAuth integration
- Recipe collections (saved, favorites)
- Dietary preferences and allergies

### Recipe
- Complete recipe information
- Ingredients with quantities and units
- Step-by-step instructions
- Nutritional information
- Social features (likes, comments)

### Comment
- Recipe comments and ratings
- User association
- Edit tracking

## Security Features

- Helmet.js for security headers
- Rate limiting (100 requests per 15 minutes)
- Input validation with express-validator
- JWT token authentication
- CORS configuration
- Environment variable protection

## Development

### Running Tests
```bash
npm test
npm run test:watch
```

### Project Structure
```
backend/
├── config/          # Configuration files
├── middleware/      # Custom middleware
├── models/          # Mongoose models
├── routes/          # API route handlers
├── utils/           # Utility functions
├── server.js        # Main server file
└── package.json
```

## Deployment

The backend is designed to be deployed on platforms like:
- Heroku
- Railway
- DigitalOcean App Platform
- AWS EC2/ECS

Make sure to set all required environment variables in your deployment environment.

## Next Steps

1. Set up your MongoDB Atlas database
2. Configure Google OAuth credentials
3. Get your Gemini API key
4. Start the frontend development server
5. Test the complete application flow
