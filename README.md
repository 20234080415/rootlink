# RootLink

RootLink is a V1 family digital memory platform. The product direction is documented in `docs/`.

## Task-001 status

This repository currently contains the project foundation only:

- Next.js App Router
- TypeScript
- Tailwind CSS
- ESLint
- Prettier
- Prisma package installation
- PostgreSQL environment placeholder
- React Flow package installation
- Base source directory structure

Task-002 adds the first Prisma data model and initial migration for the six V1 domain entities:

- `User`
- `Family`
- `Member`
- `Relationship`
- `Biography`
- `TimelineEvent`

No business workflows are implemented in Task-001 or Task-002.

## Local setup

Install dependencies:

```bash
npm install
```

Create local environment variables:

```bash
cp .env.example .env
```

Start the development server:

```bash
npm run dev
```

Open `http://localhost:3000`.

## Available scripts

- `npm run dev` starts the local Next.js development server.
- `npm run build` creates a production build.
- `npm run start` starts the production server after a build.
- `npm run lint` runs ESLint.
- `npm run format` formats files with Prettier.
- `npm run format:check` checks formatting.
- `npm run prisma` runs the Prisma CLI.

## Database setup

Task-002 includes `prisma/schema.prisma`, `prisma.config.ts`, and an initial PostgreSQL migration.

Validate the Prisma schema:

```bash
npm run prisma -- validate
```

Apply the initial migration after `DATABASE_URL` points at a local PostgreSQL database:

```bash
npm run prisma -- migrate dev
```

## Deferred from current tasks

- Authentication
- Seed data
- Relationship graph business logic
- Member CRUD
- AI features
- Uploads
- Payments

## Suggested next task

Task-003 should add seed data from `docs/database.md`, still without implementing UI workflows.
