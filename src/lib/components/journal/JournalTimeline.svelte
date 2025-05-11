<script>
  import { onMount, onDestroy } from 'svelte';
  import { journalStore, activeEntry, entriesByDate } from '$lib/services/journal/journalStore';
  import { journalService } from '$lib/services/journal/journalService';
  import { themeService } from '$lib/services/theme';
  import JournalEntryCard from './JournalEntryCard.svelte';
  import { formatShortDate, getTodayString, isToday, isYesterday } from './utils';
  
  // State and data
  let entries = [];
  let activeEntryId = null;
  let timelineElement;
  
  // Subscribe to the journal store
  const unsubscribe = journalStore.subscribe(state => {
    // Get entries from derived store to ensure they're sorted
    journalStore.journalStore | entriesByDate.subscribe(sortedEntries => {
      entries = sortedEntries;
    });
    
    activeEntryId = state.activeEntryId;
    
    // Ensure active entry is in view when it changes
    setTimeout(() => {
      scrollToActiveEntry();
    }, 100);
  });
  
  // Swipe handling
  let touchStartX = 0;
  let touchEndX = 0;
  
  function handleTouchStart(e) {
    touchStartX = e.changedTouches[0].screenX;
  }
  
  function handleTouchEnd(e) {
    touchEndX = e.changedTouches[0].screenX;
    handleSwipe();
  }
  
  function handleSwipe() {
    const swipeThreshold = 50; // Minimum px distance for swipe
    
    // Calculate current active index
    const activeIndex = entries.findIndex(entry => entry.id === activeEntryId);
    
    if (touchEndX < touchStartX - swipeThreshold) {
      // Swipe left - go to next card (newer entries)
      if (activeIndex > 0) {
        handleSelectEntry(entries[activeIndex - 1].id);
      }
    }
    
    if (touchEndX > touchStartX + swipeThreshold) {
      // Swipe right - go to previous card (older entries)
      if (activeIndex < entries.length - 1) {
        handleSelectEntry(entries[activeIndex + 1].id);
      }
    }
  }
  
  onMount(() => {
    // Force explicit initialization of the store 
    console.log('JournalTimeline component mounted, initializing journal');
    journalStore.initialize();
    
    // If there are no entries, create a default entry for today
    if (entries.length === 0) {
      journalService.createTodayEntry();
    }
  });
  
  onDestroy(() => {
    if (unsubscribe) unsubscribe();
  });
  
  // Functions to manage entries
  function handleCreateTodayEntry() {
    journalService.createTodayEntry();
  }
  
  function handleSelectEntry(entryId) {
    journalService.setActiveEntry(entryId);
  }
  
  function handleDeleteEntry(entryId) {
    journalService.deleteEntry(entryId);
  }
  
  function handleEditTitle(entryId, newTitle) {
    if (entryId === activeEntryId) {
      journalService.setEntryTitle(newTitle);
    }
  }
  
  function handleAddContent(entryId, text) {
    if (entryId === activeEntryId) {
      journalService.addContentToActiveEntry(text);
    }
  }
  
  function handleEditContent(entryId, contentId, newText) {
    // This would be implemented later with content editing functionality
    console.log('Edit content', entryId, contentId, newText);
  }
  
  function handleSetMood(entryId, mood) {
    if (entryId === activeEntryId) {
      journalService.setEntryMood(mood);
    }
  }
  
  function handleAddTag(entryId, tag) {
    if (entryId === activeEntryId) {
      journalService.addEntryTag(tag);
    }
  }
  
  function handleRemoveTag(entryId, tag) {
    if (entryId === activeEntryId) {
      journalService.removeEntryTag(tag);
    }
  }
  
  // Update active card with visual swipe effect
  function scrollToActiveEntry() {
    if (!timelineElement || !activeEntryId) return;
    
    // Update data attributes to trigger transitions
    const items = timelineElement.querySelectorAll('.carousel-item');
    const activeIndex = entries.findIndex(entry => entry.id === activeEntryId);
    
    items.forEach((item, index) => {
      item.setAttribute('data-active', (index === activeIndex).toString());
      item.setAttribute('data-prev', (index === activeIndex - 1).toString());
      item.setAttribute('data-next', (index === activeIndex + 1).toString());
    });
  }
  
  // Get the correct date label for the navigation
  function getEntryDateLabel(entry, index) {
    if (!entry.date) return 'Unknown Date';
    
    if (isToday(entry.date)) {
      return 'Today';
    } else if (isYesterday(entry.date)) {
      return 'Yesterday';
    } else {
      return formatShortDate(entry.date);
    }
  }
</script>

