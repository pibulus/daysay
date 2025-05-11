// Collection of different prompt templates organized by style for journal entries

export const promptTemplates = {
  // Standard prompt style (default journal implementation)
  standard: {
    transcribeAudio: {
      text:
`Process this audio file into a structured JSON format for a journal entry.
The response MUST be valid JSON with ONLY this structure:

{
  "text": "The main content of the journal entry...",
  "mood": "happy|sad|reflective|anxious|neutral|etc",
  "tags": ["tag1", "tag2", "tag3"],
  "commands": [
    {
      "command": "NEW_ENTRY|TODAY_ENTRY|YESTERDAY_ENTRY|CONTINUE_ENTRY|SET_MOOD|ADD_TAG",
      "params": ["optional parameter"]
    }
  ]
}

Processing Requirements:
1. Extract the main journal content while preserving natural language flow
2. Identify the overall mood/sentiment expressed in the entry
3. Extract any meaningful tags mentioned or implied in the content
4. Recognize journal commands like "new entry", "continue", "yesterday's entry", etc.
5. Format the text naturally with proper capitalization and paragraphs
6. Return ONLY the raw JSON without any explanation, markdown formatting, or code blocks
7. The response must be valid, parseable JSON
8. Do not add any text outside the JSON structure

Journal Commands to Identify:
- "new entry", "start fresh" → NEW_ENTRY
- "today's entry", "for today" → TODAY_ENTRY
- "yesterday's entry", "for yesterday" → YESTERDAY_ENTRY
- "continue", "add to this" → CONTINUE_ENTRY
- "I feel [emotion]", "my mood is [emotion]" → SET_MOOD with [emotion] parameter
- "tag this as [tag]", "add tag [tag]" → ADD_TAG with [tag] parameter

Example valid response:
{"text":"Today I went for a long walk in the park. The weather was perfect and I spotted several birds I hadn't seen before.","mood":"happy","tags":["outdoors","nature","birds"],"commands":[]}`,
    },
    generateAnimation: {
      text:
`Generate a CSS animation for a ghost SVG based on this description: '{{description}}'.
Return a JSON object with the following structure:

{
  "name": "unique-animation-name", // A unique, descriptive kebab-case name for the animation
  "target": "whole" or "eyes" or "bg" or "outline", // Which part of the ghost to animate
  "duration": value in seconds, // Reasonable animation duration (0.5-3s)
  "timing": "ease"/"linear"/"cubic-bezier(x,x,x,x)", // Appropriate timing function
  "iteration": number or "infinite", // How many times to play (usually 1 or infinite)
  "keyframes": [
    {
      "percentage": 0, // Keyframe percentage (0-100)
      "properties": { // CSS properties to animate
        "transform": "...", // Any transform functions
        "opacity": value, // Opacity value if needed
        // Other properties as needed
      }
    },
    // More keyframes as needed
  ],
  "description": "Short description of what this animation does"
}

Critical requirements:
1. Make sure the animation is visually appealing and matches the description
2. Use ONLY transform properties (scale, rotate, translate, etc.) and opacity for animation
3. Avoid properties that would break the SVG (like background-color)
4. Ensure animation starts and ends in a natural state (if not infinite)
5. If the animation should affect only part of the ghost, specify the correct 'target'
6. Ensure all values are valid CSS
7. DO NOT include any explanation or text outside the JSON object
8. Return raw JSON only - DO NOT use markdown formatting or code blocks in your response`,
    },
  },

  // Surly pirate prompt style
  surlyPirate: {
    transcribeAudio: {
      text:
`Process this audio into a structured JSON for a pirate-style journal entry.
Format response as valid JSON with the following structure:

{
  "text": "Arr, 'twas a fine day on the seven seas...",
  "mood": "happy|sad|reflective|anxious|neutral|etc",
  "tags": ["tag1", "tag2", "tag3"],
  "commands": [
    {
      "command": "NEW_ENTRY|TODAY_ENTRY|YESTERDAY_ENTRY|CONTINUE_ENTRY|SET_MOOD|ADD_TAG",
      "params": ["optional parameter"]
    }
  ]
}

Use pirate slang, expressions, and attitude (arr, matey, ye, scallywag, etc.).
Present the journal entry as a pirate's ship log or tale of adventure.
Return ONLY raw JSON, no additional text or formatting.`,
    },
  },

  // L33T Sp34k prompt style
  leetSpeak: {
    transcribeAudio: {
      text:
`Pr0c355 th15 4ud10 1nt0 4 5tructur3d J50N f0r 4 l33t 5p34k j0urn4l 3ntry.
F0rm4t r35p0n53 45 v4l1d J50N w1th th15 5tructur3:

{
  "text": "70d4y 1 h4ck3d my w4y 1nt0 th3...",
  "mood": "h4ppy|54d|r3fl3ct1v3|4nx10u5|n3utr4l|3tc",
  "tags": ["t4g1", "t4g2", "t4g3"],
  "commands": [
    {
      "command": "NEW_ENTRY|TODAY_ENTRY|YESTERDAY_ENTRY|CONTINUE_ENTRY|SET_MOOD|ADD_TAG",
      "params": ["0pt10n4l p4r4m3t3r"]
    }
  ]
}

U53 num3r1c 5ub5t1tut10n5 (3=e, 4=a, 1=i, 0=o, 5=s, 7=t) 4nd h4ck3r j4rg0n.
R3turn 0NLY r4w J50N, n0 4dd1t10n4l t3xt.`,
    },
  },

  // Sparkle Pop prompt style
  sparklePop: {
    transcribeAudio: {
      text:
`OMG!!! Process this audio into a structured JSON for a SUPER bubbly journal entry!!!
Format response as valid JSON with this structure:

{
  "text": "OMG today was LITERALLY the BEST day ever!!! ✨💖...",
  "mood": "happy|sad|reflective|anxious|neutral|etc",
  "tags": ["tag1", "tag2", "tag3"],
  "commands": [
    {
      "command": "NEW_ENTRY|TODAY_ENTRY|YESTERDAY_ENTRY|CONTINUE_ENTRY|SET_MOOD|ADD_TAG",
      "params": ["optional parameter"]
    }
  ]
}

Make the journal entry EXTRA bubbly with emojis, excitement, and teen slang!!!
Use words like 'literally,' 'totally,' 'sooo,' 'vibes,' and 'obsessed'!!!
Return ONLY raw JSON, no additional text or formatting!!!`,
    },
  },

  // Code Whisperer style
  codeWhisperer: {
    transcribeAudio: {
      text:
`Process this audio into a structured JSON for a technical, precise journal entry.
Format response as valid JSON with the following structure:

{
  "text": "Implemented new algorithm for processing data structures...",
  "mood": "productive|frustrated|curious|focused|neutral|etc",
  "tags": ["coding", "algorithm", "debugging", "etc"],
  "commands": [
    {
      "command": "NEW_ENTRY|TODAY_ENTRY|YESTERDAY_ENTRY|CONTINUE_ENTRY|SET_MOOD|ADD_TAG",
      "params": ["optional parameter"]
    }
  ]
}

Use clear, structured, technical language suitable for a programmer's journal.
Organize logically, use precise terminology, maintain analytical tone.
Return ONLY raw JSON, no additional text or formatting.`,
    },
  },

  // Quill & Ink style
  quillAndInk: {
    transcribeAudio: {
      text:
`Process this audio into a structured JSON for an eloquent Victorian-style journal entry.
Format response as valid JSON with the following structure:

{
  "text": "Upon the morrow of a most delightful spring day, I found myself wandering...",
  "mood": "joyful|melancholic|contemplative|anxious|serene|etc",
  "tags": ["nature", "philosophy", "society", "etc"],
  "commands": [
    {
      "command": "NEW_ENTRY|TODAY_ENTRY|YESTERDAY_ENTRY|CONTINUE_ENTRY|SET_MOOD|ADD_TAG",
      "params": ["optional parameter"]
    }
  ]
}

Employ the eloquence and stylistic flourishes of a 19th century Victorian personal diary.
Use elaborate sentences, period-appropriate vocabulary, and literary devices.
Return ONLY raw JSON, no additional text or formatting.`,
    },
  },
};

// Helper function to apply template with variables
export function applyTemplate(template, variables) {
  let result = template;

  // Replace all variables in the template
  Object.entries(variables).forEach(([key, value]) => {
    const regex = new RegExp(`{{${key}}}`, "g");
    result = result.replace(regex, value);
  });

  return result;
}
