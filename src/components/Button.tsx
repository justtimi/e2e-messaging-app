import { type ButtonHTMLAttributes, type ReactNode } from "react";

type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: "primary" | "secondary";
  children: ReactNode;
};

const Button = ({
  variant = "primary",
  className = "",
  children,
  ...props
}: ButtonProps) => {
  const baseStyles =
    "inline-flex items-center justify-center rounded-lg px-3 py-2.5 text-sm font-medium transition focus:outline-none focus:ring-4 disabled:opacity-50 disabled:cursor-not-allowed";
  const variantStyles =
    variant === "secondary"
      ? "bg-gray-100 text-gray-900 hover:bg-gray-200 focus:ring-blue-100"
      : "bg-black text-white hover:bg-gray-900 focus:ring-blue-100 active:scale-[0.99]";

  return (
    <button
      className={[baseStyles, variantStyles, className].join(" ").trim()}
      {...props}
    >
      {children}
    </button>
  );
};

export default Button;
