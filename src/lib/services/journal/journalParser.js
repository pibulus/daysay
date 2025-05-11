/**
 * @typedef {Object} JournalParserConfig
 * @property {boolean} [debug=false] - Enable debug logging.
 * @property {Array<string>} [newEntryKeywords] - Keywords for creating a new journal entry.
 * @property {Array<string>} [todayEntryKeywords] - Keywords for today's entry.
 * @property {Array<string>} [yesterdayEntryKeywords] - Keywords for yesterday's entry.
 * @property {Array<string>} [continueEntryKeywords] - Keywords for continuing the current entry.
 * @property {Array<string>} [setMoodKeywords] - Keywords for setting the mood.
 * @property {Array<string>} [addTagKeywords] - Keywords for adding tags.
 * @property {Object} [moodIndicators] - Mapping of keywords to mood values.
 */

export class JournalParser {
  /**
   * @param {JournalParserConfig} config
   */
  constructor(config = {}) {
    this.config = {
      debug: false,
      newEntryKeywords: ['new entry', 'start new entry', 'create new entry', 'begin new entry'],
      todayEntryKeywords: ['today\'s entry', 'entry for today', 'write about today'],
      yesterdayEntryKeywords: ['yesterday\'s entry', 'entry for yesterday', 'write about yesterday'],
      continueEntryKeywords: ['continue entry', 'continue this entry', 'add to entry', 'add to current entry'],
      setMoodKeywords: ['set mood to', 'my mood is', 'i feel', 'feeling'],
      addTagKeywords: ['add tag', 'new tag', 'create tag', 'tag this', 'tag as', 'hashtag'],
      moodIndicators: {
        happy: ['happy', 'glad', 'excited', 'joyful', 'pleased', 'delighted', 'content', 'cheerful'],
        sad: ['sad', 'unhappy', 'depressed', 'down', 'blue', 'gloomy', 'miserable', 'upset'],
        angry: ['angry', 'mad', 'frustrated', 'annoyed', 'irritated', 'furious', 'enraged'],
        anxious: ['anxious', 'nervous', 'worried', 'uneasy', 'stressed', 'concerned', 'scared', 'fearful'],
        tired: ['tired', 'exhausted', 'sleepy', 'fatigued', 'drained', 'weary'],
        calm: ['calm', 'peaceful', 'relaxed', 'serene', 'tranquil', 'at ease', 'chill'],
        neutral: ['neutral', 'okay', 'fine', 'so-so', 'average', 'normal', 'neither good nor bad'],
        surprised: ['surprised', 'shocked', 'astonished', 'amazed', 'startled', 'stunned'],
        proud: ['proud', 'accomplished', 'satisfied', 'confident', 'successful'],
        grateful: ['grateful', 'thankful', 'appreciative', 'blessed', 'fortunate'],
      },
      ...config
    };
  }

  log(message) {
    if (this.config.debug) {
      console.log(`[JournalParser] ${message}`);
    }
  }

  /**
   * Parses transcribed text to extract content and journal commands.
   * @param {string} transcribedText - The text from the transcription service.
   * @returns {{text: string, commands: Array<Object>, mood: string|null, tags: Array<string>}} 
   *          An object containing the processed text, commands, detected mood, and tags.
   */
  parse(transcribedText) {
    this.log(`Parsing text: "${transcribedText}"`);
    const commands = [];
    let text = transcribedText;
    const detectedTags = [];
    let detectedMood = null;

    if (!text || text.trim() === '') {
      return { text: '', commands, mood: null, tags: [] };
    }

    // Check for commands at the beginning of the text first 
    // These are explicit commands that should be processed as directives
    const commandResult = this._extractCommands(text);
    commands.push(...commandResult.commands);
    text = commandResult.text;
    
    // Process hashtags/tags in the text
    const tagResult = this._extractTags(text);
    text = tagResult.text;
    detectedTags.push(...tagResult.tags);
    
    // Try to determine the mood from the text
    detectedMood = this._detectMood(text);
    
    // If we detected a mood, add it as a command
    if (detectedMood) {
      commands.push({
        command: 'SET_MOOD',
        params: [detectedMood],
        originalText: `Detected mood: ${detectedMood}`
      });
    }
    
    // Add any tags as commands
    detectedTags.forEach(tag => {
      commands.push({
        command: 'ADD_TAG',
        params: [tag],
        originalText: `Add tag: ${tag}`
      });
    });

    // Clean and normalize the final text
    text = this._cleanText(text);
    
    this.log(`Processed text: "${text}", Commands: ${JSON.stringify(commands)}, Mood: ${detectedMood}, Tags: ${JSON.stringify(detectedTags)}`);
    return { 
      text, 
      commands, 
      mood: detectedMood, 
      tags: detectedTags 
    };
  }

