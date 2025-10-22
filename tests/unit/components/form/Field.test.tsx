import React from "react";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import "@testing-library/jest-dom";
import Field from "@/components/form/Field";
import Input from "@/components/ui/Input";

describe("<Field />", () => {
  describe("happy path", () => {
    it("renders a label tied to the input by id/htmlFor", () => {
      render(
        <Field id="email" label="Email">
          <Input placeholder="you@example.com" />
        </Field>
      );
      expect(screen.getByLabelText("Email")).toBeInTheDocument();
    });

    it("exposes the input with the correct accessible name", () => {
      render(
        <Field id="field-id" label="Field Label">
          <Input />
        </Field>
      );
      expect(screen.getByLabelText("Field Label")).toHaveAccessibleName(
        "Field Label"
      );
    });

    it("injects accessibility props into the child input", () => {
      render(
        <Field id="name" label="Name">
          <Input />
        </Field>
      );
      const input = screen.getByLabelText("Name");
      expect(input).toHaveAttribute("id", "name");
      expect(input).not.toHaveAttribute("aria-invalid");
      expect(input).not.toHaveAttribute("aria-describedby");
    });

    // Validate that Field can wrap any input-like child and still enforce its accessibility contract
    it("works with any child that supports FieldChildProps (not only <Input/>)", () => {
      const Child = (p: React.ComponentProps<"input">) => (
        <input {...p} data-testid="child" />
      );
      render(
        <Field id="c" label="C" hint="H">
          <Child />
        </Field>
      );

      const el = screen.getByTestId("child");
      // Check that Field correctly passes down id value
      expect(el).toHaveAttribute("id", "c");
      // Check that Field passes down a11y attributes
      expect(el).toHaveAttribute("aria-describedby", "c-hint");
    });

    it("supports any child (e.g. <textarea>) that accepts the injected props", () => {
      const Textarea = (p: React.ComponentProps<"textarea">) => (
        <textarea {...p} data-testid="ta" />
      );
      render(
        <Field id="bio" label="Bio" hint="Max 140 chars">
          <Textarea />
        </Field>
      );

      const ta = screen.getByTestId("ta");
      expect(ta).toHaveAttribute("id", "bio");
      expect(ta).toHaveAttribute("aria-describedby", "bio-hint");
    });
  });

  describe("required fields", () => {
    it("requires id and label at compile-time (TS)", () => {
      const bad = (
        // @ts-expect-error <Field> missing required props, should error in TS
        <Field>
          <Input />
        </Field>
      );
      expect(bad).toBeTruthy(); // Trivial runtime assertion to keep Jest happy
    });
  });

  describe("type & format validation", () => {
    it("supports hint only, sets ari-adescribedby to hint id", () => {
      render(
        <Field id="u" label="User" hint="This will be public">
          <Input />
        </Field>
      );

      // Gets form control (e.g. <input>) associated with the "User" label
      const input = screen.getByLabelText("User");

      // Check child (<input>) recieves key value (u-hint) for aria-describedby
      expect(input).toHaveAttribute("aria-describedby", "u-hint");

      // Check that hint message element has inherited u-hint as its id value
      expect(screen.getByText("This will be public")).toHaveAttribute(
        "id",
        "u-hint"
      );
    });

    it("supports error only, sets aria-invalid and aria-described to error id", () => {
      render(
        <Field id="p" label="Password" error="Too short">
          <Input />
        </Field>
      );

      // Gets form control (e.g. <input>) associated with the "Password" label
      const input = screen.getByLabelText("Password");
      expect(input).toHaveAttribute("aria-invalid", "true");
      expect(input).toHaveAttribute("aria-describedby", "p-error");

      // Get the element displaying the error message via its ARIA role="alert"
      const errorEl = screen.getByRole("alert");
      expect(errorEl).toHaveTextContent("Too short");
      expect(errorEl).toHaveAttribute("id", "p-error");
    });

    it("supports both hint and error, aria-describedby contains both ids", () => {
      render(
        <Field id="bio2" label="Bio" hint="Max 140 chars" error="Too long">
          <Input />
        </Field>
      );

      // Gets form control (e.g. <input>) associated with the "Bio" label
      const input = screen.getByLabelText("Bio");
      const described = input.getAttribute("aria-describedby") || "";
      // Create array of two values (hint & error) by splitting described at space
      const tokens = new Set(described.split(" "));
      expect(tokens.has("bio2-hint")).toBe(true);
      expect(tokens.has("bio2-error")).toBe(true);
    });

    it("overrides child's pre-set aria props and id (Field is source of truth)", () => {
      render(
        <Field id="o" label="O" hint="H" error="E">
          <Input
            id="custom-id"
            aria-describedby="custom"
            aria-invalid={false}
          />
        </Field>
      );

      const input = screen.getByLabelText("O");
      expect(input).toHaveAttribute("id", "o");

      const described = input.getAttribute("aria-describedby") || "";
      const tokens = new Set(described.split(" "));
      expect(tokens.has("o-hint")).toBe(true);
      expect(tokens.has("o-error")).toBe(true);
      expect(tokens.has("custom")).toBe(false);
      expect(input).toHaveAttribute("aria-invalid", "true");
    });
  });

  describe("boundary validation", () => {
    it("does not render hint/error when not provided", () => {
      render(
        <Field id="a" label="A">
          <Input />
        </Field>
      );
      const input = screen.getByLabelText("A");
      expect(screen.queryByRole("alert")).toBeNull();
      expect(input).not.toHaveAttribute("aria-describedby");
    });

    it("renders with default wrapper class when className not provided", () => {
      render(
        <Field id="x" label="X">
          <Input />
        </Field>
      );
      const input = screen.getByLabelText("X");
      expect(input.parentElement).toHaveClass("flex", "flex-col");
    });

    it("allows overriding wrapper className", () => {
      render(
        <Field id="y" label="Y" className="space-y-2">
          <Input />
        </Field>
      );
      const input = screen.getByLabelText("Y");
      expect(input.parentElement).toHaveClass("space-y-2");
      expect(input.parentElement).not.toHaveClass("flex", "flex-col");
    });
  });

  describe("interaction and updates", () => {
    it("updates aria-invalid/aria-describedby when error toggles on", () => {
      const { rerender } = render(
        <Field id="t" label="T">
          <Input />
        </Field>
      );

      // before: no error, no a11y attrs
      let input = screen.getByLabelText("T");
      expect(input).not.toHaveAttribute("aria-invalid");
      expect(input).not.toHaveAttribute("aria-describedby");

      // toggle error on
      rerender(
        <Field id="t" label="T" error="Bad">
          <Input />
        </Field>
      );

      // after: error, attrs present
      input = screen.getByLabelText("T");
      expect(input).toHaveAttribute("aria-invalid", "true");
      expect(input).toHaveAttribute("aria-describedby", "t-error");

      const errorEl = screen.getByRole("alert");
      expect(errorEl).toHaveTextContent("Bad");
      expect(errorEl).toHaveAttribute("id", "t-error");
    });

    it("removes aria-invalid/aria-describedby and alert when error toggles off", () => {
      const { rerender } = render(
        <Field id="t" label="T" error="Bad">
          <Input />
        </Field>
      );

      expect(screen.getByLabelText("T")).toHaveAttribute(
        "aria-describedby",
        "t-error"
      );

      expect(screen.getByRole("alert")).toBeInTheDocument();

      rerender(
        <Field id="t" label="T">
          <Input />
        </Field>
      );

      const input = screen.getByLabelText("T");
      expect(input).not.toHaveAttribute("aria-invalid");
      expect(input).not.toHaveAttribute("aria-describedby");
      expect(screen.queryByRole("alert")).toBeNull();
    });

    it("preserves existing child props like className and placeholder", () => {
      render(
        <Field id="p" label="P">
          <Input className="foo" placeholder="bar" />
        </Field>
      );

      const input = screen.getByLabelText("P");
      expect(input).toHaveClass("foo");
      expect(input).toHaveAttribute("placeholder", "bar");
    });

    it("preserves event handlers on the child", async () => {
      const onChange = jest.fn();
      const onBlur = jest.fn();
      const user = userEvent.setup();

      render(
        <Field id="evt" label="Evt">
          <Input onChange={onChange} onBlur={onBlur} />
        </Field>
      );

      const input = screen.getByLabelText("Evt") as HTMLInputElement;

      await user.click(input); // Clicks on input and puts focus (onFocus) on it
      await user.tab(); // Tabs away so focus moves to another element
      expect(onBlur).toHaveBeenCalled(); // onBlur event fires when focus changes

      await user.type(input, "hello");
      expect(onChange).toHaveBeenCalled();
      expect(input).toHaveValue("hello");
    });
  });
});
