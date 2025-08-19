import { useState } from "react";
import { validateUsername, validateComment } from "./contentFilter.js";

export default function CommentForm({ 
  comment, 
  setComment, 
  name, 
  setName, 
  loading, 
  loadingOperations,
  handleSubmit,
  tripPassword,
  setTripPassword,
  isUsingTrip,
  setIsUsingTrip,
  hp,
  setHp,
  persistentTripPassword,
  setPersistentTripPassword,
  liveAdminToken,
  isAdminFeaturesEnabled,
  isPostingAsAuthor,
  setIsPostingAsAuthor,
  currentApiTarget
}) {
  const [characterCounts, setCharacterCounts] = useState({
    comment: 0,
    name: 0
  });
  
  // Validation states
  const [validationErrors, setValidationErrors] = useState({
    comment: null,
    name: null
  });
  
  // Remove local hp state since it's now passed as props
  
  // Tripcode UI states
  const [showTripPassword, setShowTripPassword] = useState(false);
  const [showSetTripPassword, setShowSetTripPassword] = useState(false);
  const [confirmingRemove, setConfirmingRemove] = useState(false);

  const updateCharacterCount = (field, value) => {
    setCharacterCounts(prev => ({
      ...prev,
      [field]: value.length
    }));
  };

  const handleCommentChange = (e) => {
    const value = e.target.value;
    if (value.length <= 600) {
      setComment(value);
      updateCharacterCount('comment', value);
      
      // Validate comment in real-time
      const validation = validateComment(value);
      setValidationErrors(prev => ({
        ...prev,
        comment: validation.valid ? null : validation.error
      }));
    }
  };

  const handleNameChange = (e) => {
    const value = e.target.value;
    if (value.length <= 20) {
      setName(value);
      updateCharacterCount('name', value);
      
      // Validate name in real-time
      const validation = validateUsername(value);
      setValidationErrors(prev => ({
        ...prev,
        name: validation.valid ? null : validation.error
      }));
    }
  };

  const handleTripPasswordChange = (e) => {
    const value = e.target.value;
    if (value.length <= 20) {
      setTripPassword(value);
    }
  };

  const saveCurrentPassword = () => {
    if (tripPassword.trim()) {
      setPersistentTripPassword(tripPassword.trim());
      setTripPassword("");
      setShowSetTripPassword(false);
    }
  };

  const removeTripPassword = () => {
    setPersistentTripPassword("");
    setShowTripPassword(false);
    setConfirmingRemove(false);
  };

  // Check if user can post as author (has live admin token and is on live API)
  const canPostAsAuthor = currentApiTarget === 'live' && liveAdminToken && liveAdminToken.trim();

  return (
    <div className="mb-8 bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6 relative">
      {/* Loading overlay */}
      {(loading || loadingOperations.submitting) && (
        <div className="absolute inset-0 bg-white dark:bg-gray-800 bg-opacity-90 flex items-center justify-center rounded-lg z-10">
          <div className="flex flex-col items-center space-y-2">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
            <span className="text-sm text-gray-600 dark:text-gray-400">
              {loadingOperations.submitting ? 'Submitting comment...' : 'Loading...'}
            </span>
          </div>
        </div>
      )}

      <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">
        Leave a Comment
      </h3>
      
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Honeypot field (hidden) */}
        <input
          className="hidden"
          autoComplete="off"
          tabIndex="-1"
          aria-hidden="true"
          value={hp}
          onChange={(e) => setHp(e.target.value)}
          placeholder="Leave this empty"
        />

        {/* Name Field */}
        <div>
          <label htmlFor="name" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Name (optional)
          </label>
          <div className="relative">
            <input
              type="text"
              id="name"
              value={name}
              onChange={handleNameChange}
              placeholder="Enter your name"
              maxLength={20}
              autoComplete="off"
              autoCorrect="off"
              autoCapitalize="off"
              spellCheck="false"
              className={`w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-gray-100 pr-12 ${
                validationErrors.name 
                  ? 'border-red-500 dark:border-red-500' 
                  : 'border-gray-300 dark:border-gray-600'
              }`}
            />
            <span className={`absolute right-2 top-1/2 transform -translate-y-1/2 text-xs ${
              characterCounts.name > 18 ? 'text-red-500' : 'text-gray-400'
            }`}>
              {characterCounts.name}/20
            </span>
          </div>
          {validationErrors.name && (
            <p className="text-xs text-red-500 mt-1">{validationErrors.name}</p>
          )}
        </div>

        {/* Tripcode Section - Modern Design */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300">
                Identity Tripcode
              </h4>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                Optional persistent identity for your comments
              </p>
            </div>
            
            {/* Status indicator */}
            <div className="flex items-center gap-2">
              <div className={`w-2 h-2 rounded-full ${persistentTripPassword ? 'bg-green-500' : 'bg-gray-300'}`}></div>
              <span className="text-xs text-gray-500 dark:text-gray-400">
                {persistentTripPassword ? 'Active' : 'Not set'}
              </span>
            </div>
          </div>

          {/* Current tripcode display (if exists) */}
          {persistentTripPassword && (
            <div className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-blue-100 dark:bg-blue-900 rounded-full flex items-center justify-center">
                    <span className="text-blue-600 dark:text-blue-400 text-sm font-mono">!</span>
                  </div>
                  <div>
                    <div className="text-sm font-medium text-gray-900 dark:text-gray-100">
                      Your Tripcode
                    </div>
                    <div className="text-xs font-mono text-gray-600 dark:text-gray-400">
                      {showTripPassword ? persistentTripPassword : '•'.repeat(persistentTripPassword.length)}
                    </div>
                  </div>
                </div>
                
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setShowTripPassword(!showTripPassword)}
                    className="p-1.5 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
                    title={showTripPassword ? "Hide tripcode" : "Show tripcode"}
                  >
                    {showTripPassword ? (
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.878 9.878L3 3m6.878 6.878L21 21" />
                      </svg>
                    ) : (
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                      </svg>
                    )}
                  </button>
                  
                  <button
                    type="button"
                    onClick={() => setConfirmingRemove(true)}
                    className="p-1.5 text-red-400 hover:text-red-600 dark:hover:text-red-300 transition-colors"
                    title="Remove tripcode"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Set new tripcode (always visible but styled appropriately) */}
          <div className={`transition-all duration-200 ${persistentTripPassword ? 'opacity-75' : ''}`}>
            <div className="relative">
              <input
                type={showSetTripPassword ? "text" : "password"}
                id="setTripPassword"
                value={tripPassword}
                onChange={handleTripPasswordChange}
                placeholder={persistentTripPassword ? "Enter new tripcode to replace current" : "Create your unique tripcode"}
                maxLength={20}
                className="w-full pl-10 pr-20 py-2.5 border border-gray-300 dark:border-gray-600 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-500"
              />
              
              {/* Icon inside input */}
              <div className="absolute left-3 top-1/2 transform -translate-y-1/2">
                <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z" />
                </svg>
              </div>
              
              {/* Controls inside input */}
              <div className="absolute right-2 top-1/2 transform -translate-y-1/2 flex items-center gap-1">
                <button
                  type="button"
                  onClick={() => setShowSetTripPassword(!showSetTripPassword)}
                  className="p-1 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
                  title={showSetTripPassword ? "Hide password" : "Show password"}
                >
                  {showSetTripPassword ? (
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.878 9.878L3 3m6.878 6.878L21 21" />
                    </svg>
                  ) : (
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                    </svg>
                  )}
                </button>
                
                {tripPassword.trim() && (
                  <button
                    type="button"
                    onClick={saveCurrentPassword}
                    className="px-3 py-1 bg-blue-600 hover:bg-blue-700 text-white text-xs font-medium rounded transition-colors"
                    title="Set tripcode"
                  >
                    {persistentTripPassword ? 'Update' : 'Set'}
                  </button>
                )}
              </div>
            </div>
            
            {/* Helper text */}
            <p className="mt-1.5 text-xs text-gray-500 dark:text-gray-400">
              {persistentTripPassword 
                ? "Your comments will continue using your current tripcode unless you set a new one"
                : "Choose a unique password to create a persistent identity across comments"
              }
            </p>
          </div>

          {/* Elegant confirmation dialog */}
          {confirmingRemove && (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
              <div className="bg-white dark:bg-gray-800 rounded-xl shadow-2xl max-w-md w-full p-6 transform transition-all">
                <div className="flex items-center gap-4 mb-4">
                  <div className="w-12 h-12 bg-red-100 dark:bg-red-900/30 rounded-full flex items-center justify-center">
                    <svg className="w-6 h-6 text-red-600 dark:text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.732-.833-2.5 0L4.268 18.5c-.77.833.192 2.5 1.732 2.5z" />
                    </svg>
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                      Remove Tripcode
                    </h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      This action cannot be undone
                    </p>
                  </div>
                </div>
                
                <p className="text-gray-700 dark:text-gray-300 mb-6">
                  Are you sure you want to remove your tripcode? You'll lose your persistent identity and will need to create a new one.
                </p>
                
                <div className="flex gap-3 justify-end">
                  <button
                    type="button"
                    onClick={() => setConfirmingRemove(false)}
                    className="px-4 py-2 text-gray-700 dark:text-gray-300 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    onClick={removeTripPassword}
                    className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors"
                  >
                    Remove Tripcode
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Author Posting Section - only show if user has live admin token */}
        {canPostAsAuthor && (
          <div className="space-y-4 animate-fade-in">
            <div className="flex items-center justify-between">
              <div>
                <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  Post as Author
                </h4>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  Admin privilege - post with special author styling
                </p>
              </div>
              
              {/* Toggle switch */}
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setIsPostingAsAuthor(!isPostingAsAuthor)}
                  className={`relative inline-flex h-6 w-11 items-center rounded-full transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2 ${
                    isPostingAsAuthor ? 'bg-purple-600' : 'bg-gray-200 dark:bg-gray-700'
                  }`}
                  role="switch"
                  aria-checked={isPostingAsAuthor}
                >
                  <span
                    className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform duration-300 ${
                      isPostingAsAuthor ? 'translate-x-6' : 'translate-x-1'
                    }`}
                  />
                </button>
                <span className="text-xs text-gray-500 dark:text-gray-400">
                  {isPostingAsAuthor ? 'On' : 'Off'}
                </span>
              </div>
            </div>

            {/* Author posting info */}
            {isPostingAsAuthor && (
              <div className="bg-gradient-to-r from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20 border border-purple-200 dark:border-purple-800 rounded-lg p-4 animate-fade-in">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-purple-100 dark:bg-purple-900 rounded-full flex items-center justify-center">
                    <svg className="w-4 h-4 text-purple-600 dark:text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <div>
                    <div className="text-sm font-medium text-gray-900 dark:text-gray-100">
                      Posting as Author
                    </div>
                    <div className="text-xs text-gray-600 dark:text-gray-400">
                      Your comment will be highlighted with special author styling
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Comment Field */}
        <div>
          <label htmlFor="comment" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Comment *
          </label>
          <div className="relative">
            <textarea
              id="comment"
              value={comment}
              onChange={handleCommentChange}
              rows={4}
              placeholder="Write your comment here..."
              required
              maxLength={600}
              className={`w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-gray-100 resize-vertical min-h-[100px] ${
                validationErrors.comment 
                  ? 'border-red-500 dark:border-red-500' 
                  : 'border-gray-300 dark:border-gray-600'
              }`}
            />
            <span className={`absolute bottom-2 right-2 text-xs ${
              characterCounts.comment > 580 ? 'text-red-500' : 'text-gray-400'
            }`}>
              {characterCounts.comment}/600
            </span>
          </div>
          {validationErrors.comment && (
            <p className="text-xs text-red-500 mt-1">{validationErrors.comment}</p>
          )}
        </div>

        {/* Submit Button */}
        <button
          type="submit"
          disabled={
            loading || 
            loadingOperations.submitting || 
            !comment.trim() || 
            validationErrors.comment || 
            validationErrors.name
          }
          className="w-full bg-blue-600 text-white py-2 px-4 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200 enabled:hover:bg-blue-700"
        >
          {loadingOperations.submitting ? 'Submitting...' : 'Submit Comment'}
        </button>
      </form>
    </div>
  );
}
