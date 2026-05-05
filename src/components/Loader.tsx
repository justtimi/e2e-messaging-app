const Loader = () => {
  return (
    <div className="flex items-center justify-center gap-2 py-6 text-gray-500">
      <div className="h-4 w-4 animate-spin rounded-full border-2 border-gray-200 border-t-blue-600" />
      <span className="text-sm">Loading...</span>
    </div>
  );
};

export default Loader;
