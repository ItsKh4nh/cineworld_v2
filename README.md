# CineWorld 🎬

A web application likely focused on movies, showtimes, or related entertainment content. Built with React, Vite, and Firebase.

## ✨ Features

_(Note: These are inferred features based on project structure and dependencies. Please update with actual features.)_

- Browse movies/shows.
- View details (potentially including trailers via `react-youtube`).
- User authentication (inferred from Firebase).
- Interactive carousels/sliders (inferred from `swiper`).
- Responsive design (using Tailwind CSS).
- Notifications/Feedback (inferred from `react-hot-toast`).
- Smooth animations/transitions (inferred from `react-awesome-reveal`).

## 🚀 Technology Stack

- **Frontend:**
  - React 19 (`react`, `react-dom`)
  - Vite (`vite`) as the build tool
  - React Router (`react-router-dom`) for routing
  - Tailwind CSS (`tailwindcss`) for styling
  - Axios (`axios`) for HTTP requests
- **Backend/BaaS:**
  - Firebase (`firebase`) for backend services (authentication, database, etc. - specific usage needs confirmation)
- **UI Libraries & Utilities:**
  - Headless UI (`@headlessui/react`)
  - Swiper (`swiper`) for carousels
  - React Icons (`react-icons`)
  - React Hot Toast (`react-hot-toast`) for notifications
  - React Spinners (`react-spinners`) for loading indicators
  - React Awesome Reveal (`react-awesome-reveal`) for animations
  - React YouTube (`react-youtube`) for embedding videos
- **Development:**
  - PostCSS (`postcss`, `autoprefixer`)
  - Sass (`sass`) (potentially used alongside Tailwind)
  - Vite SVGR Plugin (`vite-plugin-svgr`)

## ⚙️ Getting Started

### Prerequisites

- Node.js (v18 or later recommended)
- npm (usually comes with Node.js)
- Firebase Project: You need to set up a Firebase project and obtain the configuration credentials.

### Installation

1.  Clone the repository:
    ```bash
    git clone <your-repository-url>
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

    # Add other environment variables like API keys if needed
    # VITE_TMDB_API_KEY=your_tmdb_api_key
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
├── src/                  # Source files
│   ├── assets/           # Images, fonts, etc.
│   ├── components/       # Reusable UI components
│   ├── config/           # Configuration files (e.g., API endpoints)
│   ├── contexts/         # React context providers
│   ├── controllers/      # Application logic controllers (if any)
│   ├── firebase/         # Firebase configuration and utilities
│   ├── hooks/            # Custom React hooks
│   ├── Pages/            # Page-level components
│   ├── routes/           # Routing configuration
│   ├── services/         # API service integrations (e.g., movie API calls)
│   ├── utils/            # Utility functions
│   ├── App.jsx           # Main application component
│   ├── App.css           # Global App styles (minimal if using Tailwind)
│   ├── index.css         # Global styles / Tailwind base/components/utilities
│   ├── index.jsx         # Entry point for the React application
│   └── axios.js          # Axios instance configuration
├── .env                  # Local environment variables (DO NOT COMMIT)
├── .env.sample           # Example environment variables
├── .gitignore            # Git ignore configuration
├── index.html            # HTML entry point
├── package.json          # Project metadata and dependencies
├── package-lock.json     # Exact dependency versions
├── postcss.config.cjs    # PostCSS configuration
├── tailwind.config.cjs   # Tailwind CSS configuration
├── vite.config.js        # Vite configuration
└── README.md             # Project documentation (This file)
```

## 🤝 Contributing

_(Optional: Add guidelines if you accept contributions)_

Pull requests are welcome. For major changes, please open an issue first to discuss what you would like to change. Please make sure to update tests as appropriate.

## 📄 License

_(Optional: Specify your project's license, e.g., MIT)_

[MIT](https://choosealicense.com/licenses/mit/)
