/**
 * @jest-environment node
 */
import { GET } from "@/app/api/books/route";

// Mock the server helper
jest.mock("@/server/books", () => ({
  getBooksFromDb: jest.fn(async () => [
    {
      id: "1",
      name: "Dune",
      description: "Epic sci-fi",
      genre: "Sci-fi",
      coverUrl: "https://example.com/dune.jpg",
      averageRating: 4.9,
      haveRead: 10,
      currentlyReading: 1,
      wantToRead: 5,
    },
  ]),
}));

// Bind the mocked helper once (typed) for nicer access in tests
import * as BooksServer from "@/server/books";
const getBooksFromDb = BooksServer.getBooksFromDb as jest.Mock;

// Create a request helper
const callRoute = async (url: string) => {
  const res = await GET(new Request(url /* GET by default */));
  const body = await res.json();
  return { status: res.status, headers: res.headers, body };
};

afterEach(() => {
  jest.clearAllMocks();
  jest.restoreAllMocks();
});

describe("/api/books GET (route integration - mock server helper)", () => {
  it("200 => returns books (default order) + JSON header + calls helper with undefined", async () => {
    const { status, body, headers } = await callRoute("http://x/api/books");
    expect(status).toBe(200);
    expect(Array.isArray(body)).toBe(true);
    expect(body[0]).toMatchObject({ id: "1", name: "Dune" });

    // Fetch value of content-type key and ensure its JSON
    expect(headers.get("content-type") || "").toContain("application/json");

    // helper called with undefined (default sort)
    expect(getBooksFromDb).toHaveBeenCalledTimes(1);
    expect(getBooksFromDb).toHaveBeenCalledWith(undefined);
  });

  it("passes validated sort to server helper", async () => {
    await callRoute("http://x/api/books?sort=rating");
    expect(getBooksFromDb).toHaveBeenCalledTimes(1);
    expect(getBooksFromDb).toHaveBeenCalledWith("rating");
  });

  it("400 => invalid sort rejected by Zod and does not call helper", async () => {
    const { status, body } = await callRoute("http://x/api/books?sort=banana");
    expect(status).toBe(400);
    expect(body).toHaveProperty("error", "Invalid query");
    expect(body).toHaveProperty("details");
    expect(getBooksFromDb).not.toHaveBeenCalled();
  });
});
