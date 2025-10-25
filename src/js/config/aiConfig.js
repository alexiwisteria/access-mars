/**
 * Configuration for AI Services
 * 
 * Reads API keys from environment variables for security.
 * Edit src/js/config/envVars.js to add your API keys.
 */

import { getEnvVar, setEnvVar } from './envVars';

export const AI_CONFIG = {
  // ElevenLabs API Key
  // Get from: https://elevenlabs.io/app/settings/api-keys
  ELEVEN_LABS_API_KEY: getEnvVar('VITE_ELEVEN_LABS_API_KEY'),
  
  // Google Gemini API Key  
  // Get from: https://makersuite.google.com/app/apikey
  GEMINI_API_KEY: getEnvVar('VITE_GEMINI_API_KEY'),
  
  // Default voice ID for ElevenLabs
  DEFAULT_VOICE_ID: '4YYIPFl9wE5c4L2eu2Gb',
  
  // AI Tutor settings
  TUTOR_PUSHINESS_LEVEL: parseInt(getEnvVar('VITE_TUTOR_PUSHINESS_LEVEL', '3')),
};

// Helper function to set API keys (for easy configuration)
export function configureAPIKeys(elevenLabsKey, geminiKey) {
  console.log('🔧 Configuring API keys...');
  console.log('📝 Keys received:', {
    elevenLabs: elevenLabsKey ? elevenLabsKey.substring(0, 10) + '...' : 'empty',
    gemini: geminiKey ? geminiKey.substring(0, 10) + '...' : 'empty'
  });
  
  if (elevenLabsKey) {
    setEnvVar('VITE_ELEVEN_LABS_API_KEY', elevenLabsKey);
    AI_CONFIG.ELEVEN_LABS_API_KEY = elevenLabsKey;
    console.log('✅ ElevenLabs API key configured');
  }
  if (geminiKey) {
    setEnvVar('VITE_GEMINI_API_KEY', geminiKey);
    AI_CONFIG.GEMINI_API_KEY = geminiKey;
    console.log('✅ Gemini API key configured');
  }
  
  // Update global AI_CONFIG if available
  if (typeof window !== 'undefined') {
    window.AI_CONFIG = AI_CONFIG;
    console.log('🌐 Global AI_CONFIG updated');
  }
  
  console.log('✅ All API keys configured successfully');
}

// Helper function to check if API keys are configured
export function isConfigured() {
  return {
    elevenLabs: !!AI_CONFIG.ELEVEN_LABS_API_KEY,
    gemini: !!AI_CONFIG.GEMINI_API_KEY
  };
}

// Helper function to get configuration warnings
export function getConfigWarnings() {
  const warnings = [];
  
  if (!AI_CONFIG.ELEVEN_LABS_API_KEY) {
    warnings.push('ElevenLabs API key not configured - TTS will use Supabase endpoint');
  }
  
  if (!AI_CONFIG.GEMINI_API_KEY) {
    warnings.push('Gemini API key not configured - AI tutoring will not work');
  }
  
  return warnings;
}

// Make AI_CONFIG available globally for dynamic access
if (typeof window !== 'undefined') {
  window.AI_CONFIG = AI_CONFIG;
  console.log('🌐 AI_CONFIG made available globally');
}

// Debug function to test configuration
export function debugConfig() {
  console.log('🔧 AI Configuration Debug:');
  console.log('  ElevenLabs API Key:', AI_CONFIG.ELEVEN_LABS_API_KEY ? '✅ Configured' : '❌ Missing');
  console.log('  Gemini API Key:', AI_CONFIG.GEMINI_API_KEY ? '✅ Configured' : '❌ Missing');
  console.log('  Default Voice ID:', AI_CONFIG.DEFAULT_VOICE_ID);
  console.log('  Tutor Pushiness Level:', AI_CONFIG.TUTOR_PUSHINESS_LEVEL);
  
  // Check environment variable availability
  if (typeof window !== 'undefined') {
    console.log('  Environment Source:', window.env ? 'window.env' : 'Not available');
  }
  
  const warnings = getConfigWarnings();
  if (warnings.length > 0) {
    console.warn('⚠️ Configuration Issues:');
    warnings.forEach(warning => console.warn('  -', warning));
    console.log('');
    console.log('💡 To fix:');
    console.log('  1. Run: ./setup-env.sh');
    console.log('  2. Edit .env.local with your API keys');
    console.log('  3. Restart: npm run start');
  } else {
    console.log('✅ All API keys configured!');
  }
}