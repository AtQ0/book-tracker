import nextJest from "next/jest.js";

// Use Next.js's config and env so Jest handles TS, JSX, and imports correctly
const createJestConfig = nextJest({ dir: "./" });

export default createJestConfig({
  testEnvironment: "jsdom",
  setupFilesAfterEnv: ["<rootDir>/tests/setup/jest.setup.ts"],
  moduleNameMapper: { "^@/(.*)$": "<rootDir>/src/$1" },
});
