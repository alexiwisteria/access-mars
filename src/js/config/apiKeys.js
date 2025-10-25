/**
 * API Keys Configuration
 * 
 * Add your API keys here for the voice capture system.
 * This file is git-ignored for security.
 */

// ========================================
// ADD YOUR API KEYS HERE
// ========================================

// ElevenLabs API Key
// Get from: https://elevenlabs.io/app/settings/api-keys
const ELEVEN_LABS_API_KEY = 'sk_0bfad38411629c59f1cfa847583c18f553ca674e05644b62'; // Add your key here

// Google Gemini API Key  
// Get from: https://makersuite.google.com/app/apikey
const GEMINI_API_KEY = 'AIzaSyCat3IdkUVoJUSmrPGowaVYH8mrah2JO2Y'; // Add your key here

// ========================================
// CONFIGURATION (don't modify below)
// ========================================

import { configureAPIKeys } from './aiConfig';

// Configure the API keys
configureAPIKeys(ELEVEN_LABS_API_KEY, GEMINI_API_KEY);

// Log configuration status
console.log('🔑 API Keys Configuration:');
console.log('  ElevenLabs:', ELEVEN_LABS_API_KEY ? '✅ Configured' : '❌ Missing');
console.log('  Gemini:', GEMINI_API_KEY ? '✅ Configured' : '❌ Missing');

if (!ELEVEN_LABS_API_KEY || !GEMINI_API_KEY) {
  console.log('');
  console.log('💡 To fix:');
  console.log('  1. Get ElevenLabs API key: https://elevenlabs.io/app/settings/api-keys');
  console.log('  2. Get Gemini API key: https://makersuite.google.com/app/apikey');
  console.log('  3. Add them to this file and restart the server');
}
