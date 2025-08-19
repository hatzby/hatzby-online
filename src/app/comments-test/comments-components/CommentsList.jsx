import { getLinkType, parseLinks } from "./utils";
import { renderTripcode } from "./TripcodesRenderer";

function CommentItem({ 
  comment, 
  index, 
  loading, 
  loadingOperations, 
  handleDelete, 
  adminToken, 
  isAdminFeaturesEnabled,
  currentApiTarget
}) {
  const isDeleting = loadingOperations.deleting === comment.id;
  const canDelete = (currentApiTarget === 'local') || (currentApiTarget === 'live' && adminToken && adminToken.trim());
  const isAuthorComment = comment.role === 'author'; // API returns role: "author" for author comments

  return (
    <div className={`rounded-lg shadow p-4 relative transition-all duration-300 ${
      isAuthorComment 
        ? 'bg-gradient-to-r from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20 border-2 border-purple-200 dark:border-purple-800' 
        : 'bg-white dark:bg-gray-800'
    }`}>
      {/* Loading overlay for individual comment */}
      {isDeleting && (
        <div className="absolute inset-0 bg-white dark:bg-gray-800 bg-opacity-90 flex items-center justify-center rounded-lg z-10">
          <div className="flex flex-col items-center space-y-2">
            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-red-500"></div>
            <span className="text-xs text-gray-600 dark:text-gray-400">Deleting...</span>
          </div>
        </div>
      )}

      <div className="flex justify-between items-start mb-2">
        <div className="flex items-center space-x-2">
          <span className={`font-semibold ${
            isAuthorComment 
              ? 'text-purple-700 dark:text-purple-300' 
              : 'text-gray-900 dark:text-gray-100'
          }`}>
            {comment.name || 'Anonymous'}
          </span>
          
          {/* Author badge */}
          {isAuthorComment && (
            <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-purple-100 text-purple-800 dark:bg-purple-900/50 dark:text-purple-200">
              <svg className="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              Author
            </span>
          )}
          
          {renderTripcode(comment)}
        </div>
        
        <div className="flex items-center space-x-2">
          <span className="text-sm text-gray-500 dark:text-gray-400">
            {new Date(comment.ts).toLocaleString()}
          </span>
          
          {/* Admin delete button */}
          {canDelete && (
            <button
              onClick={() => handleDelete(comment.id)}
              disabled={loading || isDeleting}
              className="text-red-600 hover:text-red-800 text-sm disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 hover:scale-110 active:scale-95"
              title="Delete comment (Admin)"
            >
              Delete
            </button>
          )}
        </div>
      </div>
      
      <div className="text-gray-800 dark:text-gray-200 whitespace-pre-wrap">
        {parseLinks(comment.text)}
      </div>
    </div>
  );
}

export default function CommentsList({ 
  comments, 
  loading, 
  loadingOperations, 
  handleDelete, 
  adminToken, 
  isAdminFeaturesEnabled,
  hasMoreToShow,
  handleShowMore,
  totalComments,
  currentApiTarget
}) {
  if (loading && comments.length === 0) {
    return (
      <div className="text-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto mb-4"></div>
        <p className="text-gray-600 dark:text-gray-400">Loading comments...</p>
      </div>
    );
  }

  if (comments.length === 0) {
    return (
      <div className="text-center py-8">
        <p className="text-gray-600 dark:text-gray-400">No comments yet. Be the first to comment!</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Comments count info */}
      <div className="text-sm text-gray-600 dark:text-gray-400 text-center">
        {totalComments > 0 && (
          <span>
            Showing {comments.length} of {totalComments} comments
          </span>
        )}
      </div>

      {/* Comments list */}
      <div className="space-y-4">
        {comments.map((comment, index) => (
          <div
            key={comment.id}
            className="animate-fade-in"
            style={{
              animationDelay: `${Math.min(index * 50, 500)}ms`,
              animationFillMode: 'both'
            }}
          >
            <CommentItem
              comment={comment}
              index={index}
              loading={loading}
              loadingOperations={loadingOperations}
              handleDelete={handleDelete}
              adminToken={adminToken}
              isAdminFeaturesEnabled={isAdminFeaturesEnabled}
              currentApiTarget={currentApiTarget}
            />
          </div>
        ))}
      </div>

      {/* Show More button */}
      {hasMoreToShow && (
        <div className="text-center pt-6 animate-fade-in">
          <button
            onClick={handleShowMore}
            className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-all duration-200 hover:scale-105 hover:shadow-lg active:scale-95"
          >
            Show {Math.min(10, totalComments - comments.length)} more comments
          </button>
        </div>
      )}
    </div>
  );
}
