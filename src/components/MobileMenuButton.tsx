type MobileMenuButtonProps = {
  onClick: () => void;
  isOpen: boolean;
  className?: string;
};

const MobileMenuButton = ({
  onClick,
  isOpen,
  className,
}: MobileMenuButtonProps) => {
  return (
    <button
      onClick={onClick}
      className={`rounded-lg p-2 text-gray-600 hover:bg-gray-100 hover:text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 md:hidden ${className ?? ""}`}
      aria-label="Toggle menu"
    >
      <svg
        className="h-6 w-6"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
      >
        {isOpen ? (
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M6 18L18 6M6 6l12 12"
          />
        ) : (
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M4 6h16M4 12h16M4 18h16"
          />
        )}
      </svg>
    </button>
  );
};

export default MobileMenuButton;
