import { type InputHTMLAttributes } from "react";

type InputProps = InputHTMLAttributes<HTMLInputElement>;

const Input = ({ className = "", ...props }: InputProps) => {
  return (
    <input
      className={[
        "w-full rounded-lg border border-gray-200 bg-gray-50 px-3 py-2.5 text-sm text-gray-900 outline-none transition-all duration-200 ease-out focus:bg-white focus:border-blue-400 focus:ring-4 focus:ring-blue-100 disabled:cursor-not-allowed disabled:opacity-50 hover:bg-white hover:border-gray-300",
        className,
      ]
        .join(" ")
        .trim()}
      {...props}
    />
  );
};

export default Input;
