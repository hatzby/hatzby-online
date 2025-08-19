import { useState, useEffect, useCallback, useMemo } from 'react';
import { 
  getStoredApiTarget, 
  setStoredApiTarget, 
  getStoredSettings, 
  setStoredSettings,
  getTripPasswords,
  setTripPasswords,
  LIVE_API_URL,
  LOCAL_API_URL,
  DEFAULT_PAGE_SIZE,
  PAGINATION_OPTIONS
} from './utils';

export function useCommentsData() {
  // Core state
  const [rawComments, setRawComments] = useState([]); // Store unsorted comments
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  
  // API and display state
  // TEMPORARILY FORCED TO 'live' FOR PRODUCTION TESTING
  const [currentApiTarget, setCurrentApiTarget] = useState('live'); // Force live API
  const [displayLimit, setDisplayLimit] = useState(20); // Default to showing 20 comments initially
  const [totalComments, setTotalComments] = useState(0);
  
  // Form state
  const [comment, setComment] = useState('');
  const [name, setName] = useState('');
  const [adminToken, setAdminToken] = useState('');
  const [hp, setHp] = useState(''); // honeypot field
  const [liveAdminToken, setLiveAdminToken] = useState(''); // separate token for live API
  
  // Author posting state (for live admin token holders)
  const [isPostingAsAuthor, setIsPostingAsAuthor] = useState(false);
  
  // Tripcode state
  const [tripPassword, setTripPassword] = useState('');
  const [isUsingTrip, setIsUsingTrip] = useState(false);
  const [savedPasswords, setSavedPasswords] = useState(() => getTripPasswords());
  const [persistentTripPassword, setPersistentTripPassword] = useState(() => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('COMMENTS_TRIPCODE_PASSWORD') || '';
    }
    return '';
  });
  
  // Search and sort state
  const [searchTerm, setSearchTerm] = useState('');
  const [sortOrder, setSortOrder] = useState('newest');
  
  // UI state
  const [isSettingsVisible, setIsSettingsVisible] = useState(false);
  const [switchCooldown, setSwitchCooldown] = useState(0);
  
  // Loading operations tracking
  const [loadingOperations, setLoadingOperations] = useState({
    initial: false,
    loadingMore: false,
    searching: false,
    submitting: false,
    deleting: null,
    switching: false
  });

  // Client-side sorted comments with display limit
  const comments = useMemo(() => {
    const sorted = [...rawComments].sort((a, b) => {
      const dateA = new Date(a.ts);
      const dateB = new Date(b.ts);
      return sortOrder === 'newest' ? dateB - dateA : dateA - dateB;
    });
    return sorted;
  }, [rawComments, sortOrder]);

  // Comments to display (limited by displayLimit)
  const displayedComments = useMemo(() => {
    return comments.slice(0, displayLimit);
  }, [comments, displayLimit]);

  // Check if there are more comments to show
  const hasMoreToShow = comments.length > displayLimit;

  // Derived state
  const isAdminFeaturesEnabled = currentApiTarget === 'local';
  const currentApiUrl = currentApiTarget === 'live' ? LIVE_API_URL : LOCAL_API_URL;

  // Update loading operation state
  const updateLoadingOperation = useCallback((operation, value) => {
    setLoadingOperations(prev => ({
      ...prev,
      [operation]: value
    }));
  }, []);

  // Check if any loading operation is active
  const hasActiveLoading = Object.values(loadingOperations).some(op => 
    op === true || (typeof op === 'string' && op !== null)
  );

  // Update main loading state based on operations
  useEffect(() => {
    setLoading(hasActiveLoading);
  }, [hasActiveLoading]);

  // Save settings to localStorage
  useEffect(() => {
    setStoredSettings({ displayLimit, sortOrder });
  }, [displayLimit, sortOrder]);

  // Save API target to localStorage
  useEffect(() => {
    setStoredApiTarget(currentApiTarget);
  }, [currentApiTarget]);

  // Save tripcode passwords to localStorage
  useEffect(() => {
    setTripPasswords(savedPasswords);
  }, [savedPasswords]);

  // Save persistent tripcode password to localStorage
  useEffect(() => {
    if (typeof window !== 'undefined') {
      if (persistentTripPassword) {
        localStorage.setItem('COMMENTS_TRIPCODE_PASSWORD', persistentTripPassword);
      } else {
        localStorage.removeItem('COMMENTS_TRIPCODE_PASSWORD');
      }
    }
  }, [persistentTripPassword]);

  // API functions
  const loadFromAPI = useCallback(async (endpoint, options = {}) => {
    const url = `${currentApiUrl}${endpoint}`;
    
    try {
      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
        ...options
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      return await response.json();
    } catch (err) {
      console.error('API Error:', err);
      
      // Check if it's a CORS or network error
      if (err.message.includes('Failed to fetch') || err.message.includes('CORS')) {
        if (currentApiTarget === 'live') {
          throw new Error(`Failed to connect to Live API (CORS/Network error). Try switching to Local API: ${err.message}`);
        } else {
          throw new Error(`Failed to connect to Local API. Make sure the local server is running: ${err.message}`);
        }
      }
      
      throw new Error(`Failed to load from ${currentApiTarget} API: ${err.message}`);
    }
  }, [currentApiUrl, currentApiTarget]);



  const loadAllComments = useCallback(async () => {
    updateLoadingOperation('initial', true);
    setError(null);
    
    try {
      const searchParam = searchTerm ? `&search=${encodeURIComponent(searchTerm)}` : '';
      const sortParam = `&sort=${sortOrder}`;
      const endpoint = `/?slug=test-page&limit=1000&offset=0${searchParam}${sortParam}`;
      
      const data = await loadFromAPI(endpoint);
      const allComments = data.comments || data || [];
      setRawComments(allComments);
      setTotalComments(allComments.length);
      
    } catch (err) {
      setError(err.message);
      setRawComments([]);
    } finally {
      updateLoadingOperation('initial', false);
    }
  }, [searchTerm, sortOrder, loadFromAPI, updateLoadingOperation]);

  // Function to show more comments
  const showMore = useCallback((increment = 10) => {
    setDisplayLimit(prev => Math.min(prev + increment, comments.length));
  }, [comments.length]);

  // Remove the old load and loadMore functions since we don't need them

  // Initial load - load all comments like the original did
  useEffect(() => {
    loadAllComments(); // Load all comments initially, like the original
  }, [currentApiTarget, sortOrder]); // Reload when API or sort changes

  // Cooldown timer for API switching
  useEffect(() => {
    if (switchCooldown > 0) {
      const timer = setTimeout(() => {
        setSwitchCooldown(prev => Math.max(0, prev - 100));
      }, 100);
      return () => clearTimeout(timer);
    }
  }, [switchCooldown]);

  return {
    // State
    comments: displayedComments, // Show only the limited comments
    allComments: comments, // All comments for reference
    setComments: setRawComments, // Allow external updates to raw comments
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
    
    // Derived state
    isAdminFeaturesEnabled,
    currentApiUrl,
    
    // Functions
    loadAllComments,
    showMore,
    loadFromAPI,
    
    // Constants
    PAGINATION_OPTIONS
  };
}
