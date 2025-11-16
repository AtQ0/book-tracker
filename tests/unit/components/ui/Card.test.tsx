/**
 * @jest-environment jsdom
 */

import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import Card from "@/components/ui/Card";
import type { CardProps } from "@/components/ui/Card";

// shared mock for router.back
const backMock = jest.fn();

// Mock next/navigation for interception
jest.mock("next/navigation", () => ({
  __esModule: true,
  useRouter: () => ({
    back: backMock, //Intercept backButton with backMock
  }),
}));

// Helper that renders Card and its root DOM element with RTL utils
function renderCard(ui: React.ReactElement<CardProps> | React.ReactElement) {
  const utils = render(ui);
  // grab outmost container that card renders
  const el = utils.container.firstElementChild;
  if (!el) throw new Error("Card did not render an element");
  return { card: el as HTMLElement, ...utils };
}

describe("Card", () => {
  describe("happy path", () => {
    it("renders a div with default padding and varian and shows children", () => {
      const { card } = renderCard(<Card>Content</Card>);

      expect(card.tagName).toBe("DIV");
      expect(card).toHaveClass("rounded-xl", "select-none", "relative");
      expect(card).toHaveClass(
        "bg-baby-powder",
        "border-2",
        "border-alabaster"
      );
      expect(card).toHaveClass("p-5");
      expect(card).toHaveTextContent("Content");
    });

    it("supports polymorphic as prop for the root element", () => {
      const { card } = renderCard(<Card as="section">Content</Card>);

      expect(card.tagName).toBe("SECTION");
      expect(card).toHaveTextContent("Content");
    });
  });

  describe("required fields", () => {
    it("has no required props, compile-time only", () => {
      const _ok: React.ReactElement = <Card>Child</Card>;
      void _ok;
    });
  });

  describe("type and format validation", () => {
    it("merges custom className with base classes", () => {
      const { card } = renderCard(
        <Card className="custom-class">Content</Card>
      );

      expect(card).toHaveClass("rounded-xl", "select-none", "relative");
      expect(card).toHaveClass("custom-class");
    });

    it("fowards other additional props to the underlying element", () => {
      const { card } = renderCard(
        <Card as="article" data-testid="card" aria-label="Test card">
          Content
        </Card>
      );

      expect(card).toHaveAttribute("data-testid", "card");
      expect(card).toHaveAttribute("aria-label", "Test card");
    });
  });

  describe("boundary validation", () => {
    it("applies the correct padding class for a large padding value", () => {
      const { card } = renderCard(<Card padding="4xl">Content</Card>);

      expect(card).toHaveClass("p-16");
      expect(card).toHaveClass("max-xs:px-5", "max-xs:pb-10");
    });

    it("applies the correct classes for a non default variant", () => {
      const { card } = renderCard(<Card variant="outline">Content</Card>);

      expect(card).toHaveClass("bg-white", "border", "border-alabaster");
    });
  });

  describe("strictness", () => {
    it("falls back to default padding and variant when none are provided", () => {
      const { card } = renderCard(<Card>Content</Card>);

      expect(card).toHaveClass(
        "bg-baby-powder",
        "border-2",
        "border-alabaster"
      );
      expect(card).toHaveClass("p-5");
    });
  });

  describe("interaction", () => {
    it("renders the back button and calls router.back when clicked", async () => {
      const user = userEvent.setup();
      backMock.mockClear();

      render(<Card showBackButton>Content</Card>);

      const button = screen.getByRole("button", { name: /back/i });
      expect(button).toBeInTheDocument();

      await user.click(button);

      expect(backMock).toHaveBeenCalledTimes(1);
    });
  });

  describe("accessibility", () => {
    it("back button is discoverable by its accessible name", () => {
      render(<Card showBackButton>Content</Card>);

      const button = screen.getByRole("button", { name: /back/i });
      expect(button).toBeInTheDocument();
    });
  });
});
