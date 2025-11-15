/**
 * @jest-environment jsdom
 */

import React from "react";
import { render } from "@testing-library/react";
import Container from "@/components/layout/Container";

// Helper that renders Container and its root DOM element with RTL utils
function renderContainer(ui: React.ReactElement) {
  const utils = render(ui);
  const el = utils.container.firstElementChild;
  if (!el) throw new Error("Container did not render");
  return { containerEl: el as HTMLElement, ...utils };
}

describe("Container", () => {
  describe("happy path", () => {
    it("renders a div with default width and children", () => {
      const { containerEl } = renderContainer(<Container>Child</Container>);

      expect(containerEl.tagName).toBe("DIV");
      expect(containerEl).toHaveClass("mx-auto", "w-full", "px-6", "max-w-5xl");
      expect(containerEl).toHaveTextContent("Child");
    });
  });

  describe("type and format validation", () => {
    it("merges custom className with base classes", () => {
      const { containerEl } = renderContainer(
        <Container className="custom">Child</Container>
      );

      expect(containerEl).toHaveClass("custom");
    });

    it("forwards arbitrary props", () => {
      const { containerEl } = renderContainer(
        <Container data-testid="wrapper" aria-label="label">
          Child
        </Container>
      );

      expect(containerEl).toHaveAttribute("data-testid", "wrapper");
      expect(containerEl).toHaveAttribute("aria-label", "label");
    });
  });

  describe("boundary validation", () => {
    it("applies wide width class", () => {
      const { containerEl } = renderContainer(<Container width="wide" />);
      expect(containerEl).toHaveClass("max-w-7xl");
    });

    it("applies narrow width class", () => {
      const { containerEl } = renderContainer(<Container width="narrow" />);
      expect(containerEl).toHaveClass("max-w-3xl");
    });
  });
});
