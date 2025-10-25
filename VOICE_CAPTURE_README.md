# Voice Capture Integration for Access Mars

This implementation adds voice capture functionality to the Access Mars WebVR experience, allowing users to interact with an AI tutor through speech.

## Features

- **Automatic Voice Capture**: Starts listening when the page loads
- **Real-time Speech Recognition**: Uses Web Speech API for continuous voice input
- **AI Integration**: Connects to ElevenLabs TTS, Google Gemini, and AI Tutor services
- **Visual Feedback**: Shows voice capture status and transcripts in the UI
- **Error Handling**: Graceful fallbacks for unsupported browsers or API failures

## Architecture

### Core Components

1. **VoiceCaptureService** (`src/js/services/voiceCaptureService.js`)
   - Manages Web Speech API integration
   - Handles continuous voice recognition
   - Processes transcripts and triggers AI responses

2. **AI Services** (`src/js/services/aiServices.js`)
   - ElevenLabsService: Text-to-speech generation
   - GeminiService: Image analysis and chat functionality
   - AITutorService: Conversational AI tutoring

3. **Text Sanitizer** (`src/js/utils/textSanitizer.js`)
   - Cleans text for speech synthesis
   - Handles math expressions and special characters

4. **Enhanced AudioManager** (`src/js/core/audio-manager.js`)
   - Integrates voice capture with existing audio system
   - Provides unified API for voice and audio management

## Setup Instructions

### 1. Environment Variables

Create a `.env.local` file in the project root with your API keys:

```bash
# ElevenLabs API Key
VITE_ELEVEN_LABS_API_KEY=your_eleven_labs_api_key_here

# Google Gemini API Key
VITE_GEMINI_API_KEY=your_gemini_api_key_here
```

### 2. API Key Setup

**ElevenLabs API Key:**
1. Sign up at [ElevenLabs](https://elevenlabs.io/)
2. Go to Settings > API Keys
3. Generate a new API key
4. Add it to your `.env.local` file

**Google Gemini API Key:**
1. Visit [Google AI Studio](https://makersuite.google.com/app/apikey)
2. Create a new API key
3. Add it to your `.env.local` file

### 3. Browser Requirements

Voice capture requires a modern browser with Web Speech API support:
- Chrome (recommended)
- Edge
- Safari (limited support)
- Firefox (limited support)

## Usage

### Automatic Startup

Voice capture starts automatically when the page loads:

1. Page loads and initializes the Mars terrain
2. ElevenLabs TTS plays welcome message
3. Voice capture UI appears in top-right corner
4. Voice recognition starts automatically
5. AI tutor becomes available for conversation

### Voice Interaction

- **Speak naturally**: The system listens continuously
- **Ask questions**: "What is this terrain?" or "Tell me about Curiosity"
- **Get responses**: AI tutor responds with speech and visual feedback
- **Visual feedback**: Transcript appears in the UI panel

### UI Elements

- **Voice Status**: Shows current listening state (Listening, Stopped, Error)
- **Transcript Display**: Shows what you said (disappears after 5 seconds)
- **Color Coding**: Green = listening, Yellow = stopped, Red = error

## API Integration

### ElevenLabs Integration

The system uses ElevenLabs for high-quality text-to-speech:

```javascript
// Example usage
const elevenLabs = new ElevenLabsService(apiKey);
await elevenLabs.speak("Hello, welcome to Mars!", "21m00Tcm4TlvDq8ikWAM");
```

### Gemini Integration

Google Gemini provides AI analysis and conversation:

```javascript
// Example usage
const gemini = new GeminiService(apiKey);
const response = await gemini.chat(messages, systemPrompt);
```

### AI Tutor Service

The AI Tutor provides contextual math tutoring:

```javascript
// Example usage
const tutor = new AITutorService({
  pushinessLevel: 3,
  conversationHistory: []
});
const response = await tutor.getResponse(userMessage, imageDataUrl);
```

## Customization

### Voice Settings

Modify voice parameters in `VoiceCaptureService`:

```javascript
// Recognition settings
this.recognition.continuous = true;
this.recognition.interimResults = true;
this.recognition.lang = 'en-US';
```

### AI Behavior

Adjust tutor behavior in `AITutorService`:

```javascript
// Pushiness levels: 1 (minimal) to 5 (maximum assistance)
const tutor = new AITutorService({
  pushinessLevel: 3, // Balanced approach
  conversationHistory: []
});
```

### UI Styling

Customize the voice capture UI in `public/index.html`:

```html
<div id="voice-capture-ui" style="position: fixed; top: 20px; right: 20px; ...">
  <!-- UI elements -->
</div>
```

## Error Handling

The system includes comprehensive error handling:

- **Browser Support**: Graceful fallback for unsupported browsers
- **API Failures**: Retry logic and user-friendly error messages
- **Network Issues**: Timeout handling and offline detection
- **Permission Denied**: Clear instructions for microphone access

## Troubleshooting

### Common Issues

1. **"Voice capture not supported"**
   - Use Chrome or Edge browser
   - Ensure HTTPS connection (required for microphone access)

2. **"Failed to start voice capture"**
   - Check microphone permissions
   - Ensure microphone is not in use by another application

3. **"API key not found"**
   - Verify `.env.local` file exists
   - Check API key format and validity
   - Restart development server after adding keys

4. **No AI responses**
   - Check network connection
   - Verify API keys are valid and have sufficient quota
   - Check browser console for error messages

### Debug Mode

Enable detailed logging by opening browser console:

```javascript
// Check voice capture status
console.log(AudioManager.getVoiceCaptureStatus());

// Check AI services
console.log(AudioManager.getAIServices());
```

## Security Considerations

- API keys are exposed to the browser (prefixed with `VITE_`)
- Use environment variables for development only
- For production, implement server-side API proxy
- Add `.env.local` to `.gitignore` to prevent key exposure

## Future Enhancements

Potential improvements for the voice capture system:

1. **Multi-language Support**: Add support for different languages
2. **Voice Commands**: Implement specific voice commands for navigation
3. **Offline Mode**: Add offline speech recognition fallback
4. **Custom Voices**: Allow users to choose different AI voices
5. **Conversation Memory**: Persist conversation history across sessions
6. **Visual Analysis**: Integrate camera input for visual problem solving

## Contributing

When contributing to the voice capture system:

1. Test in multiple browsers
2. Ensure graceful degradation for unsupported features
3. Add comprehensive error handling
4. Update documentation for new features
5. Follow existing code style and patterns
