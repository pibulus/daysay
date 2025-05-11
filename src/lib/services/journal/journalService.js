import { journalStore, activeEntry, activeEntryContent, entriesByDate } from './journalStore';
import { get } from 'svelte/store';

/**
 * Journal Service
 * 
 * Provides a high-level interface for interacting with journal entries
 * and processing voice commands for journal management.
 */
export class JournalService {
  constructor() {
    // Initialize the store
    if (typeof window !== 'undefined') {
      // Wait for next tick to ensure browser environment is fully ready
      setTimeout(() => {
        console.log('Initializing journal store from journalService constructor');
        journalStore.initialize();
      }, 0);
    }
  }

  /**
   * Process a transcription result and update journal entries accordingly
   * @param {Object} transcriptionResult - The result from transcription service
   */
  processTranscription(transcriptionResult) {
    if (!transcriptionResult) return;

    // With the journalParser not yet implemented, we'll handle transcriptions
    // as continuous text rather than discrete items
    const { text, commands } = transcriptionResult;
    
    // Process commands first if they exist
    if (commands && commands.length > 0) {
      for (const command of commands) {
        this._processCommand(command);
      }
    }
    
    // Add transcribed text to the active entry
    if (text && typeof text === 'string' && text.trim()) {
      this.addContentToActiveEntry(text.trim());
    }
  }

  /**
   * Process a specific journal command
   * @param {Object} command - Command object from journalParser
   * @private
   */
  _processCommand(command) {
    if (!command || !command.command) return;
    
    switch (command.command) {
      case 'NEW_ENTRY':
        // Create a new entry for today
        this.createTodayEntry();
        break;
        
      case 'YESTERDAY_ENTRY':
        // Create or select yesterday's entry
        this.createYesterdayEntry();
        break;
        
      case 'CONTINUE_ENTRY':
        // This is a no-op as we'll just append to the current entry
        break;
        
      case 'SET_MOOD':
        if (command.params && command.params.length > 0) {
          this.setEntryMood(command.params[0]);
        }
        break;
        
      case 'ADD_TAG':
        if (command.params && command.params.length > 0) {
          this.addEntryTag(command.params[0]);
        }
        break;
        
      // Add future command handlers here
    }
  }

  /**
   * Get all available journal entries
   * @returns {Array} Array of entry objects
   */
  getAllEntries() {
    return get(journalStore).entries;
  }
  
  /**
   * Get all entries sorted by date (newest first)
   * @returns {Array} Array of entry objects sorted by date
   */
  getEntriesByDate() {
    return get(entriesByDate);
  }
  
  /**
   * Create a new journal entry for today
   * @returns {string} ID of the created or existing entry
   */
  createTodayEntry() {
    return journalStore.addTodayEntry();
  }
  
  /**
   * Create or get a journal entry for yesterday
   * @returns {string} ID of the created or existing entry
   */
  createYesterdayEntry() {
    return journalStore.addYesterdayEntry();
  }
  
  /**
   * Create a new entry for a specific date
   * @param {string} date - Date string in YYYY-MM-DD format
   * @param {string} title - Optional title for the entry
   * @returns {string} ID of the created entry
   */
  createEntry(date, title = null) {
    return journalStore.addEntry(date, title);
  }
  
  /**
   * Set an entry as the active entry
   * @param {string} entryId - ID of the entry to activate
   */
  setActiveEntry(entryId) {
    journalStore.setActiveEntry(entryId);
  }
  
  /**
   * Get the currently active entry
   * @returns {Object|null} The active entry object or null
   */
  getActiveEntry() {
    return get(activeEntry);
  }
  
  /**
   * Add content to the active entry
   * @param {string} text - Content text
   */
  addContentToActiveEntry(text) {
    if (!text) return;
    journalStore.addContent(text);
  }
  
  /**
   * Add content to a specific entry
   * @param {string} text - Content text
   * @param {string} entryId - ID of the entry to add content to
   * @returns {Promise<string>} Promise resolving to the entry ID
   */
  async addContentToEntry(text, entryId) {
    if (!text) return null;

    if (!entryId) {
      // If no entry ID is provided, use the active entry or create a new one
      const store = get(journalStore);
      if (!store.activeEntryId) {
        // Create a new entry for today if no active entry
        const id = await this.createTodayEntry();
        // Make sure to add the content after the entry is created
        journalStore.addContent(text, id);
        return id;
      } else {
        journalStore.addContent(text, store.activeEntryId);
        return store.activeEntryId;
      }
    } else {
      journalStore.addContent(text, entryId);
      return entryId;
    }
  }
  
  /**
   * Set the mood for the active entry
   * @param {string} mood - Mood identifier (happy, sad, neutral, etc.)
   */
  setEntryMood(mood) {
    journalStore.setEntryMood(mood);
  }
  
  /**
   * Add a tag to the active entry
   * @param {string} tag - Tag to add
   */
  addEntryTag(tag) {
    journalStore.addEntryTag(tag);
  }
  
  /**
   * Remove a tag from the active entry
   * @param {string} tag - Tag to remove
   */
  removeEntryTag(tag) {
    journalStore.removeEntryTag(tag);
  }
  
  /**
   * Set the title for the active entry
   * @param {string} title - New title
   */
  setEntryTitle(title) {
    journalStore.setEntryTitle(title);
  }
  
  /**
   * Delete an entry by ID
   * @param {string} entryId - ID of the entry to delete
   */
  deleteEntry(entryId) {
    journalStore.deleteEntry(entryId);
  }
  
  /**
   * Get an entry by date
   * @param {string} date - Date string in YYYY-MM-DD format
   * @returns {Object|null} Entry object or null if not found
   */
  getEntryByDate(date) {
    return journalStore.getEntryByDate(date);
  }
  
  /**
   * Get entries within a date range
   * @param {string} startDate - Start date string in YYYY-MM-DD format
   * @param {string} endDate - End date string in YYYY-MM-DD format
   * @returns {Array} Array of entry objects
   */
  getEntriesByDateRange(startDate, endDate) {
    return journalStore.getEntriesByDateRange(startDate, endDate);
  }
  
  /**
   * Get entries with a specific mood
   * @param {string} mood - Mood to filter by
   * @returns {Array} Array of entry objects
   */
  getEntriesByMood(mood) {
    return journalStore.getEntriesByMood(mood);
  }
  
  /**
   * Get entries with a specific tag
   * @param {string} tag - Tag to filter by
   * @returns {Array} Array of entry objects
   */
  getEntriesByTag(tag) {
    return journalStore.getEntriesByTag(tag);
  }
  
  /**
   * Format a date to display in the UI
   * @param {string} dateString - Date string in YYYY-MM-DD format
   * @returns {string} Formatted date string
   */
  formatDisplayDate(dateString) {
    if (!dateString) return '';
    
    const date = new Date(dateString);
    return date.toLocaleDateString(undefined, {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  }
  
  /**
   * Get today's date in YYYY-MM-DD format
   * @returns {string} Today's date
   */
  getTodayDateString() {
    const today = new Date();
    return today.toISOString().split('T')[0];
  }
}

// Export a singleton instance
export const journalService = new JournalService();