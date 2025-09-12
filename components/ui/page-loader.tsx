"use client";

interface PageLoaderProps {
  message?: string;
  fullScreen?: boolean;
  minHeightClass?: string;
  className?: string;
}

export function PageLoader({
  message,
  fullScreen = false,
  minHeightClass,
  className,
}: PageLoaderProps) {
  const containerClasses = fullScreen
    ? "min-h-screen"
    : minHeightClass || "min-h-[400px]";

  return (
    <div
      className={`${containerClasses} flex items-center justify-center rounded-lg bg-slate-50 dark:bg-slate-900 ${
        className || ""
      }`}
    >
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
        {message ? (
          <p className="text-slate-600 dark:text-slate-400">{message}</p>
        ) : null}
      </div>
    </div>
  );
}

export default PageLoader;
