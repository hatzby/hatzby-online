// Utility functions for comments system
import React from 'react';

// API Configuration
export const LIVE_API_URL = 'https://comments.not05nirvana.workers.dev';
export const LOCAL_API_URL = 'http://127.0.0.1:8787';

// Default settings
export const DEFAULT_PAGE_SIZE = 20;
export const PAGINATION_OPTIONS = [10, 20, 50, 100];

// Legacy constants for backwards compatibility
export const DEFAULT_LOCAL_API = "http://127.0.0.1:8787";
export const LIVE_API_FROM_ENV = "https://comments.not05nirvana.workers.dev/";
export const LOCAL_ADMIN_TOKEN = "HADZIDAKIS_IS_GAY";

// Storage helper functions
export const getStoredApiTarget = () => {
  if (typeof window !== 'undefined') {
    return localStorage.getItem('COMMENTS_API_TARGET') || 'live';
  }
  return 'live';
};

export const setStoredApiTarget = (target) => {
  if (typeof window !== 'undefined') {
    localStorage.setItem('COMMENTS_API_TARGET', target);
  }
};

export const getStoredSettings = () => {
  if (typeof window !== 'undefined') {
    const stored = localStorage.getItem('COMMENTS_SETTINGS');
    if (stored) {
      try {
        return JSON.parse(stored);
      } catch (e) {
        console.error('Failed to parse stored settings:', e);
      }
    }
  }
  return null;
};

export const setStoredSettings = (settings) => {
  if (typeof window !== 'undefined') {
    localStorage.setItem('COMMENTS_SETTINGS', JSON.stringify(settings));
  }
};

export const getTripPasswords = () => {
  if (typeof window !== 'undefined') {
    const stored = localStorage.getItem('COMMENTS_TRIPCODE_PASSWORDS');
    if (stored) {
      try {
        return JSON.parse(stored);
      } catch (e) {
        console.error('Failed to parse stored tripcode passwords:', e);
      }
    }
  }
  return [];
};

export const setTripPasswords = (passwords) => {
  if (typeof window !== 'undefined') {
    localStorage.setItem('COMMENTS_TRIPCODE_PASSWORDS', JSON.stringify(passwords));
  }
};

// Legacy functions for backwards compatibility
export function readSavedTarget() {
  if (typeof window === "undefined") return "live";
  return localStorage.getItem("COMMENTS_API_TARGET") || "live";
}

export function readSavedOverride() {
  if (typeof window === "undefined") return null;
  return localStorage.getItem("COMMENTS_API_OVERRIDE");
}

export function readSavedTripPassword() {
  if (typeof window === "undefined") return "";
  return localStorage.getItem("COMMENTS_TRIPCODE_PASSWORD") || "";
}

export function saveTripPassword(value) {
  if (typeof window === "undefined") return;
  localStorage.setItem("COMMENTS_TRIPCODE_PASSWORD", value);
}

export function removeTripPassword() {
  if (typeof window === "undefined") return;
  localStorage.removeItem("COMMENTS_TRIPCODE_PASSWORD");
}

// Helper function to determine link type
export const getLinkType = (url) => {
  try {
    const urlObj = new URL(url);
    const hostname = urlObj.hostname.toLowerCase();
    
    // Check for specific domains
    if (hostname.includes('youtube.com') || hostname.includes('youtu.be')) {
      return 'youtube';
    } else if (hostname.includes('twitter.com') || hostname.includes('x.com')) {
      return 'twitter';
    } else if (hostname.includes('github.com')) {
      return 'github';
    } else if (hostname.includes('reddit.com')) {
      return 'reddit';
    } else if (hostname.includes('stackoverflow.com')) {
      return 'stackoverflow';
    } else if (hostname.includes('wikipedia.org')) {
      return 'wikipedia';
    }
    
    return 'external';
  } catch (e) {
    return 'external';
  }
};

// Function to parse and linkify text
export const parseLinks = (text) => {
  const urlRegex = /(https?:\/\/[^\s]+)/g;
  const parts = text.split(urlRegex);
  
  return parts.map((part, index) => {
    if (part.match(urlRegex)) {
      const linkType = getLinkType(part);
      return (
        <a 
          key={index} 
          href={part} 
          target="_blank" 
          rel="noopener noreferrer"
          className={`underline hover:no-underline ${
            linkType === 'youtube' ? 'text-red-600' :
            linkType === 'twitter' ? 'text-blue-500' :
            linkType === 'github' ? 'text-gray-800 dark:text-gray-200' :
            linkType === 'reddit' ? 'text-orange-600' :
            linkType === 'stackoverflow' ? 'text-orange-500' :
            linkType === 'wikipedia' ? 'text-blue-700' :
            'text-blue-600'
          }`}
          title={`Open ${part} in new tab`}
        >
          {part}
        </a>
      );
    }
    return part;
  });
};

// Helper function to convert URLs in text to clickable links (legacy)
export function parseLinksInText(text) {
  const urlRegex = /(https?:\/\/[^\s]+)/g;
  const parts = text.split(urlRegex);

  return parts.map((part, index) => {
    if (urlRegex.test(part)) {
      return (
        <a
          key={index}
          href={part}
          target="_blank"
          rel="noopener noreferrer"
          className="text-blue-600 hover:text-blue-800 underline break-all"
        >
          {part}
        </a>
      );
    }
    return part;
  });
}
