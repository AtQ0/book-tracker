import React from "react";
import { render, screen, within } from "@testing-library/react";
import "@testing-library/jest-dom";
import BookGrid from "@/components/books/BookGrid";
import type { BookDTO } from "@/lib/validations/book";

// ----- Mocks -----

// Make Next/Image behave like a normal <img> in test
jest.mock("next/image", () => {
  const MockedImage = (props: React.ComponentProps<"img">) => {
    // eslint-disable-next-line @next/next/no-img-element
    return <img alt={props.alt} src={props.src} {...props} />;
  };
  MockedImage.displayName = "NextImageMock";
  return MockedImage;
});

// Mock BookCard so we focus on the grid behavior, not card internals
jest.mock("@/components/books/BookCard", () => {
  return function MockBookCard({ book }: { book: BookDTO }) {
    return <div data-testid="book-card">{book.name}</div>;
  };
});

// ----- Fixture -----
const makeBooks = (n: number): BookDTO[] =>
  Array.from({ length: n }).map((_, i) => ({
    id: `b-${i + 1}`,
    name: `Book ${i + 1}`,
    description: `Desc ${i + 1}`,
    genre: `Sci-fi`,
    coverUrl: `https://example.com/${i + 1}.jpg`,
    averageRating: 4.2,
    haveRead: 0,
    currentlyReading: 0,
    wantToRead: 0,
  }));

describe("<BookGrid />", () => {
  describe("happy path", () => {
    it("renders a <ul> list container", () => {
      render(<BookGrid initialBooks={makeBooks(1)} />);
      expect(screen.getByRole("list")).toBeInTheDocument();
    });

    it("renders the correct number of items/cards", () => {
      render(<BookGrid initialBooks={makeBooks(3)} />);

      const list = screen.getByRole("list");
      const items = within(list).getAllByRole("listitem");
      expect(items).toHaveLength(3);

      expect(screen.getAllByTestId("book-card")).toHaveLength(3);
    });

    it("passes each book to BookCard (smoke via names)", () => {
      const books = makeBooks(2);
      render(<BookGrid initialBooks={books} />);
      expect(screen.getByText("Book 1")).toBeInTheDocument();
      expect(screen.getByText("Book 2")).toBeInTheDocument();
    });
  });

  describe("required fields", () => {
    // If the prop becomes optional, this test will fail at type-check time.
    it("requires 'initialBooks' prop at compile-time (TS)", () => {
      // @ts-expect-error missing required prop should be a TypeScript error
      const el = <BookGrid />;

      expect(el).toBeTruthy();
    });
  });

  describe("type & format validation", () => {
    it("handles long names/strings without crashing", () => {
      const long = "L".repeat(500);
      const books: BookDTO[] = [
        { ...makeBooks(1)[0], name: long, description: long },
      ];

      render(<BookGrid initialBooks={books} />);

      expect(screen.getByText(long)).toBeInTheDocument();
    });
  });

  describe("boundary validation", () => {
    it("renders an empty list gracefully", () => {
      render(<BookGrid initialBooks={[]} />);
      expect(screen.getByRole("list")).toBeInTheDocument();
      expect(screen.queryAllByRole("listitem")).toHaveLength(0);
    });

    it("handles many items (e.g., 100) without truncation", () => {
      render(<BookGrid initialBooks={makeBooks(100)} />);
      expect(screen.getAllByRole("listitem")).toHaveLength(100);
    });
  });

  describe("strictness", () => {
    it("wraps every card within a list item (li-element)", () => {
      render(<BookGrid initialBooks={makeBooks(4)} />);
      const liElements = screen.getAllByRole("listitem");
      const cards = screen.getAllByTestId("book-card");
      expect(liElements).toHaveLength(cards.length);
    });
  });

  describe("interaction", () => {
    it.skip("has no interactive controls (skip until needed)", () => {
      // Bookgrid is a pure presenter component, no interactions to test
    });
  });

  describe("accessibility", () => {
    it("uses list semantics (role=list/listitem)", () => {
      render(<BookGrid initialBooks={makeBooks(2)} />);
      expect(screen.getByRole("list")).toBeInTheDocument(); // <ul>
      expect(screen.getAllByRole("listitem")).toHaveLength(2); // <li>
    });
  });
});
