import { BookDTOSchema } from "@/lib/validations/book";
import type { BookDTO } from "@/lib/validations/book";

const BASE_VALID_BOOK: Readonly<BookDTO> = Object.freeze({
  id: "1",
  name: "Dune",
  description: "whoop whoop",
  genre: "Sci-fi",
  coverUrl: "https://example.com/Dune.jpg",
  averageRating: 4.9,
  haveRead: 10,
  currentlyReading: 2,
  wantToRead: 5,
  userRating: null,
  userShelfStatus: null,
});

const requiredKeys = [
  "id",
  "name",
  "description",
  "genre",
  "coverUrl",
  "averageRating",
  "haveRead",
  "currentlyReading",
  "wantToRead",
  "userRating",
  "userShelfStatus",
] as const;

describe("BookDTOSchema", () => {
  describe("happy path", () => {
    it("accepts a fully valid Book", () => {
      expect(() => BookDTOSchema.parse(BASE_VALID_BOOK)).not.toThrow();
    });
  });

  describe("required fields", () => {
    it.each(requiredKeys)("rejects when '%s' is missing", (key) => {
      const rest: Record<string, unknown> = { ...BASE_VALID_BOOK }; // clone
      delete rest[key]; // remove required field
      expect(() => BookDTOSchema.parse(rest)).toThrow();
    });
  });

  describe("type & format validation", () => {
    it("rejects invalid coverUrl", () => {
      expect(() =>
        BookDTOSchema.parse({ ...BASE_VALID_BOOK, coverUrl: "not-a-url" }),
      ).toThrow();
    });

    it("rejects wrong types (e.g., averageRating as string)", () => {
      expect(() =>
        BookDTOSchema.parse({ ...BASE_VALID_BOOK, averageRating: "5" }),
      ).toThrow();
    });

    it("surfaces error path for wrong-typed fields (DX check)", () => {
      const input = { ...BASE_VALID_BOOK, haveRead: "10" };

      // use safeParse so no exception is thrown
      const result = BookDTOSchema.safeParse(input);

      // schema should reject wrong type and fail validation
      expect(result.success).toBe(false);

      if (!result.success) {
        const issue = result.error.issues[0]; // get the first validation issue
        expect(issue?.code).toBe("invalid_type"); // confirm it's a type error
        expect(issue?.path).toContain("haveRead"); // confirm the error path points to 'haveRead'
        expect(issue?.message).toMatch(/number/i); // confirm the message mentions expected type 'number
      }
    });
  });

  describe("boundary validation", () => {
    it.each([0, 5])(
      "accepts valid averageRating boundary value %d",
      (rating) => {
        expect(() =>
          BookDTOSchema.parse({ ...BASE_VALID_BOOK, averageRating: rating }),
        ).not.toThrow();
      },
    );

    it.each([-0.1, 5.01])("rejects out-of-range averageRating %d", (rating) => {
      expect(() =>
        BookDTOSchema.parse({ ...BASE_VALID_BOOK, averageRating: rating }),
      ).toThrow();
    });

    it("accepts in-range fractional averageRating", () => {
      expect(() =>
        BookDTOSchema.parse({ ...BASE_VALID_BOOK, averageRating: 4.5 }),
      ).not.toThrow();
    });

    it("rejects NaN averageRating", () => {
      expect(() =>
        BookDTOSchema.parse({ ...BASE_VALID_BOOK, averageRating: Number.NaN }),
      ).toThrow();
    });

    const counterKeys = ["haveRead", "currentlyReading", "wantToRead"] as const;

    it.each(counterKeys)("enforces integer ≥ 0 for '%s'", (key) => {
      expect(() =>
        BookDTOSchema.parse({ ...BASE_VALID_BOOK, [key]: 0 }),
      ).not.toThrow();

      expect(() =>
        BookDTOSchema.parse({ ...BASE_VALID_BOOK, [key]: 5 }),
      ).not.toThrow();

      expect(() =>
        BookDTOSchema.parse({ ...BASE_VALID_BOOK, [key]: -1 }),
      ).toThrow();

      expect(() =>
        BookDTOSchema.parse({ ...BASE_VALID_BOOK, [key]: 1.5 }),
      ).toThrow();
    });
  });

  describe("strictness", () => {
    it("rejects unknown keys when schema is strict()", () => {
      expect(() =>
        BookDTOSchema.parse({ ...BASE_VALID_BOOK, extra: 1 }),
      ).toThrow();
    });

    it("rejects empty or whitespace-only 'name'", () => {
      expect(() =>
        BookDTOSchema.parse({ ...BASE_VALID_BOOK, name: "" }),
      ).toThrow();

      expect(() =>
        BookDTOSchema.parse({ ...BASE_VALID_BOOK, name: "   " }),
      ).toThrow();
    });

    it("accepts name with leading/trailing spaces after trim", () => {
      expect(() =>
        BookDTOSchema.parse({ ...BASE_VALID_BOOK, name: "  Dune  " }),
      ).not.toThrow();
    });
  });
});
