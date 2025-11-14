import { sortFieldMap, SORT_KEYS, BookDTOSchema } from "@/lib/validations/book";

const DIRECTIONS = ["asc", "desc"] as const;

// derive allowed DTO fields at runtime from the Zod object shape
const DTO_FIELDS = Object.keys(BookDTOSchema.shape);

// include special non-DTO field
const ALLOWED_FIELDS = new Set([...DTO_FIELDS, "createdAt"]);

describe("sortFieldMap", () => {
  describe("happy path", () => {
    // Validate that For every allowed sort key, that sortFieldMap actually contains a value for that key.
    it.each(SORT_KEYS)("has a mapping entry for '%s'", (key) => {
      const entry = (sortFieldMap as Record<string, unknown>)[key];
      expect(entry).toBeTruthy();
    });
  });

  describe("required fields", () => {
    it("cover all and only the enum keys", () => {
      const mapKeys = Object.keys(sortFieldMap).sort();
      const expected = [...SORT_KEYS].sort();
      expect(mapKeys).toEqual(expected);
    });
  });

  describe("type & format validation", () => {
    it("each entry has a valid field and direction", () => {
      for (const entry of Object.values(sortFieldMap)) {
        // entry shape check
        expect(entry).toHaveProperty("field");
        expect(entry).toHaveProperty("direction");

        const { field, direction } = entry as {
          field: string;
          direction: (typeof DIRECTIONS)[number]; // a union of DIRECTIONS element types
        };

        // direction must be 'asc' | 'desc'
        expect(DIRECTIONS.includes(direction)).toBe(true);

        // field must be a known DTO field or 'createdAt'
        expect(ALLOWED_FIELDS.has(field)).toBe(true);
      }
    });
  });

  describe("boundary validations", () => {
    it("sort name ascending/descending correctly", () => {
      expect(sortFieldMap.name_asc).toEqual({
        field: "name",
        direction: "asc",
      });
      expect(sortFieldMap.name_desc).toEqual({
        field: "name",
        direction: "desc",
      });
    });

    it("sorts counters/rating as expected", () => {
      expect(sortFieldMap.read).toEqual({
        field: "haveRead",
        direction: "desc",
      });
      expect(sortFieldMap.want).toEqual({
        field: "wantToRead",
        direction: "desc",
      });
      expect(sortFieldMap.rating).toEqual({
        field: "averageRating",
        direction: "desc",
      });
    });
  });

  describe("strictness", () => {
    it("has no unexpected keys and no undefined entries", () => {
      for (const key of SORT_KEYS) {
        const value = sortFieldMap[key];

        expect(value).toBeDefined();
        expect(typeof value).toBe("object");
      }
    });
  });
});
