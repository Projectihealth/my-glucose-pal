# Voice-Forward Features

This app now includes comprehensive voice recognition capabilities to make logging activities faster and more natural.

## Features

### 1. Voice-First Activity Logging
- The main "Log" button now defaults to voice input
- Simply tap the microphone button and start speaking
- The app listens and transcribes your speech in real-time
- When you're done, tap again to stop and process your input

### 2. Multi-Activity Detection
**NEW!** The app can now detect and split multiple activities from a single voice input:

**Example:** Say "I went on a walk this morning and I ate six pork dumplings for lunch"

The app will automatically create **two separate entries**:
- **Lifestyle**: Morning walk
- **Food**: Lunch: 6 pork dumplings

You can describe your entire day in one go, and the app will intelligently split it into individual activities!

### 3. Intelligent Parsing
The app automatically extracts structured information from your natural speech:

**Food Logging:**
- "I ate a chicken salad with vegetables"
- "Had oatmeal with berries for breakfast"
- "Just finished a protein shake"

**Medication Logging:**
- "Took 6 units of Humalog before dinner"
- "Administered 20 units of Lantus"
- "Took my metformin 500mg"

**Lifestyle Activities:**
- "Went for a 30 minute walk"
- "Did yoga for 45 minutes"
- "Finished my gym workout"

**Sleep & Stress:**
- "Slept 8 hours last night"
- "Feeling stressed about work today"

### 4. Review & Edit Interface
After speaking, you'll see a review screen showing all detected activities:
- Each activity shown as a colored card (color-coded by category)
- Tap any card to expand and edit details
- Remove unwanted entries with the X button
- Save all at once or go back to re-record

### 5. Three-Mode System
- **Voice Mode (Default)**: Speak naturally to log activities
- **Review Mode**: Edit and confirm parsed activities before saving
- **Manual Mode**: Switch to keyboard input for precise editing
- Toggle between voice and manual modes with the keyboard/microphone icon

### 6. Visual Feedback
- **Pulsing microphone**: Currently listening
- **Animated wave bars**: Audio activity indicator
- **Live transcript**: See your words as you speak
- **Processing indicator**: AI is parsing your input

## Browser Support

Voice recognition works best on:
- ✅ Chrome (Desktop & Mobile)
- ✅ Edge (Desktop & Mobile)
- ✅ Safari (Desktop & iOS)
- ❌ Firefox (Limited support)

## Setup

### Basic Setup (Rule-Based Parsing)
No additional configuration needed! The app uses browser-native Web Speech API and intelligent keyword matching.

### Enhanced Setup (AI-Powered Parsing)
For more accurate parsing, add an OpenAI API key:

1. Get an API key from [OpenAI](https://platform.openai.com/api-keys)
2. Copy `.env.example` to `.env`
3. Add your key:
   ```
   VITE_OPENAI_API_KEY=sk-...
   ```
4. Restart the dev server

**Cost:** Uses GPT-4o-mini (~$0.0001 per log entry)

## How It Works

### Voice Recognition
Uses the Web Speech API (built into modern browsers) for speech-to-text conversion. This happens entirely in the browser with no API calls required.

### Parsing
Two methods are available:

**1. Rule-Based Parsing (Default)**
- Fast and free
- Works offline
- Uses keyword detection and pattern matching
- Accuracy: ~80-85% for common phrases

**2. AI-Powered Parsing (Optional)**
- Uses OpenAI GPT-4o-mini
- Better understanding of natural language
- Handles complex or unusual phrasings
- Accuracy: ~95%+

### Privacy
- **Voice Recognition**: Processed by your browser (Chrome/Safari)
- **AI Parsing** (if enabled): Transcript sent to OpenAI
- No voice recordings are stored
- Only the final structured log is saved to your backend

## Tips for Best Results

1. **Speak clearly** and at a normal pace
2. **Use natural language** - no need for specific commands
3. **Include relevant details**: amounts, times, feelings
4. **Review before saving** - switch to manual mode to verify/edit
5. **Grant microphone permission** when prompted

## Examples

### Single Activity Examples
- "I had two slices of whole wheat toast with peanut butter for breakfast"
- "Took my 10 units of Novolog before lunch"
- "Went for a 45 minute walk in the park, felt great"
- "Feeling anxious about tomorrow's appointment"

### Multi-Activity Examples (NEW!)
- "I went on a walk this morning and I ate six pork dumplings for lunch"
  - → Creates 2 entries: Morning walk + Lunch: 6 pork dumplings

- "Had breakfast with oatmeal and berries, took my metformin, then did 20 minutes of yoga"
  - → Creates 3 entries: Breakfast + Metformin + 20 minutes of yoga

- "Took 6 units of humalog before dinner then went for a short walk"
  - → Creates 2 entries: Humalog (6 units) + Short walk

### Tips for Accuracy
- Mention the category: "ate", "took medication", "did exercise"
- Include quantities: "6 units", "30 minutes", "two servings"
- Add context: "before dinner", "in the morning", "felt good"

## Troubleshooting

### Microphone Not Working
- Check browser permissions (usually in address bar)
- Ensure no other app is using the microphone
- Try refreshing the page

### Poor Recognition
- Reduce background noise
- Speak closer to the microphone
- Use Chrome or Safari for best results

### Incorrect Parsing
- Switch to manual mode to edit the entry
- Try being more specific with category keywords
- Consider adding an OpenAI API key for better AI parsing

## Future Enhancements

Potential improvements for the voice features:
- [x] Multi-activity detection and splitting
- [x] Review and edit interface before saving
- [ ] Multi-language support
- [ ] Offline voice recognition
- [ ] Voice commands for navigation
- [ ] Continuous listening mode
- [ ] Voice feedback/confirmation
- [ ] Custom vocabulary (food brands, specific medications)
- [ ] Custom timestamps per activity (currently all use same timestamp)
