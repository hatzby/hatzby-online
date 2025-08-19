export default function LoadingOverlay({ isVisible, message = "Loading..." }) {
  if (!isVisible) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-30 backdrop-blur-sm flex items-center justify-center z-50">
      <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-xl">
        <div className="flex flex-col items-center space-y-3">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
          <span className="text-gray-900 dark:text-gray-100 font-medium">
            {message}
          </span>
        </div>
      </div>
    </div>
  );
}
