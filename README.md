# Debts App

Debts App is a full-stack monorepo for managing personal or shared debts between users. It allows users to register, create debts, record payments, upload payment receipts, and keep track of debt status in one place.

## Overview

The project is organized as a PNPM workspace with three main packages:

- Client: React + TypeScript + Vite frontend
- Server: Express + TypeScript API
- Shared: common validation schemas and shared logic

## Features

- User registration and login
- Secure authentication with JWT cookies
- Create and manage debts
- Track payments for each debt
- Upload and attach payment receipts
- View debt status such as active, paid, or cancelled
- Search and link debts to users

## Tech Stack

### Frontend
- React 18
- TypeScript
- Vite
- React Router
- Tailwind CSS
- React Hook Form + Zod
- TanStack Query

### Backend
- Node.js + Express
- TypeScript
- Prisma ORM
- PostgreSQL
- JWT authentication
- Cloudinary for receipt uploads
- Helmet, CORS, Cookie Parser, Morgan

## Project Structure

```text
packages/
  client/     # React frontend
  server/     # Express backend
  shared/     # Shared schemas and types
```

## Prerequisites

Before running the project, make sure you have installed:

- Node.js 18 or newer
- pnpm
- PostgreSQL

## Installation

1. Clone the repository:

```bash
git clone <repository-url>
cd debts-app
```

2. Install dependencies:

```bash
pnpm install
```

## Environment Variables

Create a `.env` file inside the server package:

```env
DATABASE_URL=postgresql://USER:PASSWORD@HOST:5432/DB_NAME
JWT_SECRET=your-secret-key
CLIENT_URL=http://localhost:5173
NODE_ENV=development
```

Optional environment variables for receipt uploads:

```env
CLOUDINARY_CLOUD_NAME=your-cloud-name
CLOUDINARY_API_KEY=your-api-key
CLOUDINARY_API_SECRET=your-api-secret
```

## Database Setup

From the repository root, run:

```bash
pnpm --filter server db:generate
pnpm --filter server db:push
pnpm --filter server db:seed
```

This will generate Prisma client, sync the database schema, and seed initial data.

## Running the Application

Start both the frontend and backend in development mode:

```bash
pnpm dev
```

This runs the client and server in parallel.

### Default URLs

- Frontend: http://localhost:5173
- Backend API: http://localhost:3000
- Health check: http://localhost:3000/api/health

## Building for Production

To build the full monorepo:

```bash
pnpm build
```

## Available Server Scripts

Inside the server package, you can use:

```bash
pnpm --filter server dev
pnpm --filter server build
pnpm --filter server start
pnpm --filter server db:studio
```

## Notes

- The backend uses cookies for authentication, so the client and server must be served with compatible origins.
- Receipt upload support depends on valid Cloudinary credentials.
- The application is designed as a development-friendly monorepo and can be extended with additional features such as notifications, dashboards, or recurring debts.