  /**
   * Extract commands from the beginning of the text
   * @param {string} text - The text to process
   * @returns {{text: string, commands: Array<Object>}} Updated text and extracted commands
   * @private
   */
  _extractCommands(text) {
    const commands = [];
    let remainingText = text;
    
    // First pass - Look for explicit commands at the beginning of the text
    const commandMatch = remainingText.match(/^(new entry|today's entry|yesterday's entry|continue entry|set mood to|add tag).*?[.!?]\s*/i);
    
    if (commandMatch) {
      const commandText = commandMatch[0];
      const command = this._identifyCommand(commandText);
      
      if (command.command) {
        commands.push(command);
        
        // Remove the command from the text if we found one
        remainingText = remainingText.substring(commandText.length).trim();
      }
    }
    
    // Second pass - scan the text for embedded commands
    const potentialSentences = remainingText.split(/[.!?]\s+/);
    let processedText = '';
    
    potentialSentences.forEach((sentence, index) => {
      const command = this._identifyCommand(sentence);
      
      if (command.command) {
        commands.push(command);
        // For embedded commands, we might still want to keep the text,
        // but we could remove command-specific parts here if needed
      }
      
      // Rebuild the text, preserving punctuation
      processedText += sentence;
      if (index < potentialSentences.length - 1) {
        processedText += '. ';
      }
    });
    
    return { text: processedText || remainingText, commands };
  }

  /**
   * Extract tags from the text (hashtag style)
   * @param {string} text - The text to process
   * @returns {{text: string, tags: Array<string>}} Updated text and extracted tags
   * @private 
   */
  _extractTags(text) {
    const tags = [];
    let updatedText = text;
    
    // Find hashtag style tags (#tag)
    const hashtagRegex = /#([a-zA-Z0-9_]+)/g;
    let match;
    
    while ((match = hashtagRegex.exec(text)) !== null) {
      tags.push(match[1].toLowerCase());
    }
    
    // Remove hashtags from the text to keep it clean
    updatedText = updatedText.replace(hashtagRegex, '');
    
    // Also look for explicit tag mentions ("tag this as work")
    for (const keyword of this.config.addTagKeywords) {
      const tagRegex = new RegExp(`${keyword}\\s+([a-zA-Z0-9_]+)`, 'gi');
      
      while ((match = tagRegex.exec(text)) !== null) {
        tags.push(match[1].toLowerCase());
        
        // Remove the tag command from the text
        updatedText = updatedText.replace(match[0], '');
      }
    }
    
    return { text: updatedText.trim(), tags: [...new Set(tags)] }; // Deduplicate tags
  }

  /**
   * Attempt to detect the mood from the text content
   * @param {string} text - The journal text
   * @returns {string|null} The detected mood or null
   * @private
   */
  _detectMood(text) {
    const lowerText = text.toLowerCase();
    
    // First check for explicit mood statements
    for (const keyword of this.config.setMoodKeywords) {
      const moodRegex = new RegExp(`${keyword}\\s+([a-zA-Z]+)`, 'i');
      const match = lowerText.match(moodRegex);
      
      if (match && match[1]) {
        const statedMood = match[1].toLowerCase();
        
        // Check if this directly matches one of our mood keys
        if (this.config.moodIndicators[statedMood]) {
          return statedMood;
        }
        
        // Otherwise check if it matches any mood indicators
        for (const [mood, indicators] of Object.entries(this.config.moodIndicators)) {
          if (indicators.includes(statedMood)) {
            return mood;
          }
        }
      }
    }
    
    // If no explicit mood, scan for mood indicators throughout the text
    const moodCounts = {};
    
    for (const [mood, indicators] of Object.entries(this.config.moodIndicators)) {
      moodCounts[mood] = 0;
      
      indicators.forEach(indicator => {
        // Create a regex that looks for whole words
        const regex = new RegExp(`\\b${indicator}\\b`, 'gi');
        const matches = lowerText.match(regex);
        
        if (matches) {
          moodCounts[mood] += matches.length;
        }
      });
    }
    
    // Find the mood with the highest count
    let highestCount = 0;
    let detectedMood = null;
    
    for (const [mood, count] of Object.entries(moodCounts)) {
      if (count > highestCount) {
        highestCount = count;
        detectedMood = mood;
      }
    }
    
    return highestCount > 0 ? detectedMood : null;
  }

