import React from "react";
import { render, screen } from "@testing-library/react";
import "@testing-library/jest-dom";
import AuthCard from "@/components/auth/AuthCard";

const getRegion = () => screen.getAllByRole("region")[0];
const getTitle = (name: RegExp) => screen.getByRole("heading", { name });
const queryAnyTitle = () => screen.queryByRole("heading");
const getSubtitle = (text: RegExp) => screen.getByText(text);
const querySubtitle = (text: RegExp) => screen.queryByText(text);

function setup(
  props: React.ComponentProps<typeof AuthCard> = {},
  childText = "Child content",
) {
  return render(
    <AuthCard {...props}>
      <div>{childText}</div>
    </AuthCard>,
  );
}

describe("<AuthCard />", () => {
  describe("happy path", () => {
    it("renders a region and its children", () => {
      setup(); // render AuthCard
      expect(screen.getAllByRole("region")).toHaveLength(1);
      expect(getRegion()).toBeInTheDocument(); // Validate <Card /> exists
      expect(screen.getByText(/child content/i)).toBeInTheDocument();
    });

    it("renders title and subtitle when provided", () => {
      setup({ title: "Welcome back", subtitle: "Sign in to continue" });
      expect(getTitle(/welcome back/i)).toBeInTheDocument();
      expect(getSubtitle(/sign in to continue/i)).toBeInTheDocument();
    });

    it("renders the title at the requested heading level", () => {
      setup({ title: "Welcome back", titleLevel: "h3" });
      expect(screen.getByRole("heading", { level: 3, name: /welcome back/i }));
    });
  });

  describe("prop forwarding", () => {
    it("forwards aria attributes to the region", () => {
      setup({ "aria-label": "Auth panel" });
      expect(getRegion()).toHaveAttribute("aria-label", "Auth panel");
    });

    it("merges className onto the card root", () => {
      setup({ className: "my-extra-class" });
      expect(getRegion()).toHaveClass("my-extra-class");
    });

    it("forwards standard HTML attributes to the region", () => {
      setup({ id: "probe" });
      expect(getRegion()).toHaveAttribute("id", "probe");
    });
  });

  describe("accessibility", () => {
    it("wires aria-labelledby to the title id when a title exists", () => {
      setup({ title: "Welcome back" });

      const region = getRegion();
      const heading = getTitle(/welcome back/i);

      const id = heading.getAttribute("id");
      expect(id).toBeTruthy();
      expect(region).toHaveAttribute("aria-labelledby", id!);
    });

    it("does not set aria-labelledby when there is no title", () => {
      setup({ subtitle: "Only subtitle" });

      const region = getRegion();
      expect(region).not.toHaveAttribute("aria-labelledby");
      expect(queryAnyTitle()).not.toBeInTheDocument();
      expect(getSubtitle(/only subtitle/i)).toBeInTheDocument();
    });

    it("still renders as a region even with no title/subtitle", () => {
      setup({ title: undefined, subtitle: undefined });

      const region = getRegion();
      expect(region).toBeInTheDocument();
      expect(region).not.toHaveAttribute("aria-labelledby");
      expect(queryAnyTitle()).not.toBeInTheDocument();
      expect(querySubtitle(/only subtitle/i)).not.toBeInTheDocument();
    });
  });

  describe("type safety", () => {
    it("is a valid React element with no required props", () => {
      const _ok: React.ReactElement = <AuthCard />;
      void _ok;
    });
  });
});
