/**
 * Journal-specific Ghost Animation Extensions
 *
 * This module extends the ghost animations for journal-specific interactions.
 */

import { ghostStateStore } from './stores/ghostStateStore';
import { ANIMATION_STATES } from './animationConfig.js';

/**
 * React to journal entry text with appropriate ghost animations
 * @param {number} length - Length of the journal entry text
 */
export function reactToJournalEntry(length) {
  // Get current state
  if (length > 500) {
    // Long journal entry - very excited!
    setJournalExpression('excited', { duration: 3000 });
    setTimeout(() => {
      // Show happiness through reaction
      ghostStateStore.triggerReaction();
    }, 3000);
  } else if (length > 200) {
    // Good journal entry - happy
    setJournalExpression('happy', { duration: 2500 });
    setTimeout(() => ghostStateStore.triggerReaction(), 2500);
  } else if (length > 50) {
    // Short but meaningful - smile
    setJournalExpression('smile', { duration: 2000 });
  } else {
    // Very brief note - brief thinking then neutral
    setJournalExpression('thinking', { duration: 2000 });
    setTimeout(() => setJournalExpression('neutral'), 2000);
  }
}

/**
 * Set journal-specific ghost expression
 * @param {string} expression - Expression name
 * @param {Object} options - Options including duration
 */
export function setJournalExpression(expression, options = {}) {
  const duration = options.duration || 2000;
  
  // Add animation class to ghost face
  const faceElement = document.getElementById('ghost-face');
  if (faceElement) {
    // Remove any existing expression classes
    const expressionClasses = ['excited', 'happy', 'smile', 'sad', 'thinking', 'neutral'];
    expressionClasses.forEach(cls => {
      faceElement.classList.remove(`expression-${cls}`);
      faceElement.classList.remove(`journal-expression-${cls}`);
    });
    
    // Add new expression class with journal prefix
    faceElement.classList.add(`journal-expression-${expression}`);
    
    // Add regular expression class as a fallback
    faceElement.classList.add(`expression-${expression}`);
    
    // Reset after duration
    if (duration > 0) {
      setTimeout(() => {
        faceElement.classList.remove(`journal-expression-${expression}`);
        faceElement.classList.remove(`expression-${expression}`);
      }, duration);
    }
  }
}

/**
 * Show that the ghost is thinking about a journal prompt
 */
export function showJournalThinking() {
  // Use thinking animation from standard ghost store
  ghostStateStore.setAnimationState(ANIMATION_STATES.THINKING);
  
  // Add journal-specific thinking class
  const ghostElement = document.getElementById('ghost-root');
  if (ghostElement) {
    ghostElement.classList.add('journal-thinking');
    
    // Remove class after animation completes
    setTimeout(() => {
      ghostElement.classList.remove('journal-thinking');
    }, 5000);
  }
}

/**
 * React to mood detection in journal entries
 * @param {string} mood - Detected mood (happy, sad, etc.)
 */
export function reactToJournalMood(mood) {
  // Map moods to expressions
  const moodToExpression = {
    happy: 'happy',
    sad: 'sad',
    neutral: 'neutral',
    excited: 'excited',
    tired: 'thinking',
    angry: 'sad',
    anxious: 'thinking',
    calm: 'smile',
    surprised: 'excited',
    proud: 'happy',
    grateful: 'smile'
  };
  
  // Get expression for mood (default to neutral)
  const expression = moodToExpression[mood] || 'neutral';
  
  // Set expression with longer duration for mood reactions
  setJournalExpression(expression, { duration: 4000 });
  
  // Add special animation for strong emotions
  if (['happy', 'excited', 'proud'].includes(mood)) {
    setTimeout(() => ghostStateStore.triggerReaction(), 2000);
  }
}

// Export complete API
export const journalGhostAnimations = {
  reactToJournalEntry,
  setJournalExpression,
  showJournalThinking,
  reactToJournalMood
};

export default journalGhostAnimations;