# Chef Claude - AI Recipe Generator

A MERN stack application that generates personalized recipes using AI based on user ingredients and preferences.

## Project Structure

```
chef-claude/
├── backend/          # Express.js API server
├── frontend/         # React frontend
├── docker-compose.yml
└── README.md
```

## Tech Stack

- **Backend**: Node.js, Express.js, MongoDB, Mongoose
- **Frontend**: React, Vite
- **AI**: Google Gemini API
- **Auth**: Google OAuth + JWT
- **Storage**: MongoDB Atlas

## Phase 1 Features

- Chat-based ingredient input
- AI recipe generation via Gemini
- User authentication with Google OAuth
- Recipe saving and management
- User profile with saved recipes

## Getting Started

See individual README files in backend/ and frontend/ directories for setup instructions.

## Environment Variables

You'll need to configure the following environment variables:

- `MONGODB_URI` - MongoDB Atlas connection string
- `GEMINI_API_KEY` - Google Gemini API key
- `JWT_SECRET` - Secret for JWT token signing
- `GOOGLE_CLIENT_ID` - Google OAuth client ID
- `GOOGLE_CLIENT_SECRET` - Google OAuth client secret
- `CLOUDINARY_URL` - (Optional) Cloudinary for image storage
