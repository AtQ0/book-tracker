import React, { createRef } from "react";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import "@testing-library/jest-dom";
import Input from "@/components/ui/Input";

describe("<Input />", () => {
  describe("happy path", () => {
    it("renders an input (textbox), forwards native props, and is accessible by name", () => {
      // Render with both aria-label (for accessibility) and placeholder (for visuals)
      render(<Input aria-label="Type here" placeholder="Type here" />);

      // Validate that element is an input-element by checking its tagName
      const el = screen.getByPlaceholderText("Type here");
      expect(el.tagName).toBe("INPUT");
      expect(el).toBeInTheDocument();

      // Ensure the element is discoverable by its accessible name
      expect(
        screen.getByRole("textbox", { name: /type here/i })
      ).toBeInTheDocument();

      // Confirm focus behavior (ensures it’s focusable and not disabled)
      el.focus();
      expect(el).toHaveFocus();
    });

    it("respects type and disabled props", () => {
      render(<Input type="email" disabled placeholder="email" />);
      const el = screen.getByPlaceholderText("email");
      expect(el).toHaveAttribute("type", "email");
      expect(el).toBeDisabled();
    });

    it("passes through arbitrary data-* attributes", () => {
      render(<Input data-foo="bar" aria-label="DataAttr" />);
      const el = screen.getByRole("textbox", { name: "DataAttr" });
      expect(el).toHaveAttribute("data-foo", "bar");
    });
  });

  describe("type & format validation", () => {
    it("forwards arbitrary aria/* props", () => {
      render(<Input aria-label="Custom name" />);
      expect(
        screen.getByRole("textbox", { name: /custom name/i }) // regex: case-insensitive
      ).toBeInTheDocument();
    });
  });

  describe("boundary validation", () => {
    it("merges className via twMerge (later overrides win)", () => {
      render(<Input className="h-[3rem] w-[20rem]" aria-label="Sized" />);
      const el = screen.getByRole("textbox", { name: "Sized" });
      expect(el).toHaveClass("h-[3rem]");
      expect(el).toHaveClass("w-[20rem]");

      // ensure default conflicting height was overridden
      expect(el).not.toHaveClass("h-[2.5rem]");
    });

    it("merges conflicting border classes with later props winning", () => {
      render(<Input className="border-[2px]" aria-label="B" />);
      const el = screen.getByRole("textbox", { name: "B" });
      expect(el).toHaveClass("border-[2px]");
      expect(el).not.toHaveClass("border-[1px]");
    });

    it("keeps non-conflicting default classes alongside custom ones", () => {
      render(<Input className="custom" aria-label="Decorated" />);
      const el = screen.getByRole("textbox", { name: "Decorated" });
      expect(el).toHaveClass("custom");
      // Prove defaults remained as well
      expect(el).toHaveClass("rounded-md");
    });
  });

  describe("strictness", () => {
    it("forwards object ref to the underlying <input>", () => {
      const ref = createRef<HTMLInputElement>();
      render(<Input ref={ref} aria-label="RefTarget" />);
      expect(ref.current).toBeInstanceOf(HTMLInputElement);
      ref.current?.focus();
      expect(ref.current).toHaveFocus();
    });

    it("supports a callback ref", () => {
      // Mutable variable typed to HTMLInputElement | null, and initially set to null
      let node: HTMLInputElement | null = null;
      const { unmount } = render(
        <Input
          aria-label="RefCb"
          ref={(n) => {
            node = n; // store referenced element (HTMLInputElement or null) to node
          }}
        />
      );
      // Validate that node actually is an HTMLInputElement after render
      expect(node).toBeInstanceOf(HTMLInputElement);

      unmount();
      expect(node).toBeNull();
    });
  });

  describe("interaction & accessibility", () => {
    it("forwards onChange and updates value on typing", async () => {
      const onChange = jest.fn();
      const user = userEvent.setup();
      render(
        <Input defaultValue="" aria-label="TypeHere" onChange={onChange} />
      );
      const el = screen.getByRole("textbox", {
        name: "TypeHere",
      }) as HTMLInputElement;
      await user.type(el, "hello");
      expect(onChange).toHaveBeenCalled();
      expect(el).toHaveValue("hello");
    });

    it("uses the correct role for non-text types (number => spinbutton)", () => {
      render(<Input type="number" aria-label="Qty" />);
      expect(
        screen.getByRole("spinbutton", { name: "Qty" })
      ).toBeInTheDocument();
    });

    it("uses the correct role for search type (search => searchbox)", () => {
      render(<Input type="search" aria-label="Find" />);
      expect(
        screen.getByRole("searchbox", { name: "Find" })
      ).toBeInTheDocument();
    });

    it("is disabled when disabled (styling applied by Tailwind)", () => {
      render(<Input disabled aria-label="Disabled" />);
      const el = screen.getByRole("textbox", { name: "Disabled" });
      expect(el).toBeDisabled();
    });
  });
});
