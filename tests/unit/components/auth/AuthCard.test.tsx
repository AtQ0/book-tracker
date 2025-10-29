import React from "react";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import "@testing-library/jest-dom";
import AuthCard from "@/components/auth/AuthCard";

// Hoist router moch function for asserting behavior
const mockBack = jest.fn();

// Mock next/navigation because BackButton uses useRouter()
jest.mock("next/navigation", () => ({
  useRouter: () => ({
    back: mockBack,
    push: jest.fn(),
  }),
}));

// Help queries
const getHeading = () => screen.getByRole("heading", { name: /login/i });
const getEmailInput = () => screen.getByLabelText(/email/i) as HTMLInputElement;
const getPasswordInput = () =>
  screen.getByLabelText(/password/i) as HTMLInputElement;
const getSubmitButton = () => screen.getByRole("button", { name: /log in/i });
const getForgotPasswordLink = () =>
  screen.getByRole("link", { name: /forgot password\?/i });
const getSignUpLink = () => screen.getByRole("link", { name: /sign up/i });
const getBackButton = () => screen.getByRole("button", { name: /back/i });

// Helper to render, get user, and expose container etc.
function setup() {
  const utils = render(<AuthCard />);
  const user = userEvent.setup();
  return { user, ...utils };
}

describe("<AuthCard />", () => {
  describe("happy path", () => {
    it("renders the login card with heading, fields, actions, and navigation afforances", () => {
      setup();

      // Title
      expect(getHeading()).toBeInTheDocument();

      // Email field
      const email = getEmailInput();
      expect(email).toBeInTheDocument();
      expect(email).toHaveAttribute("type", "email");
      expect(email).toHaveAttribute("placeholder", "you@example.com");

      // Password field
      const password = getPasswordInput();
      expect(password).toBeInTheDocument();
      expect(password).toHaveAttribute("type", "password");
      expect(password).toHaveAttribute("placeholder", "**********");

      // Submit button
      const submitButton = getSubmitButton();
      expect(submitButton).toBeInTheDocument();
      expect(submitButton).toHaveAttribute("type", "submit");

      // Forgot password link
      expect(getForgotPasswordLink()).toBeInTheDocument();

      // Sign up link
      expect(getSignUpLink()).toBeInTheDocument();

      // Back button (for navigation)
      expect(getBackButton()).toBeInTheDocument();
    });
  });

  describe("required fields", () => {
    it("marks email and password inputs as required", () => {
      setup();

      const email = getEmailInput();
      const password = getPasswordInput();

      expect(email).toBeRequired();
      expect(password).toBeRequired();
    });

    it("is a valid React element with no required props", () => {
      const _ok: React.ReactElement = <AuthCard />;
      void _ok;
    });
  });

  describe("type & format validation", () => {
    it("sets correct autoComplete attributes to help browsers do right", () => {
      setup();

      const email = getEmailInput();
      const password = getPasswordInput();

      expect(email).toHaveAttribute("autoComplete", "email");
      expect(password).toHaveAttribute("autoComplete", "current-password");
    });
  });

  describe("boundary validation", () => {
    it("links to 'Forgot password?' to /forgot-password", () => {
      setup();

      const forgotLink = getForgotPasswordLink();
      expect(forgotLink).toBeInTheDocument();
      expect(forgotLink).toHaveAttribute("href", "/forgot-password");
    });

    it("renders the sign up link pointin at signup", () => {
      setup();
      expect(getSignUpLink()).toHaveAttribute("href", "/signup");
    });

    it("keeps the submit button isde the <form> so Enter works for login", () => {
      const { container } = setup(); // the actual DOM element
      const form = container.querySelector("form");
      expect(form).not.toBeNull();
      expect(form).toContainElement(getSubmitButton());
    });

    it("does not crash rendering BackButton absolutely positioned inside relative wrapper", () => {
      const { container } = setup(); // the actual DOM element
      const root = container.firstChild as HTMLElement;
      expect(root).toHaveClass("relative");
    });
  });

  describe("strictness", () => {
    it("Ensures AuthCard remains a closed, zero-prop component", () => {
      const card = <AuthCard />;
      expect(card.props).toEqual({});
    });
  });

  describe("interactions", () => {
    it("lets the user type into email and password fields", async () => {
      const { user } = setup();

      const email = getEmailInput();
      const password = getPasswordInput();

      await user.type(email, "user@example.com");
      await user.type(password, "hunter2");

      expect(email).toHaveValue("user@example.com");
      expect(password).toHaveValue("hunter2");
    });

    it("clicking the Back button calls router.back()", async () => {
      const { user } = setup();

      const backButton = getBackButton();
      expect(backButton).toBeInTheDocument();

      await user.click(backButton);
      expect(mockBack).toHaveBeenCalled();
    });
  });

  describe("accessibility", () => {
    it("connects labels to inputs (email/password) so they are discoverable by role and name", () => {
      setup();

      // Email should be discoverable as role="textbox", accessible name "Email"
      expect(
        screen.getByRole("textbox", { name: /email/i })
      ).toBeInTheDocument();

      // Password field should still be findable via its label
      expect(screen.getByLabelText(/password/i)).toBeInTheDocument();
    });

    it("Verifies that users can see a Back button to go back", () => {
      setup();
      expect(screen.getByRole("button", { name: /back/i }));
    });
  });
});
