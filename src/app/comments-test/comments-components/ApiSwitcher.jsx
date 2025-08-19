export default function ApiSwitcher({
  currentApiTarget,
  setCurrentApiTarget,
  loading,
  loadingOperations,
  handleApiSwitch,
  switchCooldown,
  isAdminFeaturesEnabled
}) {
  const timeRemaining = Math.ceil(switchCooldown / 1000);

  return (
    <div className="mb-6 bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
      <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">
        API Settings
      </h3>
      
      <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
        <div className="flex items-center gap-2">
          <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
            Current API:
          </span>
          <span className={`text-sm font-medium px-2 py-1 rounded ${
            currentApiTarget === 'live' 
              ? 'bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300' 
              : 'bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300'
          }`}>
            {currentApiTarget === 'live' ? 'Live API' : 'Local API'}
          </span>
        </div>

        {/* API Switch button - TEMPORARILY DISABLED for production testing */}
        {false && (
          <button
            onClick={handleApiSwitch}
            disabled={loading || loadingOperations.switching || switchCooldown > 0}
            className="px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed text-sm"
          >
            {loadingOperations.switching ? (
              <span className="flex items-center gap-2">
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                Switching...
              </span>
            ) : switchCooldown > 0 ? (
              `Switch API (${timeRemaining}s)`
            ) : (
              `Switch to ${currentApiTarget === 'live' ? 'Local' : 'Live'} API`
            )}
          </button>
        )}
      </div>

      {switchCooldown > 0 && (
        <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
          Please wait {timeRemaining} seconds before switching again.
        </p>
      )}
      
      {/* Show different info based on current API */}
      <div className="mt-4 text-xs text-gray-500 dark:text-gray-400">
        {currentApiTarget === 'live' ? (
          <p>Production Mode: Using Live API for testing. Local API switching temporarily disabled.</p>
        ) : (
          <p>Local API: Full admin features enabled. Make sure your local server is running.</p>
        )}
      </div>
    </div>
  );
}
