<script>
  import { createEventDispatcher } from 'svelte';
  import { themeService } from '$lib/services/theme';
  import { getMoodEmoji } from './utils';
  
  export let selectedMood = 'neutral';
  export let title = 'How are you feeling?';
  export let compact = false;
  
  const dispatch = createEventDispatcher();
  
  // Available moods with emojis and descriptions
  const moods = [
    { id: 'happy', emoji: '😊', label: 'Happy' },
    { id: 'sad', emoji: '😢', label: 'Sad' },
    { id: 'neutral', emoji: '😐', label: 'Neutral' },
    { id: 'excited', emoji: '🤩', label: 'Excited' },
    { id: 'tired', emoji: '😴', label: 'Tired' },
    { id: 'angry', emoji: '😠', label: 'Angry' },
    { id: 'anxious', emoji: '😰', label: 'Anxious' },
    { id: 'calm', emoji: '😌', label: 'Calm' },
    { id: 'surprised', emoji: '😲', label: 'Surprised' },
    { id: 'proud', emoji: '😄', label: 'Proud' },
    { id: 'grateful', emoji: '🙏', label: 'Grateful' }
  ];
  
  function selectMood(mood) {
    selectedMood = mood;
    dispatch('mood', mood);
  }
</script>

<div class="mood-selector {compact ? 'compact' : ''}">
  {#if !compact}
    <h3 class="text-sm font-medium text-gray-700 mb-2">{title}</h3>
  {/if}
  
  <div class="mood-grid">
    {#each moods as mood}
      <button 
        class="mood-button {selectedMood === mood.id ? 'selected' : ''}" 
        on:click={() => selectMood(mood.id)}
        title={mood.label}
      >
        <span class="mood-emoji">{mood.emoji}</span>
        {#if !compact}
          <span class="mood-label">{mood.label}</span>
        {/if}
      </button>
    {/each}
  </div>
</div>

<style>
  .mood-selector {
    width: 100%;
    margin-bottom: 1rem;
  }
  
  .mood-selector.compact {
    margin-bottom: 0.5rem;
  }
  
  .mood-grid {
    display: flex;
    flex-wrap: wrap;
    gap: 0.5rem;
    justify-content: center;
  }
  
  .mood-button {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 0.25rem;
    padding: 0.5rem;
    border-radius: 0.5rem;
    border: 1px solid transparent;
    background-color: #f9f9f9;
    cursor: pointer;
    transition: all 0.2s ease;
  }
  
  .mood-selector.compact .mood-button {
    padding: 0.3rem;
  }
  
  .mood-button:hover {
    background-color: #f0f0f0;
    transform: translateY(-2px);
  }
  
  .mood-button.selected {
    border-color: var(--color-primary, #0ea5e9);
    background-color: rgba(14, 165, 233, 0.1);
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  }
  
  .mood-emoji {
    font-size: 1.5rem;
    line-height: 1;
  }
  
  .mood-selector.compact .mood-emoji {
    font-size: 1.25rem;
  }
  
  .mood-label {
    font-size: 0.75rem;
    color: #666;
    white-space: nowrap;
  }
</style>