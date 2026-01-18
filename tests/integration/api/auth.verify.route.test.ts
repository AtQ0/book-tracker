/**
 * @jest-environment node
 */

import { POST } from "@/app/api/auth/verify/route";
import { verifySignupCode } from "@/server/auth/verifySignup";

// Interception of the import of verifySignupCode
jest.mock("@/server/auth/verifySignup", () => ({
  verifySignupCode: jest.fn(), // replace with jest mock function
}));

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

// Simple helper types for response bodies we care about
type ValidationErrorBody = { message: string };
type ProblemDetailBody = { detail?: string };

// Valid request payload the POST handler will receive after req.json()
const validBody = {
  verificationCode: "123456",
  verificationCodeId: "id-123",
};

describe("POST / api/auth/verify", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("happy path", () => {
    it("returns 200 and ok true when verification succeeds", async () => {
      // Mock a successful backend reply
      mockedVerify.mockResolvedValueOnce({ kind: "ok" });

      // Call post handler with valid payload
      const res = await makeRequest(validBody);

      expect(res.status).toBe(200); // assert the response has status 200

      // parse JSON string in response body into a JS object
      const data = (await res.json()) as { ok: boolean };

      // assert the response payload matches the expected success shape
      expect(data).toEqual({ ok: true });

      // assert backend logic was called with validated input
      expect(mockedVerify).toHaveBeenCalledWith(validBody);
    });
  });

  describe("required fields", () => {
    it("returns 422 when body is missing required fields and does not call verifySignupCode", async () => {
      // Call post handler with an empty object
      const res = await makeRequest({});

      expect(res.status).toBe(422);
      const data = (await res.json()) as ValidationErrorBody;
      expect(data).toHaveProperty("message");
      expect(typeof data.message).toBe("string");
      expect(mockedVerify).not.toHaveBeenCalled();
    });
  });

  describe("type and format validation", () => {
    it("returns 422 when verificationCode is not a six digit number and does not call verifySignupCode", async () => {
      const res = await makeRequest({
        ...validBody,
        verificationCode: "abc123",
      });

      expect(res.status).toBe(422);
      const data = (await res.json()) as ValidationErrorBody;
      // Assert that the 'message' property exists and is a string
      expect(typeof data.message).toBe("string");
      expect(mockedVerify).not.toHaveBeenCalled();
    });
  });

  describe("boundary validation", () => {
    it("returns 422 when verificationCode has wrong length", async () => {
      const res = await makeRequest({
        ...validBody,
        verificationCode: "12345",
      });

      expect(res.status).toBe(422);
      const data = (await res.json()) as ValidationErrorBody;
      expect(typeof data.message).toBe("string");
      expect(mockedVerify).not.toHaveBeenCalled();
    });
  });

  describe("strictness", () => {
    it("ignores unknown extra properties and still validates core fields", async () => {
      mockedVerify.mockResolvedValueOnce({ kind: "ok" });

      const res = await makeRequest({
        ...validBody,
        extraField: "ignored",
      });

      expect(res.status).toBe(200);
      const data = (await res.json()) as { ok: boolean };
      expect(data).toEqual({ ok: true });

      expect(mockedVerify).toHaveBeenCalledWith(validBody);
    });
  });

  describe("interaction", () => {
    it("maps expired result to 422 with an appropriate problem detail", async () => {
      mockedVerify.mockResolvedValueOnce({ kind: "expired" });

      const res = await makeRequest(validBody);

      expect(res.status).toBe(422);
      const data = (await res.json()) as ProblemDetailBody;
      expect(String(data.detail).toLowerCase()).toContain("expired");
    });

    it("maps invalid result to 422 with invalid verification code message", async () => {
      mockedVerify.mockResolvedValueOnce({ kind: "invalid" });

      const res = await makeRequest(validBody);

      expect(res.status).toBe(422);
      const data = (await res.json()) as ProblemDetailBody;
      expect(String(data.detail).toLowerCase()).toContain(
        "invalid verification code",
      );
    });

    it("maps not found result to 422 with invalid verification code message", async () => {
      mockedVerify.mockResolvedValueOnce({ kind: "not-found" });

      const res = await makeRequest(validBody);

      expect(res.status).toBe(422);
      const data = (await res.json()) as ProblemDetailBody;
      expect(String(data.detail).toLowerCase()).toContain(
        "invalid verification code",
      );
    });

    it("maps already verified result to 409 conflict", async () => {
      mockedVerify.mockResolvedValueOnce({ kind: "already-verified" });

      const res = await makeRequest(validBody);

      expect(res.status).toBe(409);
      const data = (await res.json()) as ProblemDetailBody;
      expect(String(data.detail).toLowerCase()).toContain("already verified");
    });

    it("returns 500 when verifySignupCode throws and exposes a generic error", async () => {
      // Spy on console.error and silence its output during this test
      const consoleErrorSpy = jest
        .spyOn(console, "error")
        .mockImplementation(() => {});

      // Make verifySignupCode throw an error once
      mockedVerify.mockRejectedValueOnce(new Error("ka-boom"));

      // Execute the route handler with a valid request body
      const res = await makeRequest(validBody);

      // Expect the route to return HTTP 500
      expect(res.status).toBe(500);

      // Parse JSON response body
      const data = (await res.json()) as ProblemDetailBody;

      // Ensure the returned error message contains the expected text
      expect(String(data.detail).toLowerCase()).toContain(
        "could not verify your email",
      );

      // Ensure console.error logged the correct message and an Error object
      expect(consoleErrorSpy).toHaveBeenCalledWith(
        "verify error",
        expect.any(Error),
      );

      // Restore the original console.error implementation
      consoleErrorSpy.mockRestore();
    });
  });

  describe("accessibility", () => {
    it("exposes errors in a machine readable JSON shape for clients", async () => {
      mockedVerify.mockResolvedValueOnce({ kind: "invalid" });

      const res = await makeRequest(validBody);

      expect(res.headers.get("content-type")).toMatch(
        /application\/problem\+json/,
      );
    });
  });
});
