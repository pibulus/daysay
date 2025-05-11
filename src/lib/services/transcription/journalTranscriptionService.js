import { geminiService as defaultGeminiService } from '$lib/services/geminiService';
import { journalParser } from '../journal/journalParser.js';
import { journalService } from '../journal/journalService.js';
import { transcriptionState, transcriptionActions, uiActions } from '../infrastructure/stores';
import { transcriptionCompletedEvent } from '../infrastructure/stores.js';
import { journalGhostAnimations } from '../../components/ghost/journalGhostExtensions';
import { COPY_MESSAGES, ATTRIBUTION, getRandomFromArray } from '$lib/constants';
import { get } from 'svelte/store';

export const JournalTranscriptionEvents = {
  TRANSCRIPTION_STARTED: 'transcription:started',
  TRANSCRIPTION_PROGRESS: 'transcription:progress',
  TRANSCRIPTION_COMPLETED: 'transcription:completed',
  TRANSCRIPTION_ERROR: 'transcription:error',
  TRANSCRIPTION_COPIED: 'transcription:copied',
  TRANSCRIPTION_SHARED: 'transcription:shared'
};

export class JournalTranscriptionService {
  constructor(dependencies = {}) {
    this.geminiService = dependencies.geminiService || defaultGeminiService;
    this.browser = typeof window !== 'undefined';
    this.lastTranscriptionTimestamp = null;
  }
  
  async transcribeAudio(audioBlob) {
    try {
      if (!audioBlob || !(audioBlob instanceof Blob)) {
        throw new Error('Invalid audio data provided');
      }

      // Update transcription state to show in-progress
      transcriptionActions.startTranscribing();
      this.lastTranscriptionTimestamp = Date.now();

      // Start progress animation
      this.startProgressAnimation();

      // Transcribe using Gemini - now returns structured journal data
      const journalData = await this.geminiService.transcribeAudio(audioBlob);

      // Complete progress animation with smooth transition
      this.completeProgressAnimation();

      // Could be direct from Gemini or from our legacy parser
      const { text, commands, mood, tags } = journalData;

      console.log('Journal data from transcription:', journalData);

      // Update transcription state with completed text and parsed data
      // The transcriptionCompletedEvent will be triggered internally by the store subscription
      transcriptionActions.completeTranscription({
        rawText: text,
        items: [text], // For backward compatibility
        commands: commands || []
      });

      // Make ghost react to journal entry length
      journalGhostAnimations.reactToJournalEntry(text.length);

      // Create a properly formatted result for processing
      const parsedResult = {
        text,
        commands: commands || [],
        mood: mood || null,
        tags: tags || []
      };

      // Send parsed result to journalService for processing
      await this.processJournalEntry(parsedResult);

      return parsedResult;

    } catch (error) {
      console.error('Transcription error:', error);

      // Update state to show error
      transcriptionActions.setTranscriptionError(error.message || 'Unknown transcription error');

      throw error;
    }
  }
  
  startProgressAnimation() {
    let progress = 0;
    const animate = () => {
      if (!get(transcriptionState).inProgress) return;
      
      progress = Math.min(95, progress + 1);
      
      // Update store with current progress
      transcriptionActions.updateProgress(progress);
      
      if (progress < 95) {
        setTimeout(animate, 50);
      }
    };
    
    // Start animation loop
    animate();
  }
  
  completeProgressAnimation() {
    let progress = 95;
    
    const complete = () => {
      progress = Math.min(100, progress + (100 - progress) * 0.2);
      
      // Update store with current progress
      transcriptionActions.updateProgress(progress);
      
      if (progress < 99.5) {
        requestAnimationFrame(complete);
      } else {
        transcriptionActions.updateProgress(100);
      }
    };
    
    // Start completion animation
    requestAnimationFrame(complete);
  }
  
