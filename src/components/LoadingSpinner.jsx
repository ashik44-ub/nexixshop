export default function LoadingSpinner({ full = false, size = "md" }) {
  const sizes = { sm: "h-5 w-5", md: "h-8 w-8", lg: "h-14 w-14" };
  const spinner = (
    <div
      className={`${sizes[size]} animate-spin rounded-full border-4 border-primary-100 border-t-primary-600`}
      role="status"
      aria-label="Loading"
    />
  );

  if (!full) return spinner;

  return (
    <div className="min-h-[50vh] w-full flex items-center justify-center">
      {spinner}
    </div>
  );
}
