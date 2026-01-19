import { PrismaClient } from "@prisma/client";
import { faker } from "@faker-js/faker";

// Set up temporary connection to DB
const db = new PrismaClient();

async function main() {
  await db.book.deleteMany();

  // === Semi-faker/manually generated books ==0
  const manualBooks = [
    {
      name: "Applied Statistics",
      description: faker.lorem.words(80),
      genre: "Statistics",
      coverUrl: `https://picsum.photos/seed/${faker.word.noun()}/900/1200`,
      averageRating: faker.number.float({
        min: 2,
        max: 5,
        fractionDigits: 1,
      }),
      haveRead: faker.number.int({ min: 0, max: 40 }),
      currentlyReading: faker.number.int({ min: 0, max: 10 }),
      wantToRead: faker.number.int({ min: 0, max: 30 }),
    },
    {
      name: "The Pragmatic Programmer",
      description: faker.lorem.words(80),
      genre: "Programming",
      coverUrl: `https://picsum.photos/seed/${faker.word.noun()}/900/1200`,
      averageRating: faker.number.float({
        min: 2,
        max: 5,
        fractionDigits: 1,
      }),
      haveRead: faker.number.int({ min: 0, max: 40 }),
      currentlyReading: faker.number.int({ min: 0, max: 10 }),
      wantToRead: faker.number.int({ min: 0, max: 30 }),
    },
    {
      name: "The Origin of Wealth",
      description: faker.lorem.words(80),
      genre: "Economics",
      coverUrl: `https://picsum.photos/seed/${faker.word.noun()}/900/1200`,
      averageRating: faker.number.float({
        min: 2,
        max: 5,
        fractionDigits: 1,
      }),
      haveRead: faker.number.int({ min: 0, max: 40 }),
      currentlyReading: faker.number.int({ min: 0, max: 10 }),
      wantToRead: faker.number.int({ min: 0, max: 30 }),
    },
    {
      name: "Clean Architecture",
      description: faker.lorem.words(80),
      genre: "Programming",
      coverUrl: `https://picsum.photos/seed/${faker.word.noun()}/900/1200`,
      averageRating: faker.number.float({
        min: 2,
        max: 5,
        fractionDigits: 1,
      }),
      haveRead: faker.number.int({ min: 0, max: 40 }),
      currentlyReading: faker.number.int({ min: 0, max: 10 }),
      wantToRead: faker.number.int({ min: 0, max: 30 }),
    },
    {
      name: "Half a King",
      description: faker.lorem.words(80),
      genre: "Fantasy",
      coverUrl: `https://picsum.photos/seed/${faker.word.noun()}/900/1200`,
      averageRating: faker.number.float({
        min: 2,
        max: 5,
        fractionDigits: 1,
      }),
      haveRead: faker.number.int({ min: 0, max: 40 }),
      currentlyReading: faker.number.int({ min: 0, max: 10 }),
      wantToRead: faker.number.int({ min: 0, max: 30 }),
    },
    {
      name: "Introduction to Algorithms",
      description: faker.lorem.words(80),
      genre: "Programming",
      coverUrl: `https://picsum.photos/seed/${faker.word.noun()}/900/1200`,
      averageRating: faker.number.float({
        min: 2,
        max: 5,
        fractionDigits: 1,
      }),
      haveRead: faker.number.int({ min: 0, max: 40 }),
      currentlyReading: faker.number.int({ min: 0, max: 10 }),
      wantToRead: faker.number.int({ min: 0, max: 30 }),
    },
  ];

  // === Fully faker generated books ===
  const randomBooks = Array.from({ length: 47 }).map(() => ({
    name: faker.lorem
      .words(2)
      .trim()
      .split(/\s+/)
      .map((w) => w[0].toUpperCase() + w.slice(1))
      .join(" "),
    description: faker.lorem.words(80),
    genre: faker.helpers.arrayElement([
      "Programming",
      "Economics",
      "Fantasy",
      "Statistics",
      "History",
      "Science",
    ]),
    coverUrl: `https://picsum.photos/seed/${faker.string.alphanumeric(
      8,
    )}/900/1200`,
    averageRating: faker.number.float({ min: 1, max: 5, fractionDigits: 1 }),
    haveRead: faker.number.int({ min: 0, max: 50 }),
    currentlyReading: faker.number.int({ min: 0, max: 10 }),
    wantToRead: faker.number.int({ min: 0, max: 30 }),
  }));

  // Merge two book arrays
  const allBooks = [...manualBooks, ...randomBooks];

  // === Insert all books into DB
  await db.book.createMany({ data: allBooks });

  console.log(`✅ Seeded ${allBooks.length} books (6 manual and 47 random).`);
}

// run main function
main()
  .catch((err) => {
    console.error(err);
    process.exit(1); // Its good practice to exit the Node process with code 1 to signal that the seed failed
  })
  .finally(async () => {
    await db.$disconnect();
  });
