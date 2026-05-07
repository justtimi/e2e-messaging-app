import { type InputHTMLAttributes } from "react";

type InputProps = InputHTMLAttributes<HTMLInputElement>;

const Input = ({ className = "", ...props }: InputProps) => {
  return (
    <input
      className={[
        "w-full rounded-lg border border-gray-200 bg-gray-50 px-3 py-2.5 text-sm text-gray-900 outline-none transition-all duration-200 ease-out hover:bg-white hover:border-gray-300 focus:bg-white focus:border-blue-400 focus:ring-4 focus:ring-blue-100 disabled:cursor-not-allowed disabled:opacity-50 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-100 dark:placeholder:text-gray-500 dark:hover:border-gray-600 dark:hover:bg-gray-950 dark:focus:bg-gray-950 dark:focus:border-gray-500 dark:focus:ring-gray-800",
        className,
      ]
        .join(" ")
        .trim()}
      {...props}
    />
  );
};

export default Input;
