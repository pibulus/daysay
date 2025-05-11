<script>
  import { createEventDispatcher } from 'svelte';
  import { themeService } from '$lib/services/theme';
  import { formatDate } from './utils';
  
  // Journal entry data and event handlers
  export let entry = { date: '', title: '', content: [], mood: 'neutral', tags: [] };
  export let isActive = false;
  export let onSelect = () => {};
  export let onDeleteEntry = () => {};
  export let onEditTitle = () => {};
  export let onEditContent = () => {};
  export let onAddContent = () => {};
  export let onSetMood = () => {};
  export let onAddTag = () => {};
  export let onRemoveTag = () => {};
  
  const dispatch = createEventDispatcher();
  
  // State variables
  let isEditingTitle = false;
  let editedTitle = '';
  let isContentExpanded = false;
  let newContent = '';
  let isAddingContent = false;
  let contentPreviewLength = 150; // Characters to show in preview
  
  // Format date for display
  $: formattedDate = formatDate(entry.date);
  
  // Calculate content summary for preview
  $: contentSummary = entry.content && entry.content.length > 0 
    ? entry.content.map(p => p.text).join(' ').substring(0, contentPreviewLength) 
    : 'No content yet...';
  
  // Check if content should be truncated
  $: isTruncated = entry.content && entry.content.map(p => p.text).join(' ').length > contentPreviewLength;
  
  // Handle edit mode for entry title
  function startEditingTitle() {
    editedTitle = entry.title || '';
    isEditingTitle = true;
    // Focus the input after render
    setTimeout(() => {
      const editInput = document.getElementById(`edit-title-${entry.id}`);
      if (editInput) editInput.focus();
    }, 50);
  }
  
  function saveTitle() {
    if (editedTitle.trim()) {
      onEditTitle(editedTitle);
    }
    isEditingTitle = false;
  }
  
  function handleTitleKeyDown(event) {
    if (event.key === 'Enter') {
      saveTitle();
    } else if (event.key === 'Escape') {
      isEditingTitle = false;
    }
  }
  
  // Toggle content expansion
  function toggleContentExpansion() {
    isContentExpanded = !isContentExpanded;
  }
  
  // Add new content functions
  function toggleAddContentForm() {
    isAddingContent = !isAddingContent;
    if (isAddingContent) {
      // Focus the textarea after the component renders
      setTimeout(() => {
        const addContentInput = document.getElementById(`add-content-${entry.id}`);
        if (addContentInput) addContentInput.focus();
      }, 50);
    } else {
      newContent = '';
    }
  }
  
  function handleAddContent() {
    if (newContent.trim()) {
      onAddContent(newContent.trim());
      newContent = '';
      // Keep the form open for adding more content
    }
  }
  
  function handleAddContentKeyDown(event) {
    if (event.key === 'Enter' && event.ctrlKey) {
      // Submit on Ctrl+Enter
      handleAddContent();
    } else if (event.key === 'Escape') {
      toggleAddContentForm();
    }
  }
  
  // Delete entry confirmation
  function confirmDelete() {
    if (confirm(`Are you sure you want to delete this journal entry from ${formattedDate}?`)) {
      onDeleteEntry();
    }
  }
  
  // Get mood emoji
  function getMoodEmoji(mood) {
    const moodEmojis = {
      happy: '😊',
      sad: '😢',
      neutral: '😐',
      excited: '🤩',
      tired: '😴',
      angry: '😠',
      anxious: '😰',
      calm: '😌',
      surprised: '😲',
      proud: '😄',
      grateful: '🙏'
    };
    
    return moodEmojis[mood] || '😐';
  }
</script>

<div 
  class="card w-full max-w-[640px] min-h-[420px] h-auto overflow-hidden flex flex-col bg-white {isActive ? `border-2 border-${themeService.getCurrentTheme()}` : 'border border-gray-200'}"
  style="transition: all 0.3s ease; backface-visibility: hidden; will-change: transform, box-shadow; -webkit-backface-visibility: hidden;"
  on:click={() => onSelect(entry.id)}
