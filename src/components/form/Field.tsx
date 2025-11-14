import React from "react";
import Label from "../ui/Label";

// Props that the child (e.g. <Input />) must support for accessibility injection
type FieldChildProps = {
  id?: string;
  required?: boolean;
  "aria-invalid"?: boolean;
  "aria-describedby"?: string;
  "aria-errormessage"?: string;
};

type FieldProps = {
  id: string;
  label: string;
  description?: string;
  hint?: string;
  error?: string;
  required?: boolean;
  children: React.ReactElement<FieldChildProps>; // Will typically have <Input /> as child
  className?: string;
};

// Helper for merging multiple aria-describedBy ID tokens
const mergeDescribedBy = (...parts: (string | undefined)[]) =>
  Array.from(
    new Set( //set removes duplicates
      parts
        .filter(Boolean) // remove undefined / empty strings
        .join(" ") // combine into one string
        .trim() // remove leading/trailing whitespace
        .split(/\s+/) // split into individual tokens
        .filter(Boolean) // remove any leftover empties
    )
  ).join(" ") || undefined; // rejoin index values into a string

export default function Field({
  id,
  label,
  description,
  hint,
  error,
  required,
  children,
  className,
}: FieldProps) {
  const hintText = description ?? hint;

  const hintId = hintText ? `${id}-hint` : undefined;
  const errorId = error ? `${id}-error` : undefined;

  // Merge child's existing aria-describedby tokens with hint and error IDs
  const describedBy = mergeDescribedBy(
    children.props["aria-describedby"],
    hintId,
    errorId
  );

  // Flag as invalid if error or child says so
  const ariaInvalid = error
    ? true
    : children.props["aria-invalid"]
    ? true
    : undefined;

  // Clone child input and inject merged accessibility + control props
  const child = React.cloneElement(children, {
    ...children.props,
    id,
    required: required ?? children.props.required,
    "aria-describedby": describedBy,
    "aria-errormessage": error ? errorId : undefined,
    "aria-invalid": ariaInvalid,
  });

  return (
    <div className={className ?? "flex flex-col"}>
      <Label htmlFor={id}>{label}</Label>

      {/* Cloned child */}
      {child}

      {/* Render hint text if provided by props*/}
      {hintText && (
        <p id={hintId} className="text-xs text-licorice/70">
          {hintText}
        </p>
      )}

      {/* Render error message if provided by props*/}
      {error && (
        <p
          id={errorId}
          className="text-xs text-red-600"
          role="alert"
          aria-live="polite"
          aria-atomic="true"
        >
          {error}
        </p>
      )}
    </div>
  );
}
