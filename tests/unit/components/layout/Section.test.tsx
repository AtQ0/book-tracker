/**
 * @jest-environment jsdom
 */

import React from "react";
import { render } from "@testing-library/react";
import Section from "@/components/layout/Section";

// Helper that renders Section and its root DOM element with RTL utils
function renderSection(ui: React.ReactElement) {
  const utils = render(ui);
  const el = utils.container.firstElementChild;
  if (!el) throw new Error("Section did not render");
  return { sectionEl: el as HTMLElement, ...utils };
}

describe("Section", () => {
  describe("happy path", () => {
    it("renders a section with default spacing and children", () => {
      const { sectionEl } = renderSection(<Section>Child</Section>);

      expect(sectionEl.tagName).toBe("SECTION");
      expect(sectionEl).toHaveClass("py-8", "md:py-10");
      expect(sectionEl).toHaveTextContent("Child");
    });
  });

  describe("required fields", () => {
    it("has no required props, compile-time only", () => {
      const _ok: React.ReactElement = <Section>Child</Section>;
      void _ok;
    });
  });

  describe("type and format validation", () => {
    it("merges className with base classes", () => {
      const { sectionEl } = renderSection(
        <Section className="custom">Child</Section>
      );

      expect(sectionEl).toHaveClass("custom");
    });

    it("forwards arbitrary props to the underlying element", () => {
      const { sectionEl } = renderSection(
        <Section data-testid="sec" aria-label="label">
          Child
        </Section>
      );

      expect(sectionEl).toHaveAttribute("data-testid", "sec");
      expect(sectionEl).toHaveAttribute("aria-label", "label");
    });
  });

  describe("boundary validation", () => {
    it("applies dense variant spacing", () => {
      const { sectionEl } = renderSection(<Section variant="dense" />);

      expect(sectionEl).toHaveClass("py-6", "md:py-8");
    });

    it("applies loose variant spacing", () => {
      const { sectionEl } = renderSection(<Section variant="loose" />);

      expect(sectionEl).toHaveClass("py-10", "md:py-14");
    });

    it("applies bleed variant (empty spacing)", () => {
      const { sectionEl } = renderSection(<Section variant="bleed" />);

      // bleed uses an empty string so no padding classes allowed
      expect(sectionEl.className).not.toMatch(/py-/);
    });
  });
});
