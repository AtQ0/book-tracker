// tests\unit\components\books\BookCard.test.tsx
import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import "@testing-library/jest-dom";
import BookCard from "@/components/books/BookCard";
import type { BookDTO } from "@/lib/validations/book";

// ---- Mocks ----
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
  unoptimized?: boolean;
  placeholder?: string;
  blurDataURL?: string;
  sizes?: string;
};

jest.mock("next/image", () => {
  const NextImageMock = React.forwardRef<HTMLImageElement, NextImageProps>(
    (imgProps, ref) => {
      const { alt, ...rest } = imgProps;

      const domProps: Record<string, unknown> = { ...rest };
      delete domProps.fill;
      delete domProps.priority;
      delete domProps.quality;
      delete domProps.loader;
      delete domProps.onLoadingComplete;
      delete domProps.unoptimized;
      delete domProps.placeholder;
      delete domProps.blurDataURL;
      delete domProps.sizes;

      return (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          ref={ref}
          alt={alt}
          {...(domProps as React.ImgHTMLAttributes<HTMLImageElement>)}
        />
      );
    },
  );
  NextImageMock.displayName = "NextImageMock";
  return { __esModule: true, default: NextImageMock };
});

jest.mock("@/components/ui/Button", () => {
  const MockedButton = (props: React.ComponentProps<"button">) => (
    <button {...props} />
  );
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
  userRating: null,
});

function renderCard(book: Partial<BookDTO> = {}) {
  pushMock.mockClear();
  return render(
    <BookCard book={{ ...BASE_VALID_BOOK, ...book }} isAuthed={false} />,
  );
}

describe("<BookCard />", () => {
  describe("happy path", () => {
    it("renders title, genre, description, and image", () => {
      renderCard();
      expect(screen.getByText("Dune")).toBeInTheDocument();
      expect(screen.getByText("Sci-fi")).toBeInTheDocument();
      expect(screen.getByText(/Arrakis/i)).toBeInTheDocument();
      expect(screen.getByAltText("Dune")).toBeInTheDocument();
    });

    it("shows Sign in CTA text and button", () => {
      renderCard();
      expect(screen.getByText(/Sign in to add this book/i)).toBeInTheDocument();
      expect(
        screen.getByRole("button", { name: /sign in/i }),
      ).toBeInTheDocument();
    });
  });

  describe("required fields", () => {
    // @ts-expect-error missing required props
    expect(() => render(<BookCard />)).toThrow();
  });

  describe("type & format validation", () => {
    it("renders image-element with correct alt text when coverUrl is invalid", () => {
      renderCard({ coverUrl: "not-a-url" });
      expect(screen.getByAltText("Dune")).toBeInTheDocument();
    });
  });

  describe("boundary validation", () => {
    it("truncates long description", () => {
      const longDesc = "A".repeat(1000);
      renderCard({ description: longDesc });
      expect(screen.getByText(/A{10,}/)).toBeInTheDocument();
    });

    it("renders empty description gracefully", () => {
      renderCard({ description: "" });
      const desc = document.querySelector('p[class*="line-clamp-"]');
      expect(desc).toBeInTheDocument();
      expect(desc).toBeEmptyDOMElement();
    });
  });

  describe("strictness", () => {
    it("ignores extra props on book object", () => {
      const bookWithExtra = {
        ...BASE_VALID_BOOK,
        extra: "nope",
      } as unknown as BookDTO;
      render(<BookCard book={bookWithExtra} isAuthed={false} />);
      expect(screen.getByText("Dune")).toBeInTheDocument();
    });
  });

  describe("interaction", () => {
    it("clicking the Sign-in button navigates to /signin", () => {
      renderCard();
      fireEvent.click(screen.getByRole("button", { name: /sign in/i }));
      expect(pushMock).toHaveBeenCalledWith(
        `/signin?next=${encodeURIComponent("/books/book-1")}`,
      );
    });
  });

  describe("accessibility", () => {
    it("renders image with alt text", () => {
      renderCard();
      expect(screen.getByAltText("Dune")).toBeInTheDocument();
    });

    it("renders as an article element", () => {
      renderCard();
      expect(document.querySelector("article")).toBeTruthy();
    });
  });
});
