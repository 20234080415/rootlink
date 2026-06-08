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

No business functionality is implemented in Task-001.

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

## Deferred from Task-001

- Authentication
- Prisma database schema
- Relationship graph business logic
- Member CRUD
- AI features
- Uploads
- Payments

## Suggested next task

Task-002 should add the initial Prisma schema and migration from `docs/database.md`, still without implementing UI workflows.
