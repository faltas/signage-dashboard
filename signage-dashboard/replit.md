# Signage Dashboard Project

## Overview
A digital signage management system with multiple components:
- **DASHBOARD**: Next.js 16 dashboard for managing digital signage displays
- **frontend**: React app (CRA/CRACO) - alternative frontend
- **backend**: FastAPI Python backend with MongoDB
- **PLAYER**: Electron-based display player

## Current State
- Main dashboard running on port 5000
- Requires Supabase configuration for full functionality

## Project Architecture

### DASHBOARD (Primary Frontend)
- Next.js 16 with TypeScript
- Tailwind CSS v4 for styling
- Supabase for authentication and database
- Located in `/DASHBOARD`

### Backend
- FastAPI with uvicorn
- MongoDB with Motor async driver
- Located in `/backend`
- Requires `MONGO_URL` and `DB_NAME` environment variables

### Required Environment Variables
- `NEXT_PUBLIC_SUPABASE_URL`: Supabase project URL
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`: Supabase anonymous key
- `MONGO_URL`: MongoDB connection string (for backend)
- `DB_NAME`: MongoDB database name (for backend)

## Running the Project
The Dashboard workflow runs the Next.js app on port 5000.

## Recent Changes
- 2026-01-09: Initial Replit setup
- Configured Next.js to run on port 5000 with 0.0.0.0 host
- Installed Node.js 20 and Python 3.11
- Installed npm and pip dependencies
