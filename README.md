Book tracker is a fullstack TypeScript project built with the Next.js framework, using React for the frontend and Node.js for the backend. The application uses Docker Compose to run a virtual PostgreSQL instance for development, together with a Maildev container that captures all outgoing emails in a local inbox for easy testing. It relies on Prisma for database access, PostgreSQL for data storage, Tailwind for styling, and Zod for runtime validation. The project also includes Jest and Testing Library for both unit testing and component testing, as well as Nodemailer for email verification in the authentication flow. Argon2 is used for secure password hashing and Faker is used for generating development data.

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

Then open .env and .env.local and set values for:<br>
*POSTGRES_USER<br>
*POSTGRES_PASSWORD<br>
*POSTGRES_DB<br>
*DATABASE_URL

Example:

```bash
POSTGRES_USER=booktracker
POSTGRES_PASSWORD=secret
POSTGRES_DB=booktracker_dev
DATABASE_URL="postgresql://booktracker:secret@localhost:5433/booktracker_dev?schema=public"
```

Third, make sure Docker Desktop is running, then start the Docker services that create the PostgreSQL and Maildev containers by typing the command below in the terminal:

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
in your browser to view the Maildev client and inspect captured emails.

## Section X

Lorem ipsum dolor sit amet, consectetur adipiscing elit. Integer in ante ac velit rhoncus posuere. Quisque sit amet quam non enim pulvinar placerat. Vestibulum in felis id mi varius luctus. Cras nec arcu non ipsum convallis consequat. Phasellus convallis purus eu metus commodo tristique. Sed id orci et tellus blandit volutpat. Aliquam a neque id purus mattis interdum. Mauris sodales justo ut urna dictum, vitae interdum lorem pellentesque. Donec accumsan orci vel pulvinar ultricies. Suspendisse vitae felis non nunc convallis malesuada at eget nisl.

## Section X

Lorem ipsum dolor sit amet, consectetur adipiscing elit. Integer in ante ac velit rhoncus posuere. Quisque sit amet quam non enim pulvinar placerat. Vestibulum in felis id mi varius luctus. Cras nec arcu non ipsum convallis consequat. Phasellus convallis purus eu metus commodo tristique. Sed id orci et tellus blandit volutpat. Aliquam a neque id purus mattis interdum. Mauris sodales justo ut urna dictum, vitae interdum lorem pellentesque. Donec accumsan orci vel pulvinar ultricies. Suspendisse vitae felis non nunc convallis malesuada at eget nisl.
