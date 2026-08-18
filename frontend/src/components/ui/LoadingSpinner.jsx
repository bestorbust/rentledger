function LoadingSpinner({ size = "md" }) {
  const sizes = {
    sm: "h-4 w-4",
    md: "h-6 w-6",
    lg: "h-8 w-8",
  };

  return (
    <div
      className={`animate-spin rounded-full border-2 border-neutral-200 border-t-[#c85f47] ${sizes[size]}`}
    />
  );
}

export default LoadingSpinner;