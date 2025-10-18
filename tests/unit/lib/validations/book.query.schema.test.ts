import { BookListQuerySchema, SORT_KEYS } from "@/lib/validations/book";

const VALID_KEYS = SORT_KEYS;

describe("BookListQuerySchema", () => {
  describe("happy path", () => {
    it("accepts missing sort (optional)", () => {
      // Verifies that the schema does not throw when the input is {}
      expect(() => BookListQuerySchema.parse({})).not.toThrow();
    });

    it.each(VALID_KEYS)("accepts known sort keys '%s'", (key) => {
      expect(() => BookListQuerySchema.parse({ sort: key })).not.toThrow();
    });

    it("accepts explicit undefined for sort (optional)", () => {
      // Confirms that { sort: undefined } is treated the same as {}
      expect(() =>
        BookListQuerySchema.parse({ sort: undefined })
      ).not.toThrow();
    });
  });

  describe("required fields", () => {
    it("has no required fields (empty object is valid)", () => {
      // Confirms schema doesn’t auto-add or require fields, {} = {}
      expect(BookListQuerySchema.parse({})).toEqual({});
    });
  });

  describe("type & format validation", () => {
    it.each(["nope", "RATING", "", " name_desc "])(
      "rejects invalid sort string '%s'",
      (bad) => {
        expect(() => BookListQuerySchema.parse({ sort: bad })).toThrow();
      }
    );

    it.each([123, true, null, {}, [], Symbol("x")] as unknown[])(
      "rejects non-string sort: %p",
      (val) => {
        expect(() => BookListQuerySchema.parse({ sort: val })).toThrow();
      }
    );

    it("rejects arrays for sort (e.g., repeated query params)", () => {
      // Example: /api/books?sort=rating&sort=name_asc
      expect(() =>
        BookListQuerySchema.parse({ sort: ["rating", "name_asc"] })
      ).toThrow();
    });
  });

  describe("boundary validations", () => {
    it("accepts exactly the enum members (no more, no less)", () => {
      expect([...VALID_KEYS].sort()).toEqual(
        ["read", "want", "rating", "name_asc", "name_desc"].sort()
      );
    });

    it.each(["nameasc", "name-asc", "READ", " wants ", "ratings"])(
      "rejects near-miss variant '%s'",
      (bad) => {
        expect(() => BookListQuerySchema.parse({ sort: bad })).toThrow();
      }
    );
  });

  describe("strictness", () => {
    it("allows and strips unknown keys by default", () => {
      const parsed = BookListQuerySchema.parse({ sort: "rating", extra: true });
      expect(parsed).toEqual({ sort: "rating" });
    });
  });
});
