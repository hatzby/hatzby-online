import { useState } from "react";

export default function SearchAndControls({
  searchTerm,
  setSearchTerm,
  sortOrder,
  setSortOrder,
  loading,
  loadingOperations,
  handleSearch,
  currentApiTarget,
  isSettingsVisible,
  setIsSettingsVisible,
  loadAllComments
}) {
  const handleSearchSubmit = (e) => {
    e.preventDefault();
    handleSearch();
  };

  const handleSortChange = (newSortOrder) => {
    setSortOrder(newSortOrder);
    // Client-side sorting will handle the rest automatically via useMemo
  };

  return (
    <div className="mb-6 bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
      {/* Search Form */}
      <form onSubmit={handleSearchSubmit} className="mb-4">
        <div className="flex flex-col sm:flex-row gap-2">
          <div className="flex-1">
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search comments..."
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-gray-100"
            />
          </div>
          <button
            type="submit"
            disabled={loading || loadingOperations.searching}
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed whitespace-nowrap transition-all duration-200 hover:scale-105 active:scale-95"
          >
            {loadingOperations.searching ? 'Searching...' : 'Search'}
          </button>
        </div>
      </form>

      {/* Controls */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        {/* Sort Controls */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2 sm:gap-4">
          <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
            Sort:
          </label>
          <div className="flex gap-2">
            <button
              onClick={() => handleSortChange('newest')}
              disabled={loading}
              className={`px-3 py-1 rounded-md text-sm transition-all duration-200 hover:scale-105 active:scale-95 ${
                sortOrder === 'newest'
                  ? 'bg-blue-600 text-white shadow-md'
                  : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600'
              } disabled:opacity-50`}
            >
              Newest First
            </button>
            <button
              onClick={() => handleSortChange('oldest')}
              disabled={loading}
              className={`px-3 py-1 rounded-md text-sm transition-all duration-200 hover:scale-105 active:scale-95 ${
                sortOrder === 'oldest'
                  ? 'bg-blue-600 text-white shadow-md'
                  : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600'
              } disabled:opacity-50`}
            >
              Oldest First
            </button>
          </div>
        </div>

        {/* Settings Toggle */}
        <button
          onClick={() => setIsSettingsVisible(!isSettingsVisible)}
          className="px-3 py-1 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-md hover:bg-gray-300 dark:hover:bg-gray-600 text-sm transition-all duration-200 hover:scale-105 active:scale-95"
        >
          {isSettingsVisible ? 'Hide Settings' : 'Show Settings'}
        </button>
      </div>

      {/* Settings Panel */}
      {isSettingsVisible && (
        <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700 animate-fade-in">
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
            {/* Current API Display */}
            <div className="flex items-center gap-2">
              <span className="text-sm text-gray-600 dark:text-gray-400">
                API: 
              </span>
              <span className={`text-sm font-medium ${
                currentApiTarget === 'live' ? 'text-green-600' : 'text-blue-600'
              }`}>
                {currentApiTarget === 'live' ? 'Live' : 'Local'}
              </span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
