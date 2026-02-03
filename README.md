# Book-tracker

![Typescript](https://img.shields.io/badge/TypeScript-3178C6?style=flat&logo=typescript&logoColor=fff)
![Next.js](https://img.shields.io/badge/Next.js-000000?style=flat&logo=nextdotjs&logoColor=fff)
![React](https://img.shields.io/badge/React-61DAFB?style=flat&logo=react&logoColor=000)
![Node.js](https://img.shields.io/badge/Node.js-339933?style=flat&logo=nodedotjs&logoColor=fff)
![Prisma](https://img.shields.io/badge/Prisma-2D3748?style=flat&logo=prisma&logoColor=fff)
![PostgreSQL](https://img.shields.io/badge/PostgreSQL-4169E1?style=flat&logo=postgresql&logoColor=fff)
![Docker](https://img.shields.io/badge/Docker-2496ED?style=flat&logo=docker&logoColor=fff)

Book Tracker is a fullstack TypeScript project built on Next.js, using React on the frontend and server-side API routes running on Node.js. It uses Docker Compose to run a local PostgreSQL database along with a MailDev container that captures all outgoing emails during development. In production, emails are delivered through the Resend HTTP API. Prisma handles database access, PostgreSQL stores the application data, Tailwind provides styling, and Zod ensures runtime validation. The project includes Jest and Testing Library for unit and component tests, Argon2 for secure password hashing, and Faker for generating development seed data.

## Links

- **Live:** https://book-tracker-6emz.onrender.com/
- **GitHub:** https://github.com/AtQ0/book-tracker
- **Figma:** https://www.figma.com/design/RwQQN7Vz8cjhkKqltFxikb/book-tracker?node-id=0-1

## Purpose

Book Tracker is a personal reading management app where users can track books they have read, are currently reading, or want to read.
The purpose of the project is twofold:

1. To provide a functional and user friendly book tracking tool
2. To demonstrate a complete fullstack architecture, including authentication with email verification, a relational PostgreSQL schema, Docker-based development setup, and clean modular React components

This project serves as both a real application and a portfolio example of modern web development practices.

## Features

- User signup with email verification
- Secure authentication (NextAuth + Argon2)
- Track books by:
  - Have read
  - Currently reading
  - Want to read
- Responsive UI built with TailwindCSS
- Relational database modeling with Prisma + PostgreSQL
- Local development environment containerized with Docker
- MailDev inbox for development
- Email verification using Resend (HTTP API) in production
- Fully typed end to end (TypeScript everywhere)
- Automated tests using Jest and Testing Library
- Clean modular component structure

## Tech Stack

**Frontend:** React, Next.js, TypeScript, TailwindCSS
**Backend:** Node.js, Next.js API routes
**Database:** PostgreSQL + Prisma ORM
**Auth:** NextAuth (email verification flow)
**Email:** MailDev (Nodemailer SMTP) in development, Resend HTTP API in production
**Validation:** Zod
**Hashing:** Argon2
**Dev Tools:** Docker Compose, Jest, Testing Library, Faker

## Folder Structure

Here is a short preview of the main structure. Expand the section below to view the full tree.

```bash
book-tracker/
├── prisma/
├── public/
├── src/
├── components/
├── lib/
├── server/
├── tests/
├── types/
├── .env.example
├── docker-compose.yml
├── package.json
└── tsconfig.json
```

<details> <summary><strong>Click to view full project structure</strong></summary>

```bash
book-tracker/
├── .next/
├── .swc/
├── .vscode/
├── docs/
├── node_modules/
├── prisma/
│   ├── schema.prisma
│   ├── migrations/
│   └── seed.ts
│
├── public/
│   └── images/
│
├── src/
│   ├── app/
│   │   ├── globals.css
│   │   ├── layout.tsx
│   │   ├── page.tsx
│   │   │
│   │   ├── (auth)/
│   │   │   ├── layout.tsx
│   │   │   │
│   │   │   ├── signin/
│   │   │   │   ├── SigninCard.tsx
│   │   │   │   └── page.tsx
│   │   │   │
│   │   │   ├── set-password/
│   │   │   │   ├── SetPasswordCard.tsx
│   │   │   │   └── page.tsx
│   │   │   │
│   │   │   ├── signup/
│   │   │   │   ├── SignupCard.tsx
│   │   │   │   └── page.tsx
│   │   │   │
│   │   │   └── verify/
│   │   │       ├── VerifyCard.tsx
│   │   │       └── page.tsx
│   │   │
│   │   ├── api/
│   │   │   ├── auth/
│   │   │   │   ├── signin/
│   │   │   │   ├── resend/
│   │   │   │   ├── set-password/
│   │   │   │   ├── signup/
│   │   │   │   │   └── route.ts
│   │   │   │   └── verify/
│   │   │   │       └── route.ts
│   │   │   │
│   │   │   └── books/
│   │   │       └── route.ts
│   │   │
│   │   ├── books/
│   │   │   ├── BookListClient.tsx
│   │   │   └── page.tsx
│   │   │
│   │   └── books/[id]/
│   │       └── page.tsx
│   │
│   └── my/
│       └── shelf/
│
├── components/
│   ├── BackButton.tsx
│   │
│   ├── auth/
│   │   ├── AuthCard.tsx
│   │   ├── AuthForm.tsx
│   │   └── SessionProviderClient.tsx
│   │
│   ├── books/
│   │   ├── BookCard.tsx
│   │   ├── BookGrid.tsx
│   │   └── BookSortBar.tsx
│   │
│   ├── form/
│   │   └── Field.tsx
│   │
│   ├── layout/
│   │   ├── Container.tsx
│   │   └── Section.tsx
│   │
│   └── ui/
│       ├── Button.tsx
│       ├── Card.tsx
│       ├── Input.tsx
│       └── Label.tsx
│
├── hooks/
│
├── lib/
│   ├── auth-helpers.ts
│   ├── db.ts
│   │
│   ├── api/
│   │   └── auth.ts
│   │
│   └── validations/
│       ├── auth.ts
│       └── book.ts
│
├── server/
│   ├── auth.ts
│   ├── books.ts
│   ├── http.ts
│   │
│   ├── auth/
│   │   ├── config.ts
│   │   ├── reset-password.ts
│   │   ├── signup.ts
│   │   └── verifySignup.ts
│   │
│   └── mail/
│       ├── sendSignupEmail.ts
│       └── transporter.ts
│
├── types/
│
├── tests/
│   ├── e2e/
│   │
│   ├── integration/
│   │   ├── api/
│   │   │   ├── auth.verify.route.test.ts
│   │   │   └── books.route.test.ts
│   │   │
│   │   ├── pages/
│   │   │   └── books.page.test.tsx
│   │   │
│   │   └── server/
│   │       ├── getBooksFromDb.test.ts
│   │       └── verifySignup.test.ts
│   │
│   ├── setup/
│   │   └── jest.setup.ts
│   │
│   └── unit/
│       ├── components/
│       │   ├── auth/
│       │   │   ├── AuthCard.test.tsx
│       │   │   └── AuthForm.test.tsx
│       │   │
│       │   ├── books/
│       │   │   ├── BookCard.test.tsx
│       │   │   └── BookGrid.test.tsx
│       │   │
│       │   ├── form/
│       │   │   └── Field.test.tsx
│       │   │
│       │   ├── layout/
│       │   │   ├── Container.test.tsx
│       │   │   └── Section.test.tsx
│       │   │
│       │   └── ui/
│       │       ├── Button.test.tsx
│       │       ├── Card.test.tsx
│       │       ├── Input.test.tsx
│       │       └── Label.test.tsx
│       │
│       ├── hooks/
│       │
│       └── lib/
│           └── validations/
│               ├── book.dto.schema.test.ts
│               ├── book.query.schema.test.ts
│               └── sortFieldMap.test.ts
│
├── .env
├── .env.example
├── .env.local
├── .env.production
├── .gitignore
├── docker-compose.yml
├── eslint.config.mjs
├── jest.config.ts
├── next-env.d.ts
├── next.config.ts
├── package-lock.json
├── package.json
├── postcss.config.mjs
├── README.md
├── tsconfig.json
└── tsconfig.tsbuildinfo
```

</details>

## Design and Architecture

Figma wireframes and the implemented relational database schema
https://www.figma.com/design/RwQQN7Vz8cjhkKqltFxikb/book-tracker?node-id=0-1

## Getting Started

First, clone repo either by typing the below in the terminal:

```bash
git clone https://github.com/AtQ0/book-tracker.git
cd book-tracker
```

or simply by downloading it from:<br>
https://github.com/AtQ0/book-tracker

Second, set up environment files by creating copies from .env.example by typing the below in the terminal:

```bash
cp .env.example .env
cp .env.example .env.local
```

Then open .env and .env.local and set values for:

- POSTGRES_USER:
- POSTGRES_PASSWORD:
- POSTGRES_DB:
- DATABASE_URL:
- NEXTAUTH_SECRET:

All other variables in `.env.example` already contain safe defaults for local development and do not need to be changed. For production, set EMAIL_PROVIDER=resend and configure your RESEND_API_KEY and MAIL_FROM values in .env.production.

If you deploy to Render:<br>
After creating .env.production, copy all its values into the Render Dashboard under Environment => Environment Variables so your production service uses the correct settings.

Example:

```bash
# Database settings
POSTGRES_USER=booktracker
POSTGRES_PASSWORD=secret
POSTGRES_DB=booktracker_dev
DATABASE_URL="postgresql://booktracker:secret@localhost:5433/booktracker_dev?schema=public"

# NextAuth settings
NEXTAUTH_SECRET="b2a3d4e6f8910c12d34e56f78901ab23456cd7890ef12345abcd67890ef12345"
```

To generate your own secure NEXTAUTH_SECRET, run one of the two commands below in your terminal:

```bash
openssl rand -hex 32
```

or

```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

Third, make sure Docker Desktop is running, then start the Docker services that create the PostgreSQL and MailDev containers by typing the command below in the terminal:

```bash
docker compose up -d
```

Fourth, run the Prisma migration so that it applies the database schema to the running PostgreSQL instance by typing the command below in the terminal:

```bash
npx prisma migrate dev
```

Fifth, seed the database so it is populated with initial data by typing the command below in the terminal:

```bash
npx prisma db seed
```

Sixth and lastly, run the development server by typing the command below in the terminal:

```bash
npm run dev
```

Open http://localhost:3000
in your browser to see the development server.<br>
Open http://localhost:1080
in your browser to view the MailDev client and inspect captured emails.

## Section X

Lorem ipsum dolor sit amet, consectetur adipiscing elit. Integer in ante ac velit rhoncus posuere. Quisque sit amet quam non enim pulvinar placerat. Vestibulum in felis id mi varius luctus. Cras nec arcu non ipsum convallis consequat. Phasellus convallis purus eu metus commodo tristique. Sed id orci et tellus blandit volutpat. Aliquam a neque id purus mattis interdum. Mauris sodales justo ut urna dictum, vitae interdum lorem pellentesque. Donec accumsan orci vel pulvinar ultricies. Suspendisse vitae felis non nunc convallis malesuada at eget nisl.

## Section X

Lorem ipsum dolor sit amet, consectetur adipiscing elit. Integer in ante ac velit rhoncus posuere. Quisque sit amet quam non enim pulvinar placerat. Vestibulum in felis id mi varius luctus. Cras nec arcu non ipsum convallis consequat. Phasellus convallis purus eu metus commodo tristique. Sed id orci et tellus blandit volutpat. Aliquam a neque id purus mattis interdum. Mauris sodales justo ut urna dictum, vitae interdum lorem pellentesque. Donec accumsan orci vel pulvinar ultricies. Suspendisse vitae felis non nunc convallis malesuada at eget nisl.
