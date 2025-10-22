import React from "react";
import Label from "../ui/Label";

// Props that the child (e.g. <Input />) must support for accessibility injection
type FieldChildProps = {
  id?: string;
  "aria-invalid"?: boolean;
  "aria-describedby"?: string;
};

type FieldProps = {
  id: string;
  label: string;
  hint?: string;
  error?: string;
  children: React.ReactElement<FieldChildProps>; // Will typically have <Input /> as child
  className?: string;
};

export default function Field({
  id,
  label,
  hint,
  error,
  children,
  className,
}: FieldProps) {
  // Create aria-describedby string from hint and/or error IDs (for screen readers)
  const describedBy =
    [hint && `${id}-hint`, error && `${id}-error`].filter(Boolean).join(" ") ||
    undefined;

  return (
    <div className={className ?? "flex flex-col"}>
      <Label htmlFor={id}>{label}</Label>

      {/* Clone child (e.g. <Input />) and inject id and a11y props */}
      {React.cloneElement(children, {
        id,
        "aria-invalid": error ? true : undefined,
        "aria-describedby": describedBy,
      })}

      {/* Render hint text if provided by props*/}
      {hint && (
        <p id={`${id}-hint`} className="text-xs text-licorice/70">
          {hint}
        </p>
      )}

      {/* Render error message if provided by props*/}
      {error && (
        <p id={`${id}-error`} className="text-xs text-red-600" role="alert">
          {error}
        </p>
      )}
    </div>
  );
}
