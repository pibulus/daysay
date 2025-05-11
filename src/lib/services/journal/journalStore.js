import { writable, derived, get } from 'svelte/store';
import { browser } from '$app/environment';
import { StorageUtils } from '../infrastructure/storageUtils';
import { STORAGE_KEYS } from '$lib/constants';

// Format a date as YYYY-MM-DD
function formatDate(date = new Date()) {
  return date.toISOString().split('T')[0];
}

// Default journal entry structure
const DEFAULT_ENTRY = {
  id: 'entry_default',
  date: formatDate(),
  title: '',  // Optional custom title
  content: [], // Array of content paragraphs
  mood: 'neutral', // Default to neutral mood
  tags: [],  // Array of tags
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString()
};

// Current schema version
const CURRENT_VERSION = 1;

// Initialize the journal entries store
function createJournalStore() {
  // Create the main store with default empty state
  const { subscribe, set, update } = writable({
    entries: [],
    activeEntryId: null,
    version: CURRENT_VERSION
  });

  // Initialize from localStorage or with defaults
  function initialize() {
    if (!browser) return;

    try {
      // Read directly from localStorage for debugging
      const rawEntriesJSON = localStorage.getItem(STORAGE_KEYS.ENTRIES);
      console.log('Raw entries JSON from localStorage:', rawEntriesJSON);
      
      // Check for existing stored entries
      let storedEntries = null;
      try {
        if (rawEntriesJSON) {
          storedEntries = JSON.parse(rawEntriesJSON);
          console.log('Parsed stored entries:', storedEntries);
        }
      } catch (parseError) {
        console.error('Error parsing entries JSON:', parseError);
      }
      
      const storedActiveEntryId = localStorage.getItem(STORAGE_KEYS.ACTIVE_ENTRY_ID);
      console.log('Stored active entry ID:', storedActiveEntryId);
      
      const storedVersionRaw = localStorage.getItem(STORAGE_KEYS.ENTRIES_VERSION);
      console.log('Stored version raw:', storedVersionRaw);
      const storedVersion = storedVersionRaw ? parseInt(storedVersionRaw, 10) : 0;

      // Initialize with stored data or defaults
      if (storedEntries && storedEntries.length > 0) {
        // Handle version migration if needed
        if (storedVersion < CURRENT_VERSION) {
          // Future migration logic would go here
          StorageUtils.setNumberItem(STORAGE_KEYS.ENTRIES_VERSION, CURRENT_VERSION);
        }

        // Set the store with stored entries
        set({
          entries: storedEntries,
          activeEntryId: storedActiveEntryId || storedEntries[0].id,
          version: CURRENT_VERSION
        });
      } else {
        // Initialize with a default entry for today
        const defaultEntry = createDefaultEntry();
        set({
          entries: [defaultEntry],
          activeEntryId: defaultEntry.id,
          version: CURRENT_VERSION
        });
        
        // Save to localStorage
        persistToStorage();
      }
    } catch (error) {
      console.error('Error initializing journal from storage:', error);
      // Fallback to defaults on error
      const defaultEntry = createDefaultEntry();
      set({
        entries: [defaultEntry],
        activeEntryId: defaultEntry.id,
        version: CURRENT_VERSION
      });
    }
  }

  // Create a default entry for today's date
  function createDefaultEntry() {
    const today = new Date();
    const formattedDate = formatDate(today);
    const defaultTitle = `Journal Entry for ${formattedDate}`;
    
    return {
      ...DEFAULT_ENTRY,
      id: generateEntryId(formattedDate),
      date: formattedDate,
      title: defaultTitle
    };
  }

  // Persist current state to localStorage
  function persistToStorage() {
    if (!browser) return;

    try {
      const state = get({ subscribe });
      // Ensure we're actually getting data from the store
      console.log('Persisting entries to storage:', state.entries);
      
      // Explicitly stringify to debug
      const entriesJSON = JSON.stringify(state.entries);
      console.log('Entries JSON:', entriesJSON);
      
      // Use localStorage to save entries
      localStorage.setItem(STORAGE_KEYS.ENTRIES, entriesJSON);
      localStorage.setItem(STORAGE_KEYS.ACTIVE_ENTRY_ID, state.activeEntryId || '');
      localStorage.setItem(STORAGE_KEYS.ENTRIES_VERSION, String(state.version));
      
      // Verify it was stored properly
      console.log('Verification - Entries in localStorage:', localStorage.getItem(STORAGE_KEYS.ENTRIES));
    } catch (error) {
      console.error('Error persisting entries to storage:', error);
    }
  }

  // Generate a new unique ID for an entry based on date
  function generateEntryId(dateStr = null) {
    const date = dateStr || formatDate();
    return `entry_${date.replace(/-/g, '')}_${Math.floor(Math.random() * 1000)}`;
  }

  // Add a new journal entry
  function addEntry(date = null, title = null) {
    const entryDate = date || formatDate();
    const entryTitle = title || `Journal Entry for ${entryDate}`;
    
    update(state => {
      // Check if an entry for this date already exists
      const existingEntryIndex = state.entries.findIndex(
        entry => entry.date === entryDate
      );
      
      // If an entry already exists for this date, make it active instead of creating new
      if (existingEntryIndex !== -1) {
        return {
          ...state,
          activeEntryId: state.entries[existingEntryIndex].id
        };
      }
      
      // Create a new entry
      const newEntry = {
        id: generateEntryId(entryDate),
        date: entryDate,
        title: entryTitle,
        content: [],
        mood: 'neutral',
        tags: [],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };
      
      const newState = {
        ...state,
        entries: [...state.entries, newEntry],
        activeEntryId: newEntry.id // Auto-select the new entry
      };
      
      return newState;
    });
    
    persistToStorage();
    
    // Return the ID of the active entry (either new or existing)
    return get({ subscribe }).activeEntryId;
  }

  // Add entry for today (convenience function)
  function addTodayEntry() {
    return addEntry();
  }

  // Add entry for yesterday (convenience function)
  function addYesterdayEntry() {
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    return addEntry(formatDate(yesterday));
  }

  // Delete an entry by ID
  function deleteEntry(entryId) {
    update(state => {
      const entryIndex = state.entries.findIndex(entry => entry.id === entryId);
      if (entryIndex === -1) return state;
      
      // Create a new array without the deleted entry
      const newEntries = [...state.entries];
      newEntries.splice(entryIndex, 1);
      
      // Ensure we have at least one entry
      let activeEntryId = state.activeEntryId;
      if (newEntries.length === 0) {
        const defaultEntry = createDefaultEntry();
        newEntries.push(defaultEntry);
        activeEntryId = defaultEntry.id;
      } else if (state.activeEntryId === entryId) {
        // If we deleted the active entry, select the most recent entry
        newEntries.sort((a, b) => new Date(b.date) - new Date(a.date));
        activeEntryId = newEntries[0].id;
      }
      
      return {
        ...state,
        entries: newEntries,
        activeEntryId
      };
    });
    
    persistToStorage();
  }

  // Set the active entry
  function setActiveEntry(entryId) {
    update(state => {
      // Make sure the ID exists in our entries
      const entryExists = state.entries.some(entry => entry.id === entryId);
      if (!entryExists) return state;
      
      return {
        ...state,
        activeEntryId: entryId
      };
    });
    
    persistToStorage();
  }

  // Add content to a specific entry (or active entry by default)
  function addContent(text, entryId = null) {
    if (!text.trim()) return;
    
    update(state => {
      const targetEntryId = entryId || state.activeEntryId;
      return {
        ...state,
        entries: state.entries.map(entry => {
          if (entry.id === targetEntryId) {
            // Create a new paragraph object
            const paragraph = {
              id: `p_${Date.now()}`,
              text,
              timestamp: new Date().toISOString()
            };
            
            return {
              ...entry,
              content: [...entry.content, paragraph],
              updatedAt: new Date().toISOString()
            };
          }
          return entry;
        })
      };
    });
    
    persistToStorage();
  }

  // Update the content of an entry (completely replace the content array)
  function updateEntryContent(contentArray, entryId = null) {
    if (!contentArray || !Array.isArray(contentArray)) return;
    
    update(state => {
      const targetEntryId = entryId || state.activeEntryId;
      return {
        ...state,
        entries: state.entries.map(entry => {
          if (entry.id === targetEntryId) {
            return {
              ...entry,
              content: contentArray,
              updatedAt: new Date().toISOString()
            };
          }
          return entry;
        })
      };
    });
    
    persistToStorage();
  }

  // Set the mood for an entry
  function setEntryMood(mood, entryId = null) {
    update(state => {
      const targetEntryId = entryId || state.activeEntryId;
      return {
        ...state,
        entries: state.entries.map(entry => {
          if (entry.id === targetEntryId) {
            return {
              ...entry,
              mood,
              updatedAt: new Date().toISOString()
            };
          }
          return entry;
        })
      };
    });
    
    persistToStorage();
  }

  // Add a tag to an entry
  function addEntryTag(tag, entryId = null) {
    if (!tag.trim()) return;
    
    update(state => {
      const targetEntryId = entryId || state.activeEntryId;
      return {
        ...state,
        entries: state.entries.map(entry => {
          if (entry.id === targetEntryId) {
            // Only add the tag if it doesn't already exist
            if (!entry.tags.includes(tag.trim())) {
              return {
                ...entry,
                tags: [...entry.tags, tag.trim()],
                updatedAt: new Date().toISOString()
              };
            }
          }
          return entry;
        })
      };
    });
    
    persistToStorage();
  }

  // Remove a tag from an entry
  function removeEntryTag(tag, entryId = null) {
    update(state => {
      const targetEntryId = entryId || state.activeEntryId;
      return {
        ...state,
        entries: state.entries.map(entry => {
          if (entry.id === targetEntryId) {
            return {
              ...entry,
              tags: entry.tags.filter(t => t !== tag),
              updatedAt: new Date().toISOString()
            };
          }
          return entry;
        })
      };
    });
    
    persistToStorage();
  }

  // Set all tags for an entry (replaces existing tags)
  function setEntryTags(tags, entryId = null) {
    if (!Array.isArray(tags)) return;
    
    update(state => {
      const targetEntryId = entryId || state.activeEntryId;
      return {
        ...state,
        entries: state.entries.map(entry => {
          if (entry.id === targetEntryId) {
            return {
              ...entry,
              tags: [...new Set(tags.map(tag => tag.trim()).filter(Boolean))], // Deduplicate and remove empty tags
              updatedAt: new Date().toISOString()
            };
          }
          return entry;
        })
      };
    });
    
    persistToStorage();
  }

  // Update entry title
  function setEntryTitle(title, entryId = null) {
    if (!title.trim()) return;
    
    update(state => {
      const targetEntryId = entryId || state.activeEntryId;
      return {
        ...state,
        entries: state.entries.map(entry => {
          if (entry.id === targetEntryId) {
            return {
              ...entry,
              title: title.trim(),
              updatedAt: new Date().toISOString()
            };
          }
          return entry;
        })
      };
    });
    
    persistToStorage();
  }

  // Get entry by date string (YYYY-MM-DD)
  function getEntryByDate(dateStr) {
    const state = get({ subscribe });
    return state.entries.find(entry => entry.date === dateStr) || null;
  }

  // Get entry by ID
  function getEntryById(entryId) {
    const state = get({ subscribe });
    return state.entries.find(entry => entry.id === entryId) || null;
  }

  // Get all entries between two dates (inclusive)
  function getEntriesByDateRange(startDate, endDate) {
    const state = get({ subscribe });
    const start = new Date(startDate);
    const end = new Date(endDate);
    
    return state.entries.filter(entry => {
      const entryDate = new Date(entry.date);
      return entryDate >= start && entryDate <= end;
    });
  }

  // Get entries by mood
  function getEntriesByMood(mood) {
    const state = get({ subscribe });
    return state.entries.filter(entry => entry.mood === mood);
  }

  // Get entries by tag
  function getEntriesByTag(tag) {
    const state = get({ subscribe });
    return state.entries.filter(entry => entry.tags.includes(tag));
  }

  // Initialize when created
  initialize();

  return {
    subscribe,
    initialize,
    addEntry,
    addTodayEntry,
    addYesterdayEntry,
    deleteEntry,
    setActiveEntry,
    addContent,
    updateEntryContent,
    setEntryMood,
    addEntryTag,
    removeEntryTag,
    setEntryTags,
    setEntryTitle,
    getEntryByDate,
    getEntryById,
    getEntriesByDateRange,
    getEntriesByMood,
    getEntriesByTag,
    persistToStorage
  };
}

// Create the store instance
export const journalStore = createJournalStore();

// Derived store for the currently active entry
export const activeEntry = derived(
  journalStore,
  $journalStore => {
    if (!$journalStore.activeEntryId) return null;
    return $journalStore.entries.find(entry => entry.id === $journalStore.activeEntryId) || null;
  }
);

// Derived store for the content of the active entry
export const activeEntryContent = derived(
  activeEntry,
  $activeEntry => $activeEntry ? $activeEntry.content : []
);

// Derived store for entries sorted by date (newest first)
export const entriesByDate = derived(
  journalStore,
  $journalStore => {
    return [...$journalStore.entries].sort((a, b) => 
      new Date(b.date).getTime() - new Date(a.date).getTime()
    );
  }
);

// Derived store for unique tags across all entries
export const allTags = derived(
  journalStore,
  $journalStore => {
    const tags = new Set();
    $journalStore.entries.forEach(entry => {
      entry.tags.forEach(tag => tags.add(tag));
    });
    return [...tags];
  }
);

// Derived store for available moods
export const allMoods = derived(
  journalStore,
  $journalStore => {
    const moods = new Set();
    $journalStore.entries.forEach(entry => {
      if (entry.mood) moods.add(entry.mood);
    });
    return [...moods];
  }
);