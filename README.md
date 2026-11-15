# StudioSpace — Backend API

StudioSpace Backend is the REST API for the StudioSpace studio discovery and booking platform. It provides studio listing and booking functionality and protects private operations using authentication tokens issued by the frontend's Better Auth setup.

## Live API

- **Backend:** https://studiospace-server-gqag.onrender.com/
- **Frontend:** https://studiospace-site.vercel.app/

The backend root endpoint can be opened in a browser to check whether the API service is running.

## Features

- REST API for studio listings.
- Create, update, and delete studio listings.
- Retrieve studio information.
- Booking request management.
- Retrieve a user's bookings and studio owner's booking requests.
- Confirm or cancel booking requests.
- Authentication middleware for protected routes.
- Verify Better Auth JWTs using the JSON Web Key Set (JWKS) endpoint.
- Validate booking requests and prevent overlapping bookings.
- MongoDB database integration.
- CORS configuration for the frontend application.

## Technology Stack

- Node.js
- Express
- TypeScript
- MongoDB
- Mongoose
- Better Auth JWT
- Jose
- dotenv
- CORS

## Getting Started

### 1. Clone the repository

```bash
git clone <BACKEND_GITHUB_REPOSITORY_URL>
cd <BACKEND_PROJECT_FOLDER>
```

### 2. Install dependencies

```bash
npm install
```

### 3. Configure environment variables

Create a `.env` file in the backend project root:

```env
PORT=5000
CLIENT_URL=http://localhost:3000
MONGODB_URI=your_mongodb_connection_string
AUTH_BASE_URL=http://localhost:3000
AUTH_JWKS_URL=http://localhost:3000/api/auth/jwks
```

For local development, the frontend runs at `http://localhost:3000` and the backend runs at `http://localhost:5000`. In production, the corresponding Render environment variables point to the deployed frontend URL and its Better Auth JWKS endpoint.

### 4. Run the development server

```bash
npm run dev
```

### 5. Build the TypeScript project

```bash
npm run build
```

### 6. Start the production server

```bash
npm start
```

## API Route Groups

| Route group | Purpose |
|---|---|
| `/api/studios` | Studio listing operations |
| `/api/bookings` | Booking operations |

Some operations require a valid Bearer token issued through the StudioSpace authentication system.

## Authentication

The frontend uses Better Auth for user authentication. The backend validates access tokens using the configured JWKS endpoint:

```text
http://localhost:3000/api/auth/jwks
```

In production, `AUTH_JWKS_URL` must use the deployed frontend URL:

```text
https://studiospace-site.vercel.app/api/auth/jwks
```

## Frontend Repository

The frontend source code is maintained separately:

- **Frontend GitHub:** <https://github.com/Mahbubul-417/studiospace-client>

## Deployment

The backend is deployed on Render:

- https://studiospace-server-gqag.onrender.com/

The frontend is deployed on Vercel:

- https://studiospace-site.vercel.app/

---

Developed as the backend API for the StudioSpace full-stack application.