>
  <div class="card-body p-6 flex flex-col">
    <!-- Header: Date & Title -->
    <div class="flex flex-col gap-1 mb-3">
      <!-- Date and Mood Badge -->
      <div class="flex justify-between items-center">
        <div class="text-sm font-medium text-gray-500">
          {formattedDate}
        </div>
        <div class="mood-indicator text-xl" title={entry.mood}>
          {getMoodEmoji(entry.mood)}
        </div>
      </div>
      
      <!-- Title -->
      <div class="card-title flex justify-between">
        {#if isEditingTitle}
          <input 
            id="edit-title-{entry.id}"
            class="input input-bordered input-sm flex-grow"
            bind:value={editedTitle}
            on:blur={saveTitle}
            on:keydown={handleTitleKeyDown}
          />
        {:else}
          <h3 class="text-lg font-bold truncate flex-grow" on:dblclick={startEditingTitle}>
            {entry.title || `Journal Entry - ${formattedDate}`}
          </h3>
          <button 
            class="btn btn-square btn-ghost btn-xs" 
            on:click|stopPropagation={startEditingTitle}
            title="Edit title"
          >
            ✏️
          </button>
        {/if}
      </div>
      
      <!-- Tags -->
      {#if entry.tags && entry.tags.length > 0}
        <div class="flex flex-wrap gap-1 mt-1">
          {#each entry.tags as tag}
            <span class="badge badge-sm bg-{themeService.getCurrentTheme()}-100 text-{themeService.getCurrentTheme()}-800 border-{themeService.getCurrentTheme()}-200">
              #{tag}
              <button class="ml-1 text-xs opacity-70 hover:opacity-100" on:click|stopPropagation={() => onRemoveTag(tag)}>
                ×
              </button>
            </span>
          {/each}
        </div>
      {/if}
    </div>
    
    <!-- Content -->
    <div class="flex-grow overflow-y-auto mb-3 max-h-[320px] h-full scrollbar-thin">
      {#if entry.content && entry.content.length > 0}
        <div class="journal-content prose prose-sm max-w-none">
          {#if isContentExpanded}
            {#each entry.content as paragraph}
              <p class="mb-3 last:mb-0">{paragraph.text}</p>
            {/each}
          {:else}
            <p>
              {contentSummary}{isTruncated ? '...' : ''}
            </p>
            {#if isTruncated}
              <button 
                class="text-{themeService.getCurrentTheme()}-600 font-medium text-sm hover:underline mt-2"
                on:click|stopPropagation={toggleContentExpansion}
              >
                Read more
              </button>
            {/if}
          {/if}
          
          {#if isContentExpanded}
            <button 
              class="text-{themeService.getCurrentTheme()}-600 font-medium text-sm hover:underline mt-3 block"
              on:click|stopPropagation={toggleContentExpansion}
            >
              Show less
            </button>
          {/if}
        </div>
      {:else}
        <div class="flex flex-col items-center justify-center h-full text-gray-500 italic gap-4">
          <p>This journal entry is empty</p>
          <button
            class="btn btn-sm btn-{themeService.getCurrentTheme()}"
            on:click|stopPropagation={toggleAddContentForm}
          >
            + Add Content
          </button>
        </div>
      {/if}
      
      <!-- Add content form -->
      {#if isAddingContent}
        <div class="mt-4 bg-gray-50 p-3 rounded-lg">
          <div class="w-full space-y-2">
            <textarea
              id="add-content-{entry.id}"
              class="textarea textarea-bordered w-full h-24 text-gray-800 text-sm"
              placeholder="What happened today? Press Ctrl+Enter to save..."
              bind:value={newContent}
              on:keydown={handleAddContentKeyDown}
            ></textarea>
            <div class="flex justify-end gap-2">
              <button
                class="btn btn-sm btn-{themeService.getCurrentTheme()}"
                on:click|stopPropagation={handleAddContent}
                disabled={!newContent.trim()}
              >
                Add
              </button>
              <button
                class="btn btn-sm btn-ghost"
                on:click|stopPropagation={toggleAddContentForm}
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      {/if}
    </div>
    
    <!-- Footer Actions -->
    <div class="card-actions flex justify-between mt-auto">
      {#if !isAddingContent && entry.content && entry.content.length > 0}
        <button
          class="btn btn-sm bg-{themeService.getCurrentTheme()}/20 hover:bg-{themeService.getCurrentTheme()}/30 text-{themeService.getCurrentTheme()}-600 rounded-full"
          on:click|stopPropagation={toggleAddContentForm}
        >
          + Add More
        </button>
      {:else if !isAddingContent && (!entry.content || entry.content.length === 0)}
        <div></div> <!-- Empty div to maintain flex spacing -->
      {/if}
      
      <div>
        <button 
          class="btn btn-sm btn-outline btn-error" 
          on:click|stopPropagation={confirmDelete}
          title="Delete entry"
        >
          Delete
        </button>
      </div>
    </div>
  </div>
</div>

<style>
  .journal-content {
    font-family: var(--font-family-sans, sans-serif);
    color: var(--color-text-primary, #333);
    line-height: 1.6;
  }
  
  .journal-content p {
    margin-bottom: 1rem;
  }
  
  .journal-content p:last-child {
    margin-bottom: 0;
  }
  
  .mood-indicator {
    transition: transform 0.3s ease;
  }
  
  .mood-indicator:hover {
    transform: scale(1.2);
  }
  
  /* Custom scrollbar styles */
  :global(.scrollbar-thin::-webkit-scrollbar) {
    width: 6px;
  }
  
  :global(.scrollbar-thin::-webkit-scrollbar-track) {
    background: rgba(0, 0, 0, 0.05);
    border-radius: 3px;
  }
  
  :global(.scrollbar-thin::-webkit-scrollbar-thumb) {
    background: rgba(0, 0, 0, 0.1);
    border-radius: 3px;
  }
  
  :global(.scrollbar-thin::-webkit-scrollbar-thumb:hover) {
    background: rgba(0, 0, 0, 0.2);
  }
</style>