# DaySay Initial Transition Plan

## Project Overview
DaySay is a voice-based journaling app that allows users to speak about their day and save audio transcriptions as daily entries. Each entry is visualized as a card, creating a simple timeline of journal entries. The app maintains the ghost component from TalkType/Ziplist as a central UI element and feedback mechanism during audio recording.

## Key Components to Modify

### 1. Data Structure Transition
- **From Lists to Journal Entries**: 
  - Modify the existing list data structure to represent journal entries
  - Change fields like `name` to `date` (or keep and use for custom naming)
  - Convert `items` array to represent journal content paragraphs/sections
  - Add fields for mood tracking, tags, and other journal-specific metadata
  - Update storage implementation to organize entries chronologically

### 2. UI Components Adaptation
- **List Card to Journal Card**:
  - Repurpose `ListCard.svelte` into `JournalEntryCard.svelte`
  - Update UI to display date prominently instead of list name
  - Remove checkbox functionality for items
  - Design entries as continuous text rather than separate items
  - Add optional mood indicators and metadata display
  
- **Card Collection View**:
  - Adapt `ListCarousel.svelte` to display journal entries chronologically
  - Implement calendar or timeline navigation for entries
  - Add filtering options (by date range, mood, tags)

### 3. Audio Transcription Adaptation
- **Voice Processing Changes**:
  - Modify `ListParser` to become `JournalParser` 
  - Remove list-specific commands (add item, clear list)
  - Add journal-focused commands (new entry, continue entry, etc.)
  - Update parsing to handle continuous speech rather than discrete items
  - Implement sentence structure preservation and basic formatting

### 4. Services and Stores Refactoring
- **Core Service Changes**:
  - Rename and adapt `listsService.js` to `journalService.js`
  - Update storage and retrieval methods for journal entries
  - Modify command processing for journaling context
  - Add features for entry organization and retrieval by date
  
- **Store Modifications**:
  - Convert `listsStore.js` to `journalStore.js`
  - Update stored data structure for journal entries
  - Modify derived stores for active entries and viewing contexts
  - Implement date-based navigation helpers

### 5. Ghosting Animation Integration
- **Maintain Ghost Component**:
  - Update ghost animation cues to reflect journaling context
  - Modify ghost themes to match journaling aesthetic
  - Keep eye tracking and animation feedback during recording
  - Add new ghost reactions for journal-specific actions

### 6. UI/UX Improvements
- **Key UX Changes**:
  - Implement calendar view for entry navigation
  - Add mood tracking as optional metadata
  - Create simpler entry creation flow (date auto-selection)
  - Design intuitive editing interface for expanding existing entries
  
- **Visual Enhancements**:
  - Update card design for longer text content
  - Add subtle date formatting for chronological organization
  - Include optional visual indicators for entry mood/tone
  - Design day/week/month navigation controls

## Implementation Strategy

1. **App Branding and Text Updates**
   - Update all references from "Ziplist" to "DaySay" throughout the codebase
   - Modify all list-related terminology to journaling terminology
   - Update placeholders and user prompts to reflect journaling purpose
   - Change marketing copy and descriptions to focus on journaling

2. **Basic Structure and Data Model**
   - Design and implement journal entry data structure
   - Create store and service adaptations for the new model
   - Test data persistence and retrieval functions

3. **Core UI Adaptations**
   - Adapt list cards to journal entry format
   - Update card carousel for chronological display
   - Create entry view and edit interfaces

4. **Voice Input Enhancements**
   - Modify parser for continuous text processing
   - Implement new voice commands for journaling
   - Update ghost animation reactions for journal context

5. **Theming and Branding**
   - Update app name, icons, and branding elements
   - Design color scheme and typography for journaling
   - Create mood indicator visual system

6. **Navigation and Organization**
   - Implement calendar or timeline navigation
   - Add date-based entry organization
   - Create filtering and search capabilities

7. **Testing and Polish**
   - Test voice input and transcription accuracy
   - Ensure data persistence across sessions
   - Optimize UI for different entry lengths
   - Add final animations and transitions

## Detailed Data Structure

```javascript
// Current List Structure
const LIST = {
  id: 'list_id',
  name: 'List Name',
  items: [
    { id: 123, text: 'Item 1', checked: false },
    { id: 124, text: 'Item 2', checked: true }
  ],
  createdAt: '2025-05-10T12:00:00.000Z',
  updatedAt: '2025-05-10T12:30:00.000Z'
};

// Proposed Journal Entry Structure
const JOURNAL_ENTRY = {
  id: 'entry_20250510_1',
  date: '2025-05-10',  // YYYY-MM-DD format
  title: 'Good day at the beach', // Optional custom title
  content: [
    { id: 'p1', text: 'Today I went to the beach with friends.', timestamp: '12:30:00' },
    { id: 'p2', text: 'We had a picnic and played volleyball.', timestamp: '12:30:45' }
  ],
  mood: 'happy', // Optional mood indicator
  tags: ['friends', 'beach', 'weekend'], // Optional tags
  audioRef: 'audio_20250510_1.mp3', // Optional reference to saved audio
  createdAt: '2025-05-10T12:30:00.000Z',
  updatedAt: '2025-05-10T12:32:10.000Z'
};
```

## UI Component Changes

1. **JournalEntryCard.svelte**
   - Prominent date/title display
   - Continuous text view instead of checkboxes
   - Mood indicator icons/colors
   - Edit/append actions for existing entries
   - Preview mode with expand option for long entries

2. **JournalTimeline.svelte**
   - Chronological display of entry cards
   - Date-based navigation (jump to month/week)
   - Visual indicators for days with entries
   - Grouping by week/month

3. **EntryEditor.svelte**
   - Text editing interface for manual updates
   - Formatting options for journal text
   - Metadata editing (mood, tags, title)

## Service Changes

1. **journalService.js**
   - Create entries based on date
   - Append to existing entries for same-day updates
   - Retrieve entries by date range
   - Process continuous speech transcriptions
   - Handle journal-specific commands

2. **journalParser.js**
   - Process natural language for continuous text
   - Identify sentence boundaries for formatting
   - Detect commands like "new entry", "continue yesterday's entry"
   - Extract potential mood indicators from text

## Future Considerations
- Entry sharing capabilities
- Rich text and media attachment
- Encrypted private entries
- Daily/weekly summaries using AI
- Mood analysis and trends
- Multiple journal categories (personal, work, gratitude)
- Cross-device synchronization