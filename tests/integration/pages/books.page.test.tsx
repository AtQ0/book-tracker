/**
 * @jest-environment jsdom
 */

import { render, screen } from "@testing-library/react";
import BooksPage from "@/app/books/page";
import type { BookDTO } from "@/lib/validations/book";

// we want the sort keys to stay aligned with our real code.
import type { SortKey } from "@/lib/validations/book";

// Mock the server helper to avoid touching the DB layer
jest.mock("@/server/books", () => ({
  getBooksFromDb: jest.fn(async () => [
    {
      id: "42",
      name: "Neuromancer",
      description: "Cyberpunk classic",
      genre: "Sci-fi",
      coverUrl: "https://example.com/neu.jpg",
      averageRating: 4.7,
      haveRead: 7,
      currentlyReading: 0,
      wantToRead: 3,
    },
  ]),
}));

// Mocked version of BookListClient
jest.mock("@/app/books/BookListClient", () => ({
  __esModule: true,
  default: (props: {
    initialBooks: BookDTO[];
    initialSort: string | undefined;
  }) => (
    <div>
      <div>BookListClient Mock</div>
      <div data-testid="sort">{String(props.initialSort)}</div>
      <div data-testid="books-count">{props.initialBooks.length}</div>
      <div>{props.initialBooks[0]?.name}</div>
    </div>
  ),
}));

// Grab a typed reference to the mocked helper so we can assert on calls
import * as BooksServer from "@/server/books";
const getBooksFromDb = BooksServer.getBooksFromDb as jest.Mock;

// Helper to render the async server component BooksPage()
async function renderPage(sort?: SortKey | "banana") {
  const searchParams = Promise.resolve(
    sort ? ({ sort } as Record<string, string>) : {}
  );

  // BookPage is async (server component), so await it to get its JSX tree
  const ui = await BooksPage({ searchParams });

  // Render returned React tree into jsdom
  return render(ui);
}

afterEach(() => {
  jest.clearAllMocks();
  jest.restoreAllMocks();
});

describe("BooksPage (server component integration)", () => {
  it("renders initial books from server helper and passes undefined sort by default", async () => {
    // Send undefine sort to renderPage to render BooksPage
    await renderPage(undefined);

    expect(screen.getByText("BookListClient Mock")).toBeInTheDocument();

    // The mock exposes derived props from BooksPage
    expect(screen.getByTestId("books-count").textContent).toBe("1");
    expect(screen.getByText("Neuromancer")).toBeInTheDocument();

    // initialSort should be undefined when no sort provided
    expect(screen.getByTestId("sort").textContent).toBe("undefined");

    // And the server help should have been called with undefined
    expect(getBooksFromDb).toHaveBeenCalledTimes(1);
    expect(getBooksFromDb).toHaveBeenCalledWith(undefined);
  });

  it("validates sort and passes it to the server helper and into initialSort when sort is valid", async () => {
    await renderPage("rating");

    // The page should forward the valid sort ("rating") to getBooksFromDb
    expect(getBooksFromDb).toHaveBeenCalledTimes(1);
    expect(getBooksFromDb).toHaveBeenCalledWith("rating");

    // The mock should recieve the same validation sort as initialSort
    expect(screen.getByTestId("sort").textContent).toBe("rating");

    // initialBooks should still be passed along
    expect(screen.getByTestId("books-count").textContent).toBe("1");
    expect(screen.getByText("Neuromancer")).toBeInTheDocument();
  });

  it("ignores invalid sort and falls back to undefined (instead of forwaring a bad value)", async () => {
    await renderPage("banana");

    // Because bannan not valid, Bookpage should pass it through as undefined
    expect(getBooksFromDb).toHaveBeenCalledTimes(1);
    expect(getBooksFromDb).toHaveBeenCalledWith(undefined);

    // initialSort should also be undefined
    expect(screen.getByTestId("sort").textContent).toBe("undefined");
  });
});
