/**
 * @jest-environment jsdom
 */

import React from "react";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import AuthForm from "@/components/auth/AuthForm";
import { ErrorPayload } from "@/lib/auth-helpers";

function makeFields() {
  return [
    {
      id: "email",
      label: "Email",
      type: "email" as const,
      name: "email",
      required: true,
      autoComplete: "email",
    },
    {
      id: "password",
      label: "Password",
      type: "password" as const,
      name: "password",
      required: true,
      autoComplete: "current-password",
    },
  ];
}

function makeOkResponse(): Response {
  return {
    ok: true,
    status: 200,
    json: async () => null,
  } as unknown as Response;
}

function makeJsonResponse(body: unknown, status: number): Response {
  return {
    ok: status >= 200 && status < 300,
    status,
    json: async () => body,
  } as unknown as Response;
}

describe("AuthForm", () => {
  describe("happy path", () => {
    it("submits normalized values with an AbortSignal and call onSuccess on ok response", async () => {
      const user = userEvent.setup();

      const onSubmit = jest.fn(
        async (values: Record<string, string>, signal: AbortSignal) => {
          void values; // tell TS that values are declard but never used, to silence TS
          void signal;
          return makeOkResponse();
        }
      );

      const onSuccess = jest.fn();

      render(
        <AuthForm
          fields={makeFields()}
          submitLabel="Create account"
          pendingLabel="Working..."
          onSubmit={onSubmit}
          onSuccess={onSuccess}
        />
      );

      const emailInput = screen.getByLabelText(/email/i);
      const passwordInput = screen.getByLabelText(/password/i);
      const button = screen.getByRole("button", { name: /create account/i });

      await user.type(emailInput, "test@example.com");
      await user.type(passwordInput, "secret123");

      // trigger onSubmit event an thus call onSubmit via Form
      await user.click(button);

      await waitFor(() => {
        expect(onSubmit).toHaveBeenCalledTimes(1);
      });

      // destructure properties from the first (and only) call
      const [values, signal] = onSubmit.mock.calls[0];

      // validate that arguments passed into onSubmit during the call
      expect(values.email).toBe("test@example.com");
      expect(values.password).toBe("secret123");
      expect(signal).toBeInstanceOf(AbortSignal);
      expect(signal.aborted).toBe(false);

      // Validate that onSuccess was called with a res args
      await waitFor(() => {
        expect(onSuccess).toHaveBeenCalledTimes(1);
        expect(onSuccess).toHaveBeenCalledWith(
          expect.objectContaining({ ok: true, status: 200 })
        );
      });
    });
  });

  describe("required fields", () => {
    it("does not submit when browser validity fails and keeps button enables", async () => {
      const user = userEvent.setup();
      const onSubmit = jest.fn(async () => makeOkResponse());

      // failed checkValidity mock
      const checkSpy = jest
        .spyOn(HTMLFormElement.prototype, "checkValidity") // grab the real function
        .mockImplementation(() => false); // mock checkValidity function with false

      const reportSpy = jest
        .spyOn(HTMLFormElement.prototype, "reportValidity")
        .mockImplementation(() => true);

      render(
        <AuthForm
          fields={makeFields()}
          submitLabel="Submit"
          onSubmit={onSubmit}
        />
      );

      const button = screen.getByRole("button", { name: /submit/i });
      await user.click(button);

      expect(checkSpy).toHaveBeenCalled();
      expect(reportSpy).toHaveBeenCalled();
      expect(onSubmit).not.toHaveBeenCalled();
      expect(button).not.toBeDisabled();

      checkSpy.mockRestore();
      reportSpy.mockRestore();
    });
  });

  describe("type and format validation", () => {
    it("shows a field level error when backend reports invalid field (status 422)", async () => {
      const user = userEvent.setup();
      const payload: ErrorPayload = {
        message: "Validation failed",
        fieldErrors: {
          email: ["Not a valid email"],
        },
        formErrors: [],
      };

      const onSubmit = jest.fn(async () => makeJsonResponse(payload, 422));

      render(
        <AuthForm
          fields={makeFields()}
          submitLabel="Submit"
          onSubmit={onSubmit}
        />
      );

      await user.type(screen.getByLabelText(/email/i), "bad@example.com");
      await user.type(screen.getByLabelText(/password/i), "secret123");
      await user.click(screen.getByRole("button", { name: /submit/i }));

      // Validate submit was called
      await waitFor(() => {
        expect(onSubmit).toHaveBeenCalledTimes(1);
      });

      // validate that erroPayload was rendered upon submit
      expect(await screen.findByText(/not a valid email/i)).toBeInTheDocument();

      const emailInput = screen.getByLabelText(/email/i);
      expect(emailInput).toHaveAttribute("aria-invalid", "true");
    });
  });
});
