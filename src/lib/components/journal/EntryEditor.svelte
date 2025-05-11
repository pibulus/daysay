<script>
  import { createEventDispatcher } from 'svelte';
  import { themeService } from '$lib/services/theme';
  import MoodSelector from './MoodSelector.svelte';
  import { formatDate } from './utils';
  
  // Journal entry data and event handlers
  export let entry = { date: '', title: '', content: [], mood: 'neutral', tags: [] };
  export let onSave = () => {};
  export let onCancel = () => {};
  
  const dispatch = createEventDispatcher();
  
  // Working copies for editing
  let editedTitle = entry.title || '';
  let editedContent = '';
  let editedMood = entry.mood || 'neutral';
  let editedTags = [...(entry.tags || [])];
  let newTag = '';
  
  // If entry has content, join it into a single string for editing
  $: if (entry.content && entry.content.length > 0) {
    editedContent = entry.content.map(p => p.text).join('\n\n');
  }
  
  // Format date for display
  $: formattedDate = formatDate(entry.date);
  
  function handleSave() {
    // Prepare updated entry
    const updatedEntry = {
      ...entry,
      title: editedTitle.trim(),
      mood: editedMood,
      tags: [...editedTags]
    };
    
    // Process content if it was edited
    if (editedContent.trim()) {
      // Split content into paragraphs and create content items
      const paragraphs = editedContent
        .split('\n\n')
        .filter(p => p.trim().length > 0)
        .map((text, index) => ({
          id: `p_${Date.now()}_${index}`,
          text: text.trim(),
          timestamp: new Date().toISOString()
        }));
      
      updatedEntry.content = paragraphs;
    }
    
    onSave(updatedEntry);
  }
  
  function handleMoodChange(event) {
    editedMood = event.detail;
  }
  
  function addTag() {
    if (newTag.trim() && !editedTags.includes(newTag.trim().toLowerCase())) {
      editedTags = [...editedTags, newTag.trim().toLowerCase()];
      newTag = '';
    }
  }
  
  function removeTag(tag) {
    editedTags = editedTags.filter(t => t !== tag);
  }
  
  function handleTagKeydown(event) {
    if (event.key === 'Enter') {
      event.preventDefault();
      addTag();
    }
  }
</script>

<div class="entry-editor bg-white rounded-lg shadow-lg p-4 sm:p-6">
  <div class="flex flex-col gap-4">
    <!-- Header: Date & Title -->
    <div class="flex flex-col gap-1">
      <div class="text-sm font-medium text-gray-500">
        {formattedDate}
      </div>
      
      <div class="flex flex-col gap-2">
        <label for="entry-title" class="text-sm font-medium text-gray-700">Title</label>
        <input 
          id="entry-title"
          class="input input-bordered w-full"
          placeholder="Give your entry a title..."
          bind:value={editedTitle}
        />
      </div>
    </div>
    
    <!-- Mood Selector -->
    <MoodSelector selectedMood={editedMood} on:mood={handleMoodChange} />
    
    <!-- Content Editor -->
    <div class="flex flex-col gap-2">
      <label for="entry-content" class="text-sm font-medium text-gray-700">Journal Entry</label>
      <textarea
        id="entry-content"
        class="textarea textarea-bordered w-full h-56"
        placeholder="Write about your day..."
        bind:value={editedContent}
      ></textarea>
      <p class="text-xs text-gray-500">Use double line breaks to separate paragraphs.</p>
    </div>
    
    <!-- Tags -->
    <div class="flex flex-col gap-2">
      <label for="entry-tags" class="text-sm font-medium text-gray-700">Tags</label>
      <div class="flex gap-2 flex-wrap mb-2">
        {#each editedTags as tag}
          <span class="badge badge-sm bg-{themeService.getCurrentTheme()}-100 text-{themeService.getCurrentTheme()}-800 border-{themeService.getCurrentTheme()}-200">
            #{tag}
            <button class="ml-1 text-xs opacity-70 hover:opacity-100" on:click={() => removeTag(tag)}>
              ×
            </button>
          </span>
        {/each}
      </div>
      <div class="flex gap-2">
        <input 
          id="entry-tags"
          class="input input-bordered input-sm flex-grow"
          placeholder="Add a tag..."
          bind:value={newTag}
          on:keydown={handleTagKeydown}
        />
        <button 
          class="btn btn-sm btn-{themeService.getCurrentTheme()}" 
          on:click={addTag}
          disabled={!newTag.trim()}
        >
          Add
        </button>
      </div>
    </div>
    
    <!-- Actions -->
    <div class="flex justify-end gap-2 mt-4">
      <button 
        class="btn btn-ghost"
        on:click={onCancel}
      >
        Cancel
      </button>
      <button 
        class="btn btn-{themeService.getCurrentTheme()}"
        on:click={handleSave}
        disabled={!editedTitle.trim() && !editedContent.trim()}
      >
        Save Entry
      </button>
    </div>
  </div>
</div>

<style>
  .entry-editor {
    width: 100%;
    max-width: 768px;
    margin: 0 auto;
  }
  
  /* Style for textarea with better spacing */
  :global(.entry-editor textarea) {
    line-height: 1.6;
    font-size: 1rem;
  }
</style>