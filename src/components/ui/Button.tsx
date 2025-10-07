import clsx from "clsx";

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
      className={clsx(
        "bg-golden-brown px-5 py-3 rounded-md cursor-pointer text-xl",
        className
      )}
    >
      {label}
    </button>
  );
}
