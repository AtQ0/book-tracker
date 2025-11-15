/**
 * @jest-environment jsdom
 */

import React from "react";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import AuthForm from "@/components/auth/AuthForm";
import { ErrorPayload } from "@/lib/auth-helpers";

// Helper function that provides data for creating mocked Fields
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

// shortcut mock of a successful response
function makeOkResponse(): Response {
  return {
    ok: true,
    status: 200,
    json: async () => null,
  } as unknown as Response;
}

// General mock of any response (success or error)
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

    it("shows a form level messasge when backend returns 422 wuthout fields", async () => {
      const user = userEvent.setup();
      const payload = { message: "Invalid data" };

      const onSubmit = jest.fn(async () => makeJsonResponse(payload, 422));

      render(
        <AuthForm
          fields={makeFields()}
          submitLabel="Submit"
          onSubmit={onSubmit}
        />
      );

      await user.type(screen.getByLabelText(/email/i), "user@example.com");
      await user.type(screen.getByLabelText(/password/i), "secret123");
      await user.click(screen.getByRole("button", { name: /submit/i }));

      const alert = await screen.findByRole("alert");

      expect(alert).toHaveTextContent("Invalid data");
    });
  });

  describe("boundary validation", () => {
    it("passes maxLength to the rendered input", () => {
      const fields = [
        {
          id: "email",
          label: "Email",
          type: "email" as const,
          name: "email",
          required: true,
          autoComplete: "email",
          maxLength: 40,
        },
      ];

      const onSubmit = jest.fn(async () => makeOkResponse());

      render(
        <AuthForm fields={fields} submitLabel="Submit" onSubmit={onSubmit} />
      );

      const emailInput = screen.getByLabelText(/email/i);
      expect(emailInput).toHaveAttribute("maxLength", "40");
    });

    it("leaves unknown field names as entered with no default normalizers", async () => {
      const user = userEvent.setup();
      const fields = [
        {
          id: "custom",
          label: "Custom",
          type: "text" as const,
          name: "custom",
          required: true,
        },
      ];

      const onSubmit = jest.fn(
        async (values: Record<string, string>, signal: AbortSignal) => {
          void values; // tell TS that values are declard but never used, to silence TS
          void signal;
          return makeOkResponse();
        }
      );

      render(
        <AuthForm fields={fields} submitLabel="Submit" onSubmit={onSubmit} />
      );

      await user.type(screen.getByLabelText(/custom/i), " Raw Value ");
      await user.click(screen.getByRole("button", { name: /submit/i }));

      await waitFor(() => {
        expect(onSubmit).toHaveBeenCalledTimes(1);
      });

      const [values] = onSubmit.mock.calls[0];

      expect(values.custom).toBe(" Raw Value ");
    });

    it("uses a custom normalizer when provided and overrides defaults", async () => {
      const user = userEvent.setup();
      const fields = [
        {
          id: "email",
          label: "Email",
          type: "email" as const,
          name: "email",
          required: true,
          normalize: (v: string) => v.trim() + "!",
        },
      ];

      const onSubmit = jest.fn(
        async (values: Record<string, string>, signal: AbortSignal) => {
          void values; // tell TS that values are declard but never used, to silence TS
          void signal;
          return makeOkResponse();
        }
      );

      render(
        <AuthForm fields={fields} submitLabel="Submit" onSubmit={onSubmit} />
      );

      await user.type(screen.getByLabelText(/email/i), "  test@example.com  ");
      await user.click(screen.getByRole("button", { name: /submit/i }));

      await waitFor(() => {
        expect(onSubmit).toHaveBeenCalledTimes(1);
      });

      const [values] = onSubmit.mock.calls[0]!;
      expect(values.email).toBe("test@example.com!");
    });
  });

  describe("strictness", () => {
    it("shows the payload message for existing email conflict (status 409)", async () => {
      const user = userEvent.setup();
      const payload = { message: "Email already taken" };

      const onSubmit = jest.fn(async () => makeJsonResponse(payload, 409));

      render(
        <AuthForm
          fields={makeFields()}
          submitLabel="Submit"
          onSubmit={onSubmit}
        />
      );

      await user.type(screen.getByLabelText(/email/i), "user@example.com");
      await user.type(screen.getByLabelText(/password/i), "secret123");
      await user.click(screen.getByRole("button", { name: /submit/i }));

      const errorText = await screen.findByText(/email already taken/i);
      expect(errorText).toBeInTheDocument();
    });

    it("shows the payload message for rate limited requests (status 429", async () => {
      const user = userEvent.setup();
      const payload = { message: "Too many attempts" };

      const onSubmit = jest.fn(async () => makeJsonResponse(payload, 429));

      render(
        <AuthForm
          fields={makeFields()}
          submitLabel="Submit"
          onSubmit={onSubmit}
        />
      );

      await user.type(screen.getByLabelText(/email/i), "user@example.com");
      await user.type(screen.getByLabelText(/password/i), "secret123");
      await user.click(screen.getByRole("button", { name: /submit/i }));

      const alert = await screen.findByRole("alert");
      expect(alert).toHaveTextContent(/too many attempts/i);
    });

    it("falls back to a generic message for unknown server errors", async () => {
      const user = userEvent.setup();

      const onSubmit = jest.fn(async () => makeJsonResponse({}, 500));

      render(
        <AuthForm
          fields={makeFields()}
          submitLabel="Submit"
          onSubmit={onSubmit}
        />
      );

      await user.type(screen.getByLabelText(/email/i), "user@example.com");
      await user.type(screen.getByLabelText(/password/i), "secret123");
      await user.click(screen.getByRole("button", { name: /submit/i }));

      const alert = await screen.findByRole("alert");
      expect(alert).toHaveTextContent(
        /something went wrong\. please try again\./i
      );
    });
  });

  describe("interaction", () => {
    it("clears a field error when the user edits that field", async () => {
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

      const emailInput = screen.getByLabelText(/email/i);

      await user.type(emailInput, "bad@example.com");
      await user.type(screen.getByLabelText(/password/i), "secret123");
      await user.click(screen.getByRole("button", { name: /submit/i }));

      expect(onSubmit).toHaveBeenCalledTimes(1);

      const error = await screen.findByText(/not a valid email/i);
      expect(error).toBeInTheDocument();

      await user.clear(emailInput);
      await user.type(emailInput, "a");

      await waitFor(() => {
        expect(
          screen.queryByText(/not a valid email/i)
        ).not.toBeInTheDocument();
      });
    });

    it("disables submit while pending, prevents double submit, and restores label and state after response", async () => {
      const user = userEvent.setup();

      // Will hold the Promise’s resolve function so we can control when it resolves
      let resolveSubmit: ((res: Response) => void) | undefined;

      // Mock onSubmit: return a Promise<Response> and capture its resolve callback
      const onSubmit = jest.fn(
        () =>
          new Promise<Response>((resolve, reject) => {
            void reject; // Mark reject as intentionally unused
            resolveSubmit = resolve; // Store resolve for later
          })
      );

      render(
        <AuthForm
          fields={makeFields()}
          submitLabel="Submit"
          pendingLabel="Working..."
          onSubmit={onSubmit}
        />
      );

      await user.type(screen.getByLabelText(/email/i), "user@example.com");
      await user.type(screen.getByLabelText(/password/i), "secret123");

      const button = screen.getByRole("button", { name: /submit/i });

      // Initial state: not pending
      expect(button).toHaveTextContent("Submit");
      expect(button).not.toBeDisabled();

      await user.click(button);

      // First submit triggers pending state
      expect(onSubmit).toHaveBeenCalledTimes(1);
      expect(button).toBeDisabled();
      expect(button).toHaveTextContent("Working..."); // Changed due to submission

      // Second click while pending should do nothing
      await user.click(button);
      expect(onSubmit).toHaveBeenCalledTimes(1); // Shows second submit was rejected

      // Manually resolve the Promise to exit pending state
      resolveSubmit?.(makeOkResponse());

      await waitFor(() => {
        expect(button).not.toBeDisabled();
        expect(button).toHaveTextContent("Submit");
      });
    });
  });

  describe("accessibility", () => {
    it("renders a live region for form level errors with correct attributes", () => {
      const onSubmit = jest.fn(async () => makeOkResponse());

      render(
        <AuthForm
          fields={makeFields()}
          submitLabel="Submit"
          onSubmit={onSubmit}
        />
      );

      // Grab hidden p-element
      const alert = screen.getByRole("alert", { hidden: true });

      expect(alert).toHaveAttribute("data-form-error");
      expect(alert).toHaveAttribute("aria-live", "assertive");
      expect(alert).toHaveAttribute("aria-atomic", "true");
      expect(alert).toHaveAttribute("hidden");
      expect(alert).toBeEmptyDOMElement();
    });

    it("exposes the network error message through the Form Error live region and removes hidden", async () => {
      const user = userEvent.setup();

      const onSubmit = jest.fn(async () => {
        throw new Error("network broken");
      });

      render(
        <AuthForm
          fields={makeFields()}
          submitLabel="Submit"
          onSubmit={onSubmit}
        />
      );
      await user.type(screen.getByLabelText(/email/i), "user@example.com");
      await user.type(screen.getByLabelText(/password/i), "secret123");
      await user.click(screen.getByRole("button", { name: /submit/i }));

      const alert = await screen.findByRole("alert");

      expect(alert).toHaveTextContent(
        /network issue or timeout\. please check your connection and try again\./i
      );
      expect(alert).not.toHaveAttribute("hidden");
    });
  });
});
