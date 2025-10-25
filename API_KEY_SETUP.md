# API Key Setup Guide

## How to Configure Your API Keys

### 1. ElevenLabs API Key

1. **Sign up/Login**: Go to [ElevenLabs](https://elevenlabs.io/)
2. **Get API Key**: 
   - Click on your profile icon (top right)
   - Go to "Profile" → "API Keys"
   - Click "Create API Key"
   - Copy the generated key
3. **Add to Config**: Open `src/js/config/aiConfig.js` and replace the empty string:
   ```javascript
   ELEVEN_LABS_API_KEY: 'your_actual_api_key_here',
   ```

### 2. Google Gemini API Key

1. **Get API Key**: Go to [Google AI Studio](https://makersuite.google.com/app/apikey)
2. **Create Key**: 
   - Click "Create API Key"
   - Select your Google account
   - Copy the generated key
3. **Add to Config**: Open `src/js/config/aiConfig.js` and replace the empty string:
   ```javascript
   GEMINI_API_KEY: 'your_actual_api_key_here',
   ```

### 3. Example Configuration

After adding your keys, your `aiConfig.js` should look like this:

```javascript
export const AI_CONFIG = {
  ELEVEN_LABS_API_KEY: 'sk-1234567890abcdef...', // Your ElevenLabs key
  GEMINI_API_KEY: 'AIzaSy1234567890abcdef...',   // Your Gemini key
  DEFAULT_VOICE_ID: '21m00Tcm4TlvDq8ikWAM',
  TUTOR_PUSHINESS_LEVEL: 3,
};
```

### 4. Security Note

⚠️ **Important**: These API keys will be visible in the browser. This is fine for development, but for production you should:

- Move API calls to a server-side proxy
- Use environment variables on your server
- Implement proper authentication

### 5. Testing

After adding your keys:

1. Restart the development server: `npm run start`
2. Open the browser console
3. Look for configuration messages:
   - ✅ "ElevenLabs service initialized with API key"
   - ✅ "Gemini service initialized with API key"
   - ✅ "AI Tutor service initialized"

### 6. Troubleshooting

**No API responses?**
- Check that keys are correctly copied (no extra spaces)
- Verify keys are active in their respective dashboards
- Check browser console for error messages

**Voice capture not working?**
- Ensure you're using Chrome or Edge
- Allow microphone permissions when prompted
- Check that HTTPS is enabled (required for microphone access)

**TTS not working?**
- ElevenLabs has free tier limits
- Check your ElevenLabs dashboard for quota usage
- The system will fall back to Supabase endpoint if direct API fails
