import React from "react";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import "@testing-library/jest-dom";
import Label from "@/components/ui/Label";
import Input from "@/components/ui/Input";

describe("<Label />", () => {
  describe("happy path", () => {
    it("renders label text", () => {
      render(<Label>Email</Label>);
      const el = screen.getByText(/email/i);
      expect(el).toBeInTheDocument();
      expect(el.tagName).toBe("LABEL");
    });

    it("merges className with defaults", () => {
      render(<Label className="font-bold">Name</Label>);
      const el = screen.getByText("Name");
      expect(el).toHaveClass("text-sm", "text-licorice"); // default
      expect(el).toHaveClass("font-bold"); // custom added
    });
  });

  describe("required fields", () => {
    it("accepts standard label props (e.g. htmlFor), compile-time only", () => {
      const _ok: React.ReactElement = <Label htmlFor="x">X</Label>;
      void _ok;
    });
  });

  describe("type & format validation", () => {
    it("supports htmlFor linking to an input (discoverable by name)", () => {
      render(
        <div>
          <Label htmlFor="phone">Phone</Label>
          <Input id="phone" />
        </div>
      );
      // Validate there is aconnection between the label and some form element (e.g. input, textarea, select etc.)
      expect(screen.getByLabelText("Phone")).toBeInTheDocument();
    });

    it("supports wrapping the input (discoverable without htmlFor)", () => {
      render(
        <Label>
          Search{" "}
          {/* labels text should per default be inputs accessible name if not overridden by aria-label */}
          <Input aria-label="internal" />
        </Label>
      );
      // validate that input element exists and its accessible name is overriden by aria-label
      expect(
        screen.getByRole("textbox", { name: "internal" })
      ).toBeInTheDocument();
    });
  });

  describe("boundary validation", () => {
    it("renders safely with empty children", () => {
      const { container } = render(<Label>{""}</Label>);
      expect(container.querySelector("label")).toBeInTheDocument();
    });
  });

  describe("strictness", () => {
    it("resolves conflicting font-size classes (later wins via twMerge)", () => {
      render(<Label className="text-base">Phone</Label>);
      const el = screen.getByText("Phone");
      expect(el).toHaveClass("text-base");
      expect(el).not.toHaveClass("text-sm");
    });

    it("preserves non-conflicting classes alongside defaults", () => {
      render(<Label className="uppercase">Caps</Label>);
      const el = screen.getByText("Caps");
      // Validate that custom and default styling live side by side
      expect(el).toHaveClass("uppercase", "text-sm", "text-licorice");
    });
  });

  describe("interaction", () => {
    it("clicking the label focuses the associated control (htmlFor)", async () => {
      const user = userEvent.setup();
      render(
        <div>
          <Label htmlFor="user">User</Label>
          <Input id="user" />
        </div>
      );
      const input = screen.getByLabelText("User");
      await user.click(screen.getByText("User"));
      expect(input).toHaveFocus();
    });
  });

  describe("accessibility", () => {
    it("uses label content (even long text) as accessible name", () => {
      const long = "Contact email (we'll never share it) - support & updates";
      render(
        <div>
          <Label htmlFor="email">{long}</Label>
          <Input id="email" />
        </div>
      );
      expect(screen.getByLabelText(long)).toBeInTheDocument();
    });

    it("preserves aria-* and data-* props in label", () => {
      render(
        <Label aria-describedby="hint" data-cy="label">
          Visible
        </Label>
      );
      const el = screen.getByText("Visible");
      expect(el).toHaveAttribute("aria-describedby", "hint");
      expect(el).toHaveAttribute("data-cy", "label");
    });
  });
});
