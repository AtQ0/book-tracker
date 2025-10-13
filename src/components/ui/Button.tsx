import clsx from "clsx";
import { twMerge } from "tailwind-merge";

interface ButtonProps {
  label: string;
  className?: string;
  onClick?: () => void;
  onSubmit?: (event: React.FormEvent<HTMLFormElement>) => void;
}

export default function Button({ label, className, onClick }: ButtonProps) {
  return (
    <button
      onClick={onClick}
      className={twMerge(
        clsx(
          "bg-golden-brown text-white px-5 py-3 rounded-md cursor-pointer text-xl",
          className
        )
      )}
    >
      {label}
    </button>
  );
}
