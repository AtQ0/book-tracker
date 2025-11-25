import { POST } from "@/app/api/auth/verify/route";
import { verifySignupCode } from "@/server/auth/verifySignup";

// Interception of the import of verifySignupCode
jest.mock("@/server/auth/verifySignup", () => {
  verifySignupCode: jest.fn(); // replace with jest mock function
});

// TS cast of verifySignupCode ensuring it's treated as a typed jest mock
const mockedVerify = verifySignupCode as jest.MockedFunction<
  typeof verifySignupCode
>;

// Build a fetch-like Request and call POST(req) directly
async function makeRequest(body: unknown) {
  const req = new Request("http://localhost/api/auth/verify", {
    method: "POST",
    body: JSON.stringify(body),
    headers: { "Content-Type": "application/json" },
  });

  return POST(req);
}

// Valid request payload the POST handler will receive after req.json()
const validBody = {
  verificationCode: "123456",
  verificationCodeId: "id-123",
};

describe("POST / api/auth/verify", () => {
  describe("happy path", () => {
    it("returns 200 and ok true when verification succeeds", async () => {});
  });
});