<div class="journal-container">
  <div class="flex justify-between items-center mb-2">
    <h2 class="text-lg font-bold">Journal Timeline</h2>
    <button class="btn btn-xs btn-{themeService.getCurrentTheme()}" on:click={handleCreateTodayEntry}>
      Today's Entry
    </button>
  </div>
  
  {#if entries.length > 0}
    <div class="carousel w-full p-4 bg-transparent rounded-box flex justify-center"
         bind:this={timelineElement}
         on:touchstart={handleTouchStart}
         on:touchend={handleTouchEnd}>
      {#each entries as entry, index (entry.id)}
        <div 
          class="carousel-item" 
          data-entry-id={entry.id}
          data-active={entry.id === activeEntryId}
          data-prev={index === entries.findIndex(e => e.id === activeEntryId) - 1}
          data-next={index === entries.findIndex(e => e.id === activeEntryId) + 1}
        >
          <JournalEntryCard
            {entry}
            isActive={entry.id === activeEntryId}
            onSelect={() => handleSelectEntry(entry.id)}
            onDeleteEntry={() => handleDeleteEntry(entry.id)}
            onEditTitle={(newTitle) => handleEditTitle(entry.id, newTitle)}
            onEditContent={(contentId, newText) => handleEditContent(entry.id, contentId, newText)}
            onAddContent={(text) => handleAddContent(entry.id, text)}
            onSetMood={(mood) => handleSetMood(entry.id, mood)}
            onAddTag={(tag) => handleAddTag(entry.id, tag)}
            onRemoveTag={(tag) => handleRemoveTag(entry.id, tag)}
          />
        </div>
      {/each}
    </div>
    
    <!-- Navigation buttons and date display -->
    <div class="flex justify-between items-center mt-4 px-1 relative z-20">
      <button 
        class="btn btn-circle btn-xs btn-{themeService.getCurrentTheme()}/70"
        on:click={() => {
          if (timelineElement) {
            // Find the current active entry index
            const activeIndex = entries.findIndex(entry => entry.id === activeEntryId);
            if (activeIndex < entries.length - 1) {
              // Select the older entry (remember entries are sorted newest first)
              handleSelectEntry(entries[activeIndex + 1].id);
            }
          }
        }}
        disabled={entries.findIndex(entry => entry.id === activeEntryId) === entries.length - 1}
        title="Older entry"
      >
        ❮
      </button>
      
      <div class="text-center mx-2 text-xs">
        {#if activeEntryId}
          {getEntryDateLabel(entries.find(e => e.id === activeEntryId) || {}, entries.findIndex(e => e.id === activeEntryId))}
        {/if}
      </div>
      
      <button 
        class="btn btn-circle btn-xs btn-{themeService.getCurrentTheme()}/70"
        on:click={() => {
          if (timelineElement) {
            // Find the current active entry index
            const activeIndex = entries.findIndex(entry => entry.id === activeEntryId);
            if (activeIndex > 0) {
              // Select the newer entry (remember entries are sorted newest first)
              handleSelectEntry(entries[activeIndex - 1].id);
            }
          }
        }}
        disabled={entries.findIndex(entry => entry.id === activeEntryId) === 0}
        title="Newer entry"
      >
        ❯
      </button>
    </div>
  {:else}
    <div class="card w-full max-w-[640px] min-h-[420px] shadow-lg bg-white border border-gray-200 mx-auto flex items-center justify-center">
      <div class="text-center p-6">
        <div class="text-gray-400 mb-4">
          <svg xmlns="http://www.w3.org/2000/svg" class="h-16 w-16 mx-auto" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
          </svg>
        </div>
        <p class="text-gray-500 mb-4">No journal entries found</p>
        <p class="text-sm text-gray-400">Create a new entry to get started</p>
      </div>
    </div>
  {/if}
</div>

<style>
  .journal-container {
    margin: 1rem auto;
    width: 95%;
    max-width: 700px; /* Narrower container to match card width */
    padding: 0 1rem;
    overflow-x: hidden; /* Ensure no horizontal scrollbar */
  }
  
  .carousel {
    overflow: visible;
    position: relative;
    height: auto;
    min-height: 450px; /* Minimum height for cards */
    perspective: 1200px; /* Enhanced 3D effect */
    transform-style: preserve-3d;
    padding: 20px 0;
  }
  
  .carousel-item {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    min-height: 100%;
    display: flex;
    justify-content: center;
    align-items: flex-start;
    padding-top: 10px;
    opacity: 0;
    transform: translateX(0) translateY(20px) translateZ(-100px) scale(0.85);
    transition: all 0.4s cubic-bezier(0.25, 1, 0.5, 1);
    pointer-events: none;
    filter: drop-shadow(0 4px 6px rgba(0,0,0,0.1));
  }
  
  .carousel-item[data-active="true"] {
    opacity: 1;
    transform: translateX(0) translateY(0) translateZ(0) scale(1);
    pointer-events: all;
    z-index: 10;
    filter: drop-shadow(0 10px 15px rgba(0,0,0,0.2));
  }
  
  .carousel-item[data-prev="true"] {
    opacity: 0.7;
    transform: translateX(-30px) translateY(10px) translateZ(-40px) scale(0.95) rotateZ(-2deg);
    z-index: 5;
    pointer-events: none;
  }
  
  .carousel-item[data-next="true"] {
    opacity: 0.7;
    transform: translateX(30px) translateY(10px) translateZ(-40px) scale(0.95) rotateZ(2deg);
    z-index: 5;
    pointer-events: none;
  }
  
  /* Cards slightly visible in the stack */
  .carousel-item:not([data-active="true"]):not([data-prev="true"]):not([data-next="true"]) {
    opacity: 0.2;
    transform: translateX(0) translateY(30px) translateZ(-80px) scale(0.85);
    z-index: 1;
  }
</style>