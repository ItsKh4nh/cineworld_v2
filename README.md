# CineWorld – Movies at your fingertips🎬

A web application project focused on building a FREE movies streaming platform with a clean and modern UI, integrated with a Neural Collaborative Filtering to gave out personalized movie recommendations. The project aims delivered a seamless and enjoyable experience for movie enjoyers.

## ✨ Features

- Sign up and Log in functionality (supports Guest mode with limited features).
- Browse movies in many categories and criteria.
- Also acts as a Encyclopedia with extensive information about movies and people.
- Search for movies or people.
- Watch numerous movies with high quality and no delays.
- List management for for archival purposes.
- Profile management (for logged in users)
- Get personalized movie recommendations for logged in users through external APIs

## 🚀 Technology Stack

- **Frontend:**
  - React 19
  - Vite as the build tool
  - React Router for routing
  - Tailwind CSS for styling
  - Axios for HTTP requests
- **Backend/BaaS:**
  - Firebase for backend services:
    - Authentication (email/password)
    - Firestore for database storage
    - Vercel for deployment
- **APIs:**
  - TMDB (The Movie Database) API for movie and people data
  - Custom recommendation API (https://api-cineworld.onrender.com) for AI-based movie recommendations

## ⚙️ Getting Started

### Prerequisites

- Node.js (v18 or later recommended)
- npm (Node Package Manager)
- Firebase Project: You need to set up a Firebase project and obtain the configuration credentials.
- TMDB API Key: Register at https://www.themoviedb.org/documentation/api to get your API key

### Installation

1.  Clone the repository:
    ```bash
    git clone https://github.com/ItsKh4nh/cineworld_v2
    cd cineworld
    ```
2.  Install dependencies:
    ```bash
    npm install
    ```
3.  Set up environment variables:

    - Create a `.env` file in the root directory by copying `.env.sample`.
    - Fill in the necessary Firebase configuration values and any other required variables (e.g., API keys for movie data). Refer to `.env.sample` for the required variables.

    ```
    # .env example content (replace with your actual Firebase config)
    VITE_FIREBASE_API_KEY=your_api_key
    VITE_FIREBASE_AUTH_DOMAIN=your_auth_domain
    VITE_FIREBASE_PROJECT_ID=your_project_id
    VITE_FIREBASE_STORAGE_BUCKET=your_storage_bucket
    VITE_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
    VITE_FIREBASE_APP_ID=your_app_id
    VITE_FIREBASE_MEASUREMENT_ID=your_measurement_id

    # TMDB API key (required for movie data)
    VITE_TMDB_API_KEY=your_tmdb_api_key
    ```

### Running the Development Server

```bash
npm run dev
```

This will start the Vite development server, typically available at `http://localhost:5173` (or the next available port).

## 📜 Available Scripts

- `npm run dev`: Starts the development server with hot module replacement.
- `npm run build`: Builds the production-ready application in the `dist/` folder.
- `npm run preview`: Serves the production build locally for testing.

## 📁 Project Structure

```
cineworld/
├── public/               # Static assets
├── src/                  # Source directory
│   ├── assets/           # Icons
│   ├── components/       # Reusable UI components
│   ├── config/           # Configuration files (API endpoints, constants)
│   ├── contexts/         # React context providers
│   ├── controllers/      # Application logic controllers
│   ├── firebase/         # Firebase configuration and utilities
│   ├── hooks/            # Custom React hooks
│   ├── Pages/            # Page-level components
│   ├── routes/           # Routing configuration
│   ├── services/         # API service integrations
│   ├── utils/            # Utility functions
│   ├── App.jsx           # Main application component
│   ├── App.css           # Global App styles
│   ├── index.css         # Global styles / Tailwind base/components/utilities
│   ├── index.jsx         # Entry point for the React application
│   └── axios.js          # Axios instance configuration
├── .env.sample           # Example environment variables
├── .gitignore            # Git ignore configuration
├── index.html            # HTML entry point
├── package.json          # Project metadata and dependencies
├── package-lock.json     # Exact dependency versions
├── postcss.config.cjs    # PostCSS configuration
├── tailwind.config.cjs   # Tailwind CSS configuration
├── vite.config.js        # Vite configuration
```
