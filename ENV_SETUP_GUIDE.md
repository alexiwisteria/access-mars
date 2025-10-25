# Environment Variables Setup Guide

## 🔐 **Secure API Key Management**

Your API keys are now configured to be read from environment variables instead of being hardcoded. This is much more secure!

## 🚀 **Quick Setup (3 steps)**

### Step 1: Create Environment File
```bash
./setup-env.sh
```
This creates a `.env.local` file with the proper structure.

### Step 2: Add Your API Keys
Edit `.env.local` and add your actual API keys:

```bash
# ElevenLabs API Key
VITE_ELEVEN_LABS_API_KEY=sk-1234567890abcdef...

# Google Gemini API Key  
VITE_GEMINI_API_KEY=AIzaSy1234567890abcdef...

# AI Tutor Pushiness Level (optional)
VITE_TUTOR_PUSHINESS_LEVEL=3
```

### Step 3: Restart Development Server
```bash
npm run start
```

## 🔑 **Getting Your API Keys**

### ElevenLabs API Key
1. Go to [ElevenLabs](https://elevenlabs.io/)
2. Sign up/Login
3. Go to Profile → API Keys
4. Click "Create API Key"
5. Copy the key (starts with `sk-`)

### Google Gemini API Key
1. Go to [Google AI Studio](https://makersuite.google.com/app/apikey)
2. Click "Create API Key"
3. Select your Google account
4. Copy the key (starts with `AIzaSy`)

## 🔒 **Security Features**

- ✅ **Git Ignored**: `.env.local` is automatically ignored by git
- ✅ **Local Only**: Environment variables are only loaded locally
- ✅ **No Hardcoding**: API keys are never committed to the repository
- ✅ **Easy Setup**: Automated setup script creates the file structure

## 🐛 **Troubleshooting**

### Environment Variables Not Loading?
The system uses `VITE_` prefixed variables for browser compatibility. Make sure your `.env.local` file has:

```bash
VITE_ELEVEN_LABS_API_KEY=your_key_here
VITE_GEMINI_API_KEY=your_key_here
```

### Still Getting "Missing API Key" Errors?
1. Check that `.env.local` exists in the project root
2. Verify the variable names start with `VITE_`
3. Restart the development server after adding keys
4. Check browser console for configuration debug info

### Debug Information
The system will show detailed debug information in the browser console:
- ✅ Configuration status
- ❌ Missing keys with setup instructions
- 🔧 Environment variable source

## 📁 **File Structure**

```
access-mars/
├── .env.local          # Your API keys (git ignored)
├── .env.example        # Template (safe to commit)
├── setup-env.sh        # Setup script
└── src/js/config/
    └── aiConfig.js     # Reads from environment
```

## 🎯 **Expected Behavior**

After setup, you should see in the browser console:
```
🔧 AI Configuration Debug:
  ElevenLabs API Key: ✅ Configured
  Gemini API Key: ✅ Configured
  Default Voice ID: 21m00Tcm4TlvDq8ikWAM
  Tutor Pushiness Level: 3
✅ All API keys configured!
```

Now your voice capture will work with full AI responses! 🎤🤖
