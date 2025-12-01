# Deploying EcoBite to Vercel

EcoBite is configured to be deployed on Vercel. The frontend uses Vite, and the backend uses Express as Serverless Functions.

## Prerequisites

1.  **Vercel Account**: Sign up at [vercel.com](https://vercel.com).
2.  **Vercel CLI** (Optional but recommended): `npm i -g vercel`

## Deployment Steps

### Option 1: Using Vercel CLI (Recommended)

1.  Open a terminal in the project directory.
2.  Run `vercel login` and follow the instructions.
3.  Run `vercel deploy`.
    *   Set up and deploy: `Y`
    *   Which scope: (Select your team/user)
    *   Link to existing project: `N`
    *   Project name: `ecobite` (or your choice)
    *   In which directory is your code located: `./`
    *   Auto-detected Project Settings (Vite): `Y` (or modify if needed, but defaults should work)
4.  Wait for deployment to complete. You will get a Production URL.

### Option 2: Using Git Integration

1.  Push your code to a GitHub/GitLab/Bitbucket repository.
2.  Go to Vercel Dashboard and click "Add New Project".
3.  Import your repository.
4.  Vercel should auto-detect Vite.
5.  Click "Deploy".

## Important Note on Database

This project uses **SQLite**. Vercel Serverless Functions have a **read-only file system**, except for the `/tmp` directory.
We have configured the app to use `/tmp/ecobite.db` when running on Vercel.

**Limitations:**
*   **Data Persistence**: The `/tmp` directory is **ephemeral**. Data will be lost when the serverless function instance is recycled (usually after a period of inactivity or deployment).
*   **Sharing**: This deployment is suitable for a **demo** to show the UI and basic flow. It is **NOT** suitable for production or long-term data storage.

For a persistent deployment, consider using an external database like **Turso**, **Neon**, or **MongoDB Atlas**, or deploy the backend to a VPS/PaaS like **Render** or **Railway** that supports persistent disk.