  async copyToClipboard(text) {
    if (!text) {
      text = get(transcriptionState).text;
    }
    
    if (!text || text.trim() === '') {
      uiActions.setErrorMessage('No text available to copy');
      return false;
    }
    
    try {
      // Add attribution
      const textWithAttribution = `${text}\n\n${ATTRIBUTION.SIMPLE_TAG}`;
      
      // Try the modern clipboard API first
      if (navigator.clipboard && window.isSecureContext) {
        await navigator.clipboard.writeText(textWithAttribution);
        uiActions.showClipboardSuccess();
        uiActions.setScreenReaderMessage('Journal entry copied to clipboard');
        return true;
      }
      
      // Fallback: Use document.execCommand (legacy method)
      const textArea = document.createElement('textarea');
      textArea.value = textWithAttribution;
      textArea.style.position = 'fixed';
      textArea.style.opacity = '0';
      document.body.appendChild(textArea);
      textArea.focus();
      textArea.select();
      
      const success = document.execCommand('copy');
      document.body.removeChild(textArea);
      
      if (success) {
        uiActions.showClipboardSuccess();
        uiActions.setScreenReaderMessage('Journal entry copied to clipboard');
      } else {
        uiActions.setScreenReaderMessage('Unable to copy. Please try clicking in the window first.');
      }
      
      return success;
      
    } catch (error) {
      console.error('Clipboard copy error:', error);
      
      uiActions.setErrorMessage(`Copy failed: ${error.message || 'Unknown error'}`);
      uiActions.setScreenReaderMessage('Unable to copy. Please try clicking in the window first.');
      
      return false;
    }
  }
  
  async shareTranscript(text) {
    if (!text) {
      text = get(transcriptionState).text;
    }
    
    if (!text || text.trim() === '') {
      uiActions.setErrorMessage('No journal entry available to share');
      return false;
    }
    
    try {
      // Check if Web Share API is available
      if (!navigator.share) {
        throw new Error('Web Share API not supported');
      }
      
      // Add attribution
      const textWithAttribution = `${text}${ATTRIBUTION.SHARE_POSTFIX}`;
      
      // Share using Web Share API
      await navigator.share({
        title: 'DaySay Journal Entry',
        text: textWithAttribution
      });
      
      uiActions.showClipboardSuccess();
      uiActions.setScreenReaderMessage('Journal entry shared successfully');
      return true;
      
    } catch (error) {
      // Don't treat user cancellation as an error
      if (error.name === 'AbortError') {
        return false;
      }
      
      console.error('Share error:', error);
      
      // Try fallback to clipboard if sharing fails
      if (error.message === 'Web Share API not supported') {
        return this.copyToClipboard(text);
      }
      
      uiActions.setErrorMessage(`Share failed: ${error.message || 'Unknown error'}`);
      return false;
    }
  }
  
  isTranscribing() {
    return get(transcriptionState).inProgress;
  }
  
  getCurrentTranscript() {
    return get(transcriptionState).text;
  }
  
  clearTranscript() {
    // Use completeTranscription with empty values, which will trigger the event internally
    transcriptionActions.completeTranscription({
      rawText: '',
      items: [],
      commands: []
    });
  }
  
  getRandomCopyMessage() {
    return getRandomFromArray(COPY_MESSAGES);
  }
  
  isShareSupported() {
    return this.browser && typeof navigator !== 'undefined' &&
           navigator.share && typeof navigator.share === 'function';
  }

  async processJournalEntry(parsedResult) {
    const { text, commands, mood, tags } = parsedResult;

    if (!text || text.trim() === '') {
      console.log('No text content to process for journal entry');
      return;
    }

    // Process any explicit commands first
    if (commands && commands.length > 0) {
      for (const command of commands) {
        switch (command.command) {
          case 'NEW_ENTRY':
            await journalService.createEntry();
            break;
          case 'TODAY_ENTRY':
            await journalService.createTodayEntry();
            break;
          case 'YESTERDAY_ENTRY':
            await journalService.createYesterdayEntry();
            break;
          case 'CONTINUE_ENTRY':
            // Will be handled below as default behavior
            break;
          case 'SET_MOOD':
            if (command.params && command.params.length > 0) {
              journalService.setEntryMood(command.params[0]);
            }
            break;
          case 'ADD_TAG':
            if (command.params && command.params.length > 0) {
              journalService.addEntryTag(command.params[0]);
            }
            break;
        }
      }
    }

    // Add the transcribed text to the current active entry (or create new today's entry if none)
    // Use await since addContentToEntry returns a Promise when creating a new entry
    await journalService.addContentToEntry(text);

    // Set mood if detected
    if (mood) {
      journalService.setEntryMood(mood);

      // Also make the ghost react to the mood
      journalGhostAnimations.reactToJournalMood(mood);
    }

    // Add any tags detected
    if (tags && tags.length > 0) {
      for (const tag of tags) {
        journalService.addEntryTag(tag);
      }
    }
  }
}

export const journalTranscriptionService = new JournalTranscriptionService();