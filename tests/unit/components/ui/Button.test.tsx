import React, { createRef } from "react";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import "@testing-library/jest-dom";
import Button from "@/components/ui/Button";

// helper to get <button> element by its accessible name (from text or aria-label)
const byName = (name: string | RegExp) => screen.getByRole("button", { name });

describe("<Button />", () => {
  describe("happy path", () => {
    it("renders a button with provided children as accessible name", () => {
      render(<Button>Save</Button>);
      expect(byName("Save")).toBeInTheDocument();
    });
  });

  it("applies the primary variant by default", () => {
    render(<Button>Primary</Button>);
    const el = byName("Primary");
    expect(el).toHaveClass("bg-russet");
    expect(el).toHaveClass("text-white");

    // validate that variant overrides base text size via twMerge
    expect(el).toHaveClass("text-xl");
    expect(el).not.toHaveClass("text-base");
  });

  it("uses type='button' by default (not submit)", () => {
    render(<Button>Default Type</Button>);
    expect(byName("Default Type")).toHaveAttribute("type", "button");
  });

  describe("required fields", () => {
    it("has no required props, compile-time only", () => {
      // Type only, ensures <Button /> is a valid React button element
      const _ok: React.ReactElement = <Button />;
      void _ok;
    });
  });

  describe("type & format validation", () => {
    it("supports variant='secondary'", () => {
      render(<Button variant="secondary">Secondary</Button>);
      const el = byName("Secondary");
      expect(el).toHaveClass("bg-golden-brown");
      expect(el).toHaveClass("text-white");
    });

    it("supports variant='ghost'", () => {
      render(<Button variant="ghost">Ghost</Button>);
      const el = byName("Ghost");
      expect(el).toHaveClass("bg-transparent");
      expect(el).toHaveClass("text-licorice");
    });

    it("shows loading label when isLoading=true", () => {
      render(<Button isLoading>Save</Button>);
      expect(byName(/loading\.\.\./i)).toBeInTheDocument();
    });

    it("respects custom type attribute", () => {
      render(<Button type="submit">Submit</Button>);
      expect(byName("Submit")).toHaveAttribute("type", "submit");
    });
  });

  describe("boundary validation", () => {
    it("is discoverable by aria-label when no children provided", () => {
      render(<Button aria-label="Icon Button" />);
      expect(byName("Icon Button")).toBeInTheDocument();
    });

    it("handles long text without crashing", () => {
      const long = "L".repeat(500);
      render(<Button>{long}</Button>);
      expect(byName(long)).toBeInTheDocument();
    });

    it("merges className via twMerge (later overrides win)", () => {
      render(
        <Button className="px-8" variant="primary">
          Merge
        </Button>,
      );
      const el = byName("Merge");
      expect(el).toHaveClass("px-8");
      expect(el).not.toHaveClass("px-5");

      // primary variant sets py-2.5, so that's what should win over base py-3
      expect(el).toHaveClass("py-2.5");
      expect(el).not.toHaveClass("py-3");
    });

    it("preserves non-conflicting custom classes", () => {
      render(<Button className="uppercase tracking-wide">Decorated</Button>);
      const el = byName("Decorated");
      expect(el).toHaveClass("uppercase", "tracking-wide");
    });
  });

  describe("strictness", () => {
    it("forwards ref to the underlying <button>", () => {
      const ref = createRef<HTMLButtonElement>();
      render(<Button ref={ref}>Ref</Button>);
      expect(ref.current).toBeInstanceOf(HTMLButtonElement);
      ref.current?.focus();
      expect(ref.current).toHaveFocus();
    });

    it("includes base/state classes (spot check)", () => {
      render(<Button>Classes</Button>);
      const el = byName("Classes");
      expect(el).toHaveClass("inline-flex", "items-center", "justify-center");
      expect(el).toHaveClass("disabled:opacity-50");
      expect(el).toHaveClass("disabled:cursor-not-allowed");
    });
  });

  describe("interaction", () => {
    it("fires onClick when enabled", async () => {
      const user = userEvent.setup();
      const onClick = jest.fn();
      render(<Button onClick={onClick}>Click</Button>);

      await user.click(byName("Click"));
      expect(onClick).toHaveBeenCalledTimes(1);
    });

    it("does not fire onClick when disabled", async () => {
      const user = userEvent.setup();
      const onClick = jest.fn();
      render(
        <Button disabled onClick={onClick}>
          Disabled
        </Button>,
      );

      await user.click(byName("Disabled"));
      expect(onClick).not.toHaveBeenCalled();
    });

    it("does not fire onClick when isLoading=true (disabled under the hood)", async () => {
      const user = userEvent.setup();
      const onClick = jest.fn();
      render(
        <Button isLoading onClick={onClick}>
          Save
        </Button>,
      );

      await user.click(byName(/loading/i));
      expect(onClick).not.toHaveBeenCalled();
    });

    it("supports keyboard activation (Enter/Space) when enabled", async () => {
      const user = userEvent.setup();
      const onClick = jest.fn();
      render(<Button onClick={onClick}>Key</Button>);
      const el = byName("Key");

      el.focus();
      await user.keyboard("{Enter}"); // triggers click on keydown for Enter
      await user.keyboard(" "); // triggers click on keyup for Space
      expect(onClick).toHaveBeenCalledTimes(2);
    });
  });

  describe("accessibility", () => {
    it("uses children text as the accessible name", () => {
      render(<Button>Do it</Button>);
      expect(byName("Do it")).toBeInTheDocument();
    });

    it("marks the control as disabled when disabled or loading", () => {
      const { rerender } = render(<Button disabled>Disabled</Button>);
      expect(byName("Disabled")).toBeDisabled();

      rerender(<Button isLoading>Busy</Button>);
      expect(byName(/loading/i)).toBeDisabled();
    });
  });
});
