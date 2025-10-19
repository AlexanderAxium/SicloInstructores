# T3 Template - Modern Application Platform

This is a [T3 Stack](https://create.t3.gg/) project bootstrapped with `create-t3-app` for a modern application platform.

## 🚀 Quick Start

### Prerequisites

- Node.js 18+ 
- pnpm (recommended) or npm
- Docker Desktop (for local development)

### 1. Install Dependencies

```bash
pnpm install
```

### 2. Setup Environment Variables

Copy the example environment file and configure it:

```bash
cp env.example .env
```

Edit `.env` with your configuration. For local development with Docker, the default database configuration should work out of the box.

### 3. Start Database with Docker

```bash
# Start all services (PostgreSQL, Redis, pgAdmin)
./scripts/docker-dev.sh start

# Setup database (run migrations and seed)
./scripts/docker-dev.sh db:setup
```

### 4. Start Development Server

```bash
pnpm dev
```

The application will be available at [http://localhost:3000](http://localhost:3000)

## 🐳 Docker Development

This project includes Docker configuration for local development. The following services are available:

- **PostgreSQL**: `localhost:5432` (Database: `t3template_dev`, User: `postgres`, Password: `postgres`)
- **Redis**: `localhost:6379` (Optional, for caching)
- **pgAdmin**: `http://localhost:5050` (Admin: `admin@example.com` / `admin`)

### Docker Commands

```bash
# Start services
./scripts/docker-dev.sh start

# Stop services  
./scripts/docker-dev.sh stop

# Restart services
./scripts/docker-dev.sh restart

# View service status
./scripts/docker-dev.sh status

# View logs
./scripts/docker-dev.sh logs

# Reset database (⚠️ deletes all data)
./scripts/docker-dev.sh db:reset

# Clean up Docker resources
./scripts/docker-dev.sh clean
```

## 🛠️ Available Scripts

- `pnpm dev` - Start development server
- `pnpm build` - Build for production
- `pnpm start` - Start production server
- `pnpm db:push` - Push schema changes to database
- `pnpm db:migrate` - Run database migrations
- `pnpm db:reset` - Reset database
- `pnpm db:seed` - Seed database with initial data
- `pnpm db:studio` - Open Prisma Studio

## 🏗️ Tech Stack

- [Next.js](https://nextjs.org) - React framework
- [Better Auth](https://better-auth.com) - Authentication
- [Prisma](https://prisma.io) - Database ORM
- [tRPC](https://trpc.io) - Type-safe APIs
- [Tailwind CSS](https://tailwindcss.com) - Styling
- [TypeScript](https://typescriptlang.org) - Type safety

## Learn More

To learn more about the [T3 Stack](https://create.t3.gg/), take a look at the following resources:

- [Documentation](https://create.t3.gg/)
- [Learn the T3 Stack](https://create.t3.gg/en/faq#what-learning-resources-are-currently-available) — Check out these awesome tutorials

You can check out the [create-t3-app GitHub repository](https://github.com/t3-oss/create-t3-app) — your feedback and contributions are welcome!

## How do I deploy this?

Follow our deployment guides for [Vercel](https://create.t3.gg/en/deployment/vercel), [Netlify](https://create.t3.gg/en/deployment/netlify) and [Docker](https://create.t3.gg/en/deployment/docker) for more information.
