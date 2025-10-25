# Quick Fix: Voice Capture Not Responding

## 🔍 **Diagnosis**

Your voice capture is working (it's detecting your speech), but you're not getting AI responses because the API keys are not configured.

## 🚀 **Quick Setup (2 minutes)**

### Step 1: Get Your Gemini API Key

1. Go to [Google AI Studio](https://makersuite.google.com/app/apikey)
2. Click "Create API Key"
3. Copy the key (starts with `AIzaSy...`)

### Step 2: Add It to Your Config

Open `src/js/config/aiConfig.js` and replace the empty string:

```javascript
export const AI_CONFIG = {
  ELEVEN_LABS_API_KEY: '', // Leave empty for now
  GEMINI_API_KEY: 'AIzaSy1234567890abcdef...', // ← Paste your key here
  DEFAULT_VOICE_ID: '21m00Tcm4TlvDq8ikWAM',
  TUTOR_PUSHINESS_LEVEL: 3,
};
```

### Step 3: Restart and Test

1. Restart your dev server: `npm run start`
2. Open browser console (F12)
3. Look for: `✅ All API keys configured!`
4. Speak to test: "Tell me about Mars"

## 🔧 **Debug Information**

The enhanced debugging will now show you exactly what's happening:

- ✅ **Voice Detection**: Working (you confirmed this)
- ❌ **API Configuration**: Missing Gemini key
- ❌ **AI Response**: Will fail without Gemini key
- ✅ **Fallback TTS**: Will use Supabase endpoint

## 📊 **Console Messages to Look For**

**Before adding API key:**
```
⚠️ Configuration Issues:
  - Gemini API key not configured - AI tutoring will not work
ℹ️ Gemini service initialized without API key
```

**After adding API key:**
```
✅ All API keys configured!
✓ Gemini service initialized with API key
```

## 🎯 **Expected Behavior After Setup**

1. **Speak**: "What is Mars?"
2. **Console shows**: 
   ```
   🎯 Processing transcript: what is mars
   🤖 Processing transcript with AI Tutor...
   📡 Sending to Gemini API: {...}
   ✅ Gemini response text: Mars is the fourth planet...
   🔊 Speaking AI response with fallback TTS...
   ```
3. **Audio plays**: AI response about Mars

## 🆘 **Still Not Working?**

If you're still having issues after adding the API key:

1. **Check Console**: Look for error messages
2. **Verify Key**: Make sure no extra spaces in the key
3. **Test API**: Try the Gemini API directly in a separate tab
4. **Check Network**: Look for failed requests in Network tab

The enhanced debugging will tell you exactly where the issue is!
