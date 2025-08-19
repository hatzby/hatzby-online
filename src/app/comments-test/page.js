'use client';

import { useCommentsData } from './comments-components/useCommentsData';
import { useCommentsActions } from './comments-components/useCommentsActions';
import CommentForm from './comments-components/CommentForm';
import SearchAndControls from './comments-components/SearchAndControls';
import CommentsList from './comments-components/CommentsList';
import TripcodeManagement from './comments-components/TripcodeManagement';
import ApiSwitcher from './comments-components/ApiSwitcher';
import LoadingOverlay from './comments-components/LoadingOverlay';
import EasterEgg from './components/EasterEgg';

export default function CommentsTest() {
  // Get all state and functions from custom hooks
  const commentsData = useCommentsData();
  const {
    comments,
    allComments,
    loading,
    error,
    setError,
    currentApiTarget,
    setCurrentApiTarget,
    displayLimit,
    setDisplayLimit,
    totalComments,
    hasMoreToShow,
    comment,
    setComment,
    name,
    setName,
    adminToken,
    setAdminToken,
    hp,
    setHp,
    liveAdminToken,
    setLiveAdminToken,
    isPostingAsAuthor,
    setIsPostingAsAuthor,
    tripPassword,
    setTripPassword,
    isUsingTrip,
    setIsUsingTrip,
    savedPasswords,
    setSavedPasswords,
    persistentTripPassword,
    setPersistentTripPassword,
    searchTerm,
    setSearchTerm,
    sortOrder,
    setSortOrder,
    isSettingsVisible,
    setIsSettingsVisible,
    switchCooldown,
    setSwitchCooldown,
    loadingOperations,
    updateLoadingOperation,
    isAdminFeaturesEnabled,
    currentApiUrl,
    loadAllComments,
    showMore,
    PAGINATION_OPTIONS
  } = commentsData;

  // Get action handlers
  const {
    handleSubmit,
    handleDelete,
    handleApiSwitch,
    handleSearch,
    handleShowMore
  } = useCommentsActions({
    currentApiUrl,
    isAdminFeaturesEnabled,
    adminToken,
    liveAdminToken,
    comment,
    setComment,
    name,
    setName,
    tripPassword,
    setTripPassword,
    isUsingTrip,
    setIsUsingTrip,
    persistentTripPassword,
    currentApiTarget,
    setCurrentApiTarget,
    setSwitchCooldown,
    searchTerm,
    loadAllComments,
    showMore,
    updateLoadingOperation,
    setError,
    hp,
    isPostingAsAuthor
  });

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100 mb-2">
            Comments Test
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Test the comments system with search, pagination, and tripcode features
          </p>
        </div>

        {/* Error Display */}
        {error && (
          <div className="mb-6 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-md p-4">
            <div className="flex">
              <div className="ml-3">
                <h3 className="text-sm font-medium text-red-800 dark:text-red-200">
                  Error
                </h3>
                <div className="mt-2 text-sm text-red-700 dark:text-red-300">
                  {error}
                </div>
                <div className="mt-3">
                  <button
                    type="button"
                    onClick={() => setError(null)}
                    className="bg-red-50 dark:bg-red-900/20 px-2 py-1 rounded-md text-sm font-medium text-red-800 dark:text-red-200 hover:bg-red-100 dark:hover:bg-red-900/40"
                  >
                    Dismiss
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* API Switcher */}
        <ApiSwitcher
          currentApiTarget={currentApiTarget}
          setCurrentApiTarget={setCurrentApiTarget}
          loading={loading}
          loadingOperations={loadingOperations}
          handleApiSwitch={handleApiSwitch}
          switchCooldown={switchCooldown}
          isAdminFeaturesEnabled={isAdminFeaturesEnabled}
        />

        {/* Admin Token Input */}
        <div className="mb-6 bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">
            Admin Access
          </h3>
          
          {isAdminFeaturesEnabled ? (
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                Local uses built-in token. Admin features automatically enabled.
              </p>
              <div className="text-sm text-gray-500 dark:text-gray-400 font-mono">
                Local Admin Token: HADZIDAKIS_IS_GAY
              </div>
            </div>
          ) : (
            <div>
              <label htmlFor="liveAdminToken" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Live Admin Token (for delete functionality)
              </label>
              <input
                type="password"
                id="liveAdminToken"
                value={liveAdminToken}
                onChange={(e) => setLiveAdminToken(e.target.value)}
                placeholder="Enter live admin token"
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-gray-100"
              />
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                Live admin token is not stored and must be entered manually for security.
              </p>
            </div>
          )}
        </div>

        {/* Comment Form */}
        <CommentForm
          comment={comment}
          setComment={setComment}
          name={name}
          setName={setName}
          loading={loading}
          loadingOperations={loadingOperations}
          handleSubmit={handleSubmit}
          tripPassword={tripPassword}
          setTripPassword={setTripPassword}
          isUsingTrip={isUsingTrip}
          setIsUsingTrip={setIsUsingTrip}
          hp={hp}
          setHp={setHp}
          persistentTripPassword={persistentTripPassword}
          setPersistentTripPassword={setPersistentTripPassword}
          liveAdminToken={liveAdminToken}
          isAdminFeaturesEnabled={isAdminFeaturesEnabled}
          isPostingAsAuthor={isPostingAsAuthor}
          setIsPostingAsAuthor={setIsPostingAsAuthor}
          currentApiTarget={currentApiTarget}
        />

        {/* Search and Controls */}
        <SearchAndControls
          searchTerm={searchTerm}
          setSearchTerm={setSearchTerm}
          sortOrder={sortOrder}
          setSortOrder={setSortOrder}
          loading={loading}
          loadingOperations={loadingOperations}
          handleSearch={handleSearch}
          currentApiTarget={currentApiTarget}
          isSettingsVisible={isSettingsVisible}
          setIsSettingsVisible={setIsSettingsVisible}
          loadAllComments={loadAllComments}
        />

        {/* Comments List */}
        <CommentsList
          comments={comments}
          loading={loading}
          loadingOperations={loadingOperations}
          handleDelete={handleDelete}
          adminToken={isAdminFeaturesEnabled ? 'HADZIDAKIS_IS_GAY' : liveAdminToken}
          isAdminFeaturesEnabled={isAdminFeaturesEnabled}
          hasMoreToShow={hasMoreToShow}
          handleShowMore={handleShowMore}
          totalComments={totalComments}
          currentApiTarget={currentApiTarget}
        />

        {/* Global Loading Overlay */}
        <LoadingOverlay
          isVisible={loadingOperations.switching}
          message="Switching API..."
        />

        {/* Secret Easter Egg */}
        <EasterEgg />
      </div>
    </div>
  );
}
