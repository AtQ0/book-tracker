import { twMerge } from "tailwind-merge";
import Card, { CardProps } from "../ui/Card";

type HeadingLevel = "h1" | "h2" | "h3" | "h4";

type AuthCardOwnProps = {
  title?: string;
  titleLevel?: HeadingLevel;
  subtitle?: string;
};

export default function AuthCard({
  title,
  titleLevel = "h2",
  subtitle,
  className, // gotten from defaul HTMLElement (e.g. div)
  // Card props and defaults
  padding = "4xl",
  variant,
  showBackButton,
  children,
  ...rest
}: AuthCardOwnProps & CardProps) {
  // uppercase identifiers are treated as variable names
  const TitleTag = titleLevel;
  const titleId = title ? "authcard-title" : undefined; // used for a11y

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
