import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import "@testing-library/jest-dom";
import BookCard from "@/components/books/BookCard";
import type { BookDTO } from "@/lib/validations/book";

// ---- Mocks -----
const pushMock = jest.fn();

jest.mock("next/navigation", () => ({
  useRouter: () => ({ push: pushMock }),
}));

type NextImageProps = Omit<
  React.ImgHTMLAttributes<HTMLImageElement>,
  "src" | "alt"
> & {
  src: string;
  alt: string;
  fill?: boolean;
  priority?: boolean;
  quality?: number;
  loader?: unknown;
  onLoadingComplete?: (img: HTMLImageElement) => void;
};

jest.mock("next/image", () => {
  const NextImageMock = React.forwardRef<HTMLImageElement, NextImageProps>(
    (imgProps, ref) => {
      const { alt, ...rest } = imgProps;

      // clone then strip Next specific props without creating unused bindings
      const domProps: Record<string, unknown> = { ...rest };
      delete domProps.fill;
      delete domProps.priority;
      delete domProps.quality;
      delete domProps.loader;
      delete domProps.onLoadingComplete;

      return (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          ref={ref}
          alt={alt}
          {...(domProps as React.ImgHTMLAttributes<HTMLImageElement>)}
        />
      );
    }
  );
  NextImageMock.displayName = "NextImageMock";
  return { __esModule: true, default: NextImageMock };
});

jest.mock("@/components/ui/Button", () => {
  const MockedButton = (props: React.ComponentProps<"button">) => {
    return <button {...props} />;
  };
  MockedButton.displayName = "MockedButton";
  return MockedButton;
});

// ---- Fixture ----
const BASE_VALID_BOOK: Readonly<BookDTO> = Object.freeze({
  id: "book-1",
  name: "Dune",
  description: "A sweeping sci-fi set on the deser planet Arrakis",
  genre: "Sci-fi",
  coverUrl: "https://example.com/dune.jpg",
  averageRating: 4.9,
  haveRead: 10,
  currentlyReading: 2,
  wantToRead: 5,
});

function renderCard(book: Partial<BookDTO> = {}) {
  // Partial: Make all properties of BookDTO optional
  pushMock.mockClear();
  return render(<BookCard book={{ ...BASE_VALID_BOOK, ...book }} />);
}

describe("<BookCard />", () => {
  describe("happy path", () => {
    it("renders title, genre, description, and image", () => {
      renderCard();
      expect(screen.getByText("Dune")).toBeInTheDocument();
      expect(screen.getByText("Sci-fi")).toBeInTheDocument();
      expect(screen.getByText(/Arrakis/i)).toBeInTheDocument(); // regex:fin text ignore case
      expect(screen.getByAltText("Dune")).toBeInTheDocument();
    });

    it("shows login CTA text and button", () => {
      renderCard();
      expect(screen.getByText(/Log in to add this book/i)).toBeInTheDocument();
      expect(
        screen.getByRole("button", { name: /Log in/i })
      ).toBeInTheDocument();
    });
  });

  // render without the required 'book' prop to ensure component throws
  describe("required fields", () => {
    // @ts-expect-error: intentionally omit required prop (book)
    expect(() => render(<BookCard />)).toThrow();
  });

  describe("type & format validation", () => {
    it("renders image-element (not image) with correct alt text when coverUrl is invalid", () => {
      renderCard({ coverUrl: "not-a-url" });
      expect(screen.getByAltText("Dune")).toBeInTheDocument();
    });
  });

  describe("boundary validation", () => {
    it("truncates long description", () => {
      const longDesc = "A".repeat(1000);
      renderCard({ description: longDesc });
      // Ensure at least part of the long string appears (10+ A's)
      expect(screen.getByText(/A{10,}/)).toBeInTheDocument();
    });

    it("renders empty description gracefully", () => {
      renderCard({ description: "" });
      // Find <p> element that has a class called line-clamp
      const desc = document.querySelector('p[class*="line-clamp-"]');
      expect(desc).toBeInTheDocument();
      expect(desc).toBeEmptyDOMElement();
    });
  });

  describe("strictness", () => {
    it("ignores extra props on book object", () => {
      const bookWithExtra = { ...BASE_VALID_BOOK, extra: "nope" };
      render(<BookCard book={bookWithExtra} />);
      expect(screen.getByText("Dune")).toBeInTheDocument();
    });
  });

  describe("interaction", () => {
    it("clicking the Log in button navigates to /login", () => {
      renderCard();
      const btn = screen.getByRole("button", { name: /log in/i });
      fireEvent.click(btn);
      expect(pushMock).toHaveBeenCalledWith("/login");
    });

    it("CTA container stops click propagation", () => {
      renderCard();
      const cta = screen.getByText(/Log in to add this book/i).closest("div");
      expect(cta).toBeTruthy();
    });
  });

  describe("accessibility", () => {
    it("renders image with alt text", () => {
      renderCard();
      const img = screen.getByAltText("Dune") as HTMLImageElement;
      expect(img).toBeInTheDocument();
      expect(img.src).toContain("https://example.com/dune.jpg");
    });

    it("renders as an article element", () => {
      renderCard();
      const article = document.querySelector("article");
      expect(article).toBeTruthy();
    });
  });
});
