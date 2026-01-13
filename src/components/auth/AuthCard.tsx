import { twMerge } from "tailwind-merge";
import Card, { CardProps } from "../ui/Card";
import React from "react";

type HeadingLevel = "h1" | "h2" | "h3" | "h4";

type AuthCardOwnProps = {
  title?: string;
  titleLevel?: HeadingLevel;
  subtitle?: string;
};

type AuthCardProps = AuthCardOwnProps & CardProps<"div">;

export default function AuthCard({
  title,
  titleLevel = "h2",
  subtitle,
  // Card props and defaults
  className, // gotten from defaul HTMLElement (e.g. div)
  padding = "4xl",
  variant,
  showBackButton,
  children,
  ...rest
}: AuthCardProps) {
  // Park titleLevel value in an uppercase variable as JSX reads them as variables
  const TitleTag = titleLevel;

  // create unique id for TitleTag in case u have >= 1 AuthCard on same page
  const reactId = React.useId();
  const titleId = title ? `authcard-title-${reactId}` : undefined; // used for a11y

  return (
    <Card
      padding={padding}
      variant={variant}
      showBackButton={showBackButton}
      className={twMerge(
        "flex flex-col justify-center items-center",
        className
      )}
      aria-labelledby={titleId}
      role="region"
      {...rest}
    >
      {(title || subtitle) && (
        <header className="mb-8">
          {title && (
            <TitleTag id={titleId} className="text-center mb-3">
              {title}
            </TitleTag>
          )}
          {subtitle && (
            <p className="text-center whitespace-pre-line">{subtitle}</p>
          )}
        </header>
      )}
      {children}
    </Card>
  );
}
