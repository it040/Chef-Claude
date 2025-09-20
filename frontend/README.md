# Chef Claude Frontend

React frontend application for the Chef Claude AI Recipe Generator.

## Features

- 🎨 Modern Material-UI design
- 🔐 Google OAuth authentication
- 💬 Interactive chat interface for recipe generation
- 📱 Responsive design for all devices
- 🔍 Recipe search and filtering
- ❤️ Save and favorite recipes
- 👤 User profile management
- 🚀 Fast performance with React Query

## Quick Start

### 1. Install Dependencies

```bash
npm install
```

### 2. Environment Setup

Copy the example environment file:

```bash
cp env.example .env
```

Configure your environment variables:

```env
# API Configuration
REACT_APP_API_URL=http://localhost:5000

# Development
REACT_APP_NODE_ENV=development
```

### 3. Start Development Server

```bash
npm run dev
```

The application will start on `http://localhost:3000`

## Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm run lint` - Run ESLint

## Project Structure

```
src/
├── components/          # Reusable UI components
│   ├── Navbar.jsx      # Navigation bar
│   └── ProtectedRoute.jsx # Route protection
├── pages/              # Page components
│   ├── Home.jsx        # Main page with recipe generation
│   ├── Login.jsx       # Authentication page
│   ├── Profile.jsx     # User profile page
│   ├── SavedRecipes.jsx # Saved recipes page
│   └── RecipeDetail.jsx # Recipe detail page
├── context/            # React Context providers
│   └── AuthContext.jsx # Authentication context
├── services/           # API services
│   └── api.js         # API client configuration
├── hooks/              # Custom React hooks
├── utils/              # Utility functions
└── styles/             # Global styles
```

## Key Technologies

- **React 19** - Latest React features
- **Vite** - Fast build tool and dev server
- **Material-UI** - Modern component library
- **React Router** - Client-side routing
- **React Query** - Data fetching and caching
- **Axios** - HTTP client

## Features Overview

### Home Page
- Recipe generation interface
- Ingredient input with preferences
- Recent recipes display
- Responsive design

### Authentication
- Google OAuth integration
- JWT token management
- Protected routes
- User session handling

### Recipe Management
- Save/unsave recipes
- Like/unlike functionality
- Recipe search and filtering
- Detailed recipe view

### User Profile
- Profile information display
- Preference management
- Recipe statistics
- Saved recipes overview

## API Integration

The frontend communicates with the backend API through:

- **Authentication**: Google OAuth flow
- **Recipes**: CRUD operations for recipes
- **Users**: Profile and preference management
- **Real-time**: React Query for data synchronization

## Responsive Design

The application is fully responsive and works on:
- Desktop computers
- Tablets
- Mobile phones
- Various screen sizes

## Development

### Code Style
- ESLint for code quality
- Prettier for code formatting
- Material-UI design system

### State Management
- React Context for global state
- React Query for server state
- Local state with React hooks

### Performance
- Code splitting with React.lazy
- Image optimization
- Efficient re-renders
- Caching with React Query

## Deployment

The frontend can be deployed to:
- Vercel
- Netlify
- GitHub Pages
- AWS S3 + CloudFront
- Any static hosting service

Build for production:
```bash
npm run build
```

The built files will be in the `dist/` directory.

## Browser Support

- Chrome (latest)
- Firefox (latest)
- Safari (latest)
- Edge (latest)

## Contributing

1. Follow the existing code style
2. Use meaningful commit messages
3. Test your changes thoroughly
4. Update documentation as needed