  /**
   * Cleans and normalizes the text.
   * @param {string} text - The text to clean.
   * @returns {string} The cleaned text.
   * @private
   */
  _cleanText(text) {
    let cleanedText = text;
    
    // Remove any remaining command keywords
    for (const keywordArray of [
      this.config.newEntryKeywords,
      this.config.todayEntryKeywords,
      this.config.yesterdayEntryKeywords,
      this.config.continueEntryKeywords
    ]) {
      for (const keyword of keywordArray) {
        const regex = new RegExp(`^${keyword}\\s*`, 'i');
        cleanedText = cleanedText.replace(regex, '');
      }
    }
    
    // Remove mood statements
    for (const keyword of this.config.setMoodKeywords) {
      const moodRegex = new RegExp(`${keyword}\\s+[a-zA-Z]+[.!?]?\\s*`, 'i');
      cleanedText = cleanedText.replace(moodRegex, '');
    }
    
    // Clean up extra spaces
    cleanedText = cleanedText.replace(/\s+/g, ' ').trim();
    
    return cleanedText;
  }

  /**
   * Identifies journal commands in text.
   * @param {string} text - The text to check for commands.
   * @returns {{command: string|null, params: Array<string>, originalText: string}} Command info.
   * @private
   */
  _identifyCommand(text) {
    const lowerText = text.toLowerCase();

    // Check for new entry commands
    for (const keyword of this.config.newEntryKeywords) {
      if (lowerText.includes(keyword)) {
        this.log(`Identified command: NEW_ENTRY from "${text}"`);
        return { command: 'NEW_ENTRY', params: [], originalText: text };
      }
    }
    
    // Check for today's entry commands
    for (const keyword of this.config.todayEntryKeywords) {
      if (lowerText.includes(keyword)) {
        this.log(`Identified command: TODAY_ENTRY from "${text}"`);
        return { command: 'TODAY_ENTRY', params: [], originalText: text };
      }
    }
    
    // Check for yesterday's entry commands
    for (const keyword of this.config.yesterdayEntryKeywords) {
      if (lowerText.includes(keyword)) {
        this.log(`Identified command: YESTERDAY_ENTRY from "${text}"`);
        return { command: 'YESTERDAY_ENTRY', params: [], originalText: text };
      }
    }
    
    // Check for continue entry commands
    for (const keyword of this.config.continueEntryKeywords) {
      if (lowerText.includes(keyword)) {
        this.log(`Identified command: CONTINUE_ENTRY from "${text}"`);
        return { command: 'CONTINUE_ENTRY', params: [], originalText: text };
      }
    }
    
    // Check for mood setting commands
    for (const keyword of this.config.setMoodKeywords) {
      const moodRegex = new RegExp(`${keyword}\\s+([a-zA-Z]+)`, 'i');
      const match = lowerText.match(moodRegex);
      
      if (match && match[1]) {
        const moodParam = match[1].toLowerCase();
        this.log(`Identified command: SET_MOOD from "${text}" with param "${moodParam}"`);
        return { command: 'SET_MOOD', params: [moodParam], originalText: text };
      }
    }
    
    // Check for tag commands
    for (const keyword of this.config.addTagKeywords) {
      const tagRegex = new RegExp(`${keyword}\\s+([a-zA-Z0-9_]+)`, 'i');
      const match = lowerText.match(tagRegex);
      
      if (match && match[1]) {
        const tagParam = match[1].toLowerCase();
        this.log(`Identified command: ADD_TAG from "${text}" with param "${tagParam}"`);
        return { command: 'ADD_TAG', params: [tagParam], originalText: text };
      }
    }

    return { command: null, params: [], originalText: text };
  }
}

// Export a singleton instance with debugging enabled in development mode
export const journalParser = new JournalParser({ 
  debug: process.env.NODE_ENV === 'development' 
});