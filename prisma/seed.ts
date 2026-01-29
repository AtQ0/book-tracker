import { PrismaClient } from "@prisma/client";
import { faker } from "@faker-js/faker";

const db = new PrismaClient();

async function main() {
  // required now, to avoid FK issues if userBook rows exist
  await db.userBook.deleteMany();
  await db.book.deleteMany();

  const manualBooks = [
    {
      name: "Applied Statistics",
      description: faker.lorem.words(80),
      genre: "Statistics",
      coverUrl: `https://picsum.photos/seed/${faker.word.noun()}/220/300`,
      averageRating: faker.number.float({ min: 2, max: 5, fractionDigits: 1 }),
      haveRead: faker.number.int({ min: 0, max: 40 }),
      currentlyReading: faker.number.int({ min: 0, max: 10 }),
      wantToRead: faker.number.int({ min: 0, max: 30 }),
    },
    {
      name: "The Pragmatic Programmer",
      description: faker.lorem.words(80),
      genre: "Programming",
      coverUrl: `https://picsum.photos/seed/${faker.word.noun()}/220/300`,
      averageRating: faker.number.float({ min: 2, max: 5, fractionDigits: 1 }),
      haveRead: faker.number.int({ min: 0, max: 40 }),
      currentlyReading: faker.number.int({ min: 0, max: 10 }),
      wantToRead: faker.number.int({ min: 0, max: 30 }),
    },
    {
      name: "The Origin of Wealth",
      description: faker.lorem.words(80),
      genre: "Economics",
      coverUrl: `https://picsum.photos/seed/${faker.word.noun()}/220/300`,
      averageRating: faker.number.float({ min: 2, max: 5, fractionDigits: 1 }),
      haveRead: faker.number.int({ min: 0, max: 40 }),
      currentlyReading: faker.number.int({ min: 0, max: 10 }),
      wantToRead: faker.number.int({ min: 0, max: 30 }),
    },
    {
      name: "Clean Architecture",
      description: faker.lorem.words(80),
      genre: "Programming",
      coverUrl: `https://picsum.photos/seed/${faker.word.noun()}/220/300`,
      averageRating: faker.number.float({ min: 2, max: 5, fractionDigits: 1 }),
      haveRead: faker.number.int({ min: 0, max: 40 }),
      currentlyReading: faker.number.int({ min: 0, max: 10 }),
      wantToRead: faker.number.int({ min: 0, max: 30 }),
    },
    {
      name: "Half a King",
      description: faker.lorem.words(80),
      genre: "Fantasy",
      coverUrl: `https://picsum.photos/seed/${faker.word.noun()}/220/300`,
      averageRating: faker.number.float({ min: 2, max: 5, fractionDigits: 1 }),
      haveRead: faker.number.int({ min: 0, max: 40 }),
      currentlyReading: faker.number.int({ min: 0, max: 10 }),
      wantToRead: faker.number.int({ min: 0, max: 30 }),
    },
    {
      name: "Introduction to Algorithms",
      description: faker.lorem.words(80),
      genre: "Programming",
      coverUrl: `https://picsum.photos/seed/${faker.word.noun()}/220/300`,
      averageRating: faker.number.float({ min: 2, max: 5, fractionDigits: 1 }),
      haveRead: faker.number.int({ min: 0, max: 40 }),
      currentlyReading: faker.number.int({ min: 0, max: 10 }),
      wantToRead: faker.number.int({ min: 0, max: 30 }),
    },
  ];

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
    coverUrl: `https://picsum.photos/seed/${faker.string.alphanumeric(8)}/220/300`,
    averageRating: faker.number.float({ min: 1, max: 5, fractionDigits: 1 }),
    haveRead: faker.number.int({ min: 0, max: 50 }),
    currentlyReading: faker.number.int({ min: 0, max: 10 }),
    wantToRead: faker.number.int({ min: 0, max: 30 }),
  }));

  const allBooks = [...manualBooks, ...randomBooks];

  await db.book.createMany({ data: allBooks });

  console.log(`✅ Seeded ${allBooks.length} books.`);
}

main()
  .catch((err) => {
    console.error(err);
    process.exit(1);
  })
  .finally(async () => {
    await db.$disconnect();
  });
