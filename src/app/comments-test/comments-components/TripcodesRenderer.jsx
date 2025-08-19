// Helper function to render tripcode display with backwards compatibility
export function renderTripcode(comment) {
  // Skip author role rendering here - handled in CommentsList component
  if (comment.role === "author") {
    return null; // Don't render duplicate author tag
  }

  // Handle tripcode display based on tripType (new system) or fallback (legacy)
  const tripType = comment.tripType || "legacy"; // Default to "legacy" for old comments without tripType
  
  if (comment.trip) {
    switch (tripType) {
      case "user":
        return (
          <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-900/50 dark:text-blue-200" title="User tripcode">
            <svg className="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-3a1 1 0 011-1h2.586l6.414-6.414a6 6 0 015.743-7.743z" />
            </svg>
            !{comment.trip}
          </span>
        );
      case "legacy":
        return (
          <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-700 dark:bg-gray-700/50 dark:text-gray-300" title="Legacy tripcode">
            <svg className="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            !{comment.trip} (legacy)
          </span>
        );
      case "author":
        // Author tripcodes are handled in CommentsList with the author badge
        return null;
      default:
        // Fallback for unknown tripType - still show trip if it exists
        return (
          <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-700 dark:bg-gray-700/50 dark:text-gray-300" title="Tripcode">
            <svg className="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-3a1 1 0 011-1h2.586l6.414-6.414a6 6 0 015.743-7.743z" />
            </svg>
            !{comment.trip}
          </span>
        );
    }
  } else {
    // No tripcode present
    if (tripType === "none" || !comment.hasOwnProperty('tripType')) {
      // New comments without tripcode or old comments without tripType field
      if (!comment.hasOwnProperty('tripType')) {
        // Old comment without tripType field - mark as LEGACY
        return (
          <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-amber-100 text-amber-800 dark:bg-amber-900/50 dark:text-amber-200">
            <svg className="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            LEGACY
          </span>
        );
      } else {
        // New comment without tripcode - mark as "No tripcode"
        return (
          <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-gray-50 text-gray-600 dark:bg-gray-800/50 dark:text-gray-400">
            <svg className="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728L5.636 5.636m12.728 12.728L5.636 5.636" />
            </svg>
            No tripcode
          </span>
        );
      }
    }
  }

  // Fallback - no display
  return null;
}
