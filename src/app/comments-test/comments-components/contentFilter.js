// Content filtering utilities for comments system

// List of prohibited words/slurs (you can expand this list as needed)
const PROHIBITED_WORDS = [
  // Hard slurs and hate speech (add more as needed)
  'nigger', 'nigga', 'faggot', 'retard', 'spic', 'chink', 'gook', 'kike', 'wetback',
  // Add more prohibited terms here
  // Note: This is a basic list - consider using a more comprehensive filtering service for production
];

// Zero-width and invisible characters that shouldn't be in usernames
const INVISIBLE_CHARS = [
  '\u200B', // Zero Width Space
  '\u200C', // Zero Width Non-Joiner
  '\u200D', // Zero Width Joiner
  '\u2060', // Word Joiner
  '\uFEFF', // Zero Width No-Break Space
  '\u00AD', // Soft Hyphen
  '\u034F', // Combining Grapheme Joiner
  '\u180E', // Mongolian Vowel Separator
];

// Leetspeak and common character substitutions
const LEETSPEAK_MAP = {
  '4': 'a', '@': 'a', '3': 'e', '1': 'i', '!': 'i', '0': 'o', '5': 's', '$': 's', '7': 't', '\\+': 't'
};

/**
 * Clean text by removing invisible characters and normalizing
 */
export function cleanText(text) {
  if (!text || typeof text !== 'string') return '';
  
  // Remove invisible characters
  let cleaned = text;
  INVISIBLE_CHARS.forEach(char => {
    cleaned = cleaned.replace(new RegExp(char, 'g'), '');
  });
  
  // Normalize unicode and trim
  return cleaned.normalize('NFKC').trim();
}

/**
 * Convert leetspeak to normal characters for filtering
 */
function normalizeLeetspeak(text) {
  let normalized = text.toLowerCase();
  Object.entries(LEETSPEAK_MAP).forEach(([leet, normal]) => {
    const escapedLeet = leet.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'); // Escape special regex chars
    normalized = normalized.replace(new RegExp(escapedLeet, 'g'), normal);
  });
  return normalized;
}

/**
 * Check if text contains prohibited content
 */
export function containsProhibitedContent(text) {
  if (!text || typeof text !== 'string') return false;
  
  const cleanedText = cleanText(text);
  const normalizedText = normalizeLeetspeak(cleanedText);
  
  // Check against prohibited words
  for (const word of PROHIBITED_WORDS) {
    if (normalizedText.includes(word.toLowerCase())) {
      return true;
    }
  }
  
  return false;
}

/**
 * Validate username
 */
export function validateUsername(username) {
  if (!username) return { valid: true }; // Empty username is okay (will show as Anonymous)
  
  const cleaned = cleanText(username);
  
  // Check if username became empty after cleaning invisible chars
  if (cleaned.length === 0 && username.length > 0) {
    return {
      valid: false,
      error: 'Hey! - This is still my website, please be considerate. :]'
    };
  }
  
  // Check for prohibited content
  if (containsProhibitedContent(cleaned)) {
    return {
      valid: false,
      error: 'Hey! - This is still my website, please be considerate. :]'
    };
  }
  
  // Check length (after cleaning)
  if (cleaned.length > 20) {
    return {
      valid: false,
      error: 'Username too long (max 20 characters)'
    };
  }
  
  return {
    valid: true,
    cleaned: cleaned
  };
}

/**
 * Validate comment content
 */
export function validateComment(comment) {
  if (!comment || typeof comment !== 'string') {
    return { valid: true }; // Don't show error for empty comments to avoid OCD triggers
  }
  
  const cleaned = cleanText(comment);
  
  // Check if comment became empty after cleaning (only if original wasn't empty)
  if (cleaned.length === 0 && comment.length > 0) {
    return {
      valid: false,
      error: 'Hey! - This is still my website, please be considerate. :]'
    };
  }
  
  // Check for prohibited content
  if (containsProhibitedContent(cleaned)) {
    return {
      valid: false,
      error: 'Hey! - This is still my website, please be considerate. :]'
    };
  }
  
  // Check length
  if (cleaned.length > 600) {
    return {
      valid: false,
      error: 'Comment too long (max 600 characters)'
    };
  }
  
  return {
    valid: true,
    cleaned: cleaned
  };
}

/**
 * Filter and clean all user input
 */
export function filterUserInput({ comment, name }) {
  const commentValidation = validateComment(comment);
  const usernameValidation = validateUsername(name);
  
  // Don't validate empty comments at the main level - let the form handle this
  if (!comment || !comment.trim()) {
    return {
      valid: false,
      error: null // No error message for empty comments
    };
  }
  
  if (!commentValidation.valid) {
    return {
      valid: false,
      error: commentValidation.error
    };
  }
  
  if (!usernameValidation.valid) {
    return {
      valid: false,
      error: usernameValidation.error
    };
  }
  
  return {
    valid: true,
    comment: commentValidation.cleaned,
    name: usernameValidation.cleaned || undefined // undefined if empty, will show as Anonymous
  };
}
