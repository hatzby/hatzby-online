export function useCommentsActions({
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
  hp, // Add honeypot parameter
  isPostingAsAuthor
}) {
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!comment.trim()) return;
    
    // Import content filter dynamically to avoid issues
    const { filterUserInput } = await import('./contentFilter.js');
    
    // Filter and validate user input
    const filterResult = filterUserInput({
      comment: comment,
      name: name
    });
    
    if (!filterResult.valid) {
      // Only show error if there's an actual error message (not for empty comments)
      if (filterResult.error) {
        setError(filterResult.error);
      }
      return;
    }
    
    updateLoadingOperation('submitting', true);
    setError(null);
    
    try {
      const submitData = {
        text: filterResult.comment, // Use filtered comment
        name: filterResult.name, // Use filtered name
        hp: hp || '', // honeypot field
      };
      
      // Add tripcode data if using persistent tripcode
      if (persistentTripPassword) {
        submitData.tripPassword = persistentTripPassword;
      }
      
      // Build headers
      const headers = {
        'Content-Type': 'application/json',
      };
      
      // Add authorization header if posting as author
      if (isPostingAsAuthor && currentApiTarget === 'live' && liveAdminToken) {
        headers['Authorization'] = liveAdminToken;
      } else if (isPostingAsAuthor && currentApiTarget === 'local') {
        headers['Authorization'] = 'HADZIDAKIS_IS_GAY';
      }
      
      const response = await fetch(`${currentApiUrl}/?slug=test-page`, {
        method: 'POST',
        headers,
        body: JSON.stringify(submitData),
      });
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || `HTTP error! status: ${response.status}`);
      }
      
      // Clear form
      setComment('');
      setName('');
      // Don't clear tripPassword anymore - it's persistent
      
      // Reload comments to show the new comment
      await loadAllComments();
      
    } catch (err) {
      console.error('Submit error:', err);
      setError(`Failed to submit comment: ${err.message}`);
    } finally {
      updateLoadingOperation('submitting', false);
    }
  };

  const handleDelete = async (commentId) => {
    // Determine which admin token to use
    const tokenToUse = currentApiTarget === 'local' ? 'HADZIDAKIS_IS_GAY' : liveAdminToken;
    
    if (!tokenToUse) {
      if (currentApiTarget === 'live') {
        setError('Enter your live admin token to delete comments on Live API');
      } else {
        setError('Admin access required to delete comments');
      }
      return;
    }
    
    if (!confirm('Are you sure you want to delete this comment?')) {
      return;
    }
    
    updateLoadingOperation('deleting', commentId);
    setError(null);
    
    try {
      const response = await fetch(`${currentApiUrl}/?slug=test-page&id=${encodeURIComponent(commentId)}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': tokenToUse, // Send token directly, not as Bearer
        },
      });
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || `HTTP error! status: ${response.status}`);
      }
      
      // Reload comments to reflect the deletion
      await loadAllComments();
      
    } catch (err) {
      console.error('Delete error:', err);
      setError(`Failed to delete comment: ${err.message}`);
    } finally {
      updateLoadingOperation('deleting', null);
    }
  };

  const handleApiSwitch = async () => {
    const newTarget = currentApiTarget === 'live' ? 'local' : 'live';
    
    updateLoadingOperation('switching', true);
    setError(null);
    
    try {
      setCurrentApiTarget(newTarget);
      
      // Set cooldown period
      setSwitchCooldown(3000); // 3 seconds
      
      // Load comments from new API
      await loadAllComments();
      
    } catch (err) {
      console.error('API switch error:', err);
      setError(`Failed to switch to ${newTarget} API: ${err.message}`);
      // Revert on error
      setCurrentApiTarget(currentApiTarget);
    } finally {
      updateLoadingOperation('switching', false);
    }
  };

  const handleSearch = async () => {
    updateLoadingOperation('searching', true);
    setError(null);
    
    try {
      if (searchTerm.trim()) {
        await loadAllComments();
      } else {
        // If search term is empty, load all comments
        await loadAllComments();
      }
    } catch (err) {
      console.error('Search error:', err);
      setError(`Search failed: ${err.message}`);
    } finally {
      updateLoadingOperation('searching', false);
    }
  };

  const handleShowMore = () => {
    showMore();
  };

  return {
    handleSubmit,
    handleDelete,
    handleApiSwitch,
    handleSearch,
    handleShowMore
  };
}
