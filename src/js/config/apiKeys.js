// Copyright 2017 Google Inc.
//
//   Licensed under the Apache License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License.
//   You may obtain a copy of the License at
//
// http://www.apache.org/licenses/LICENSE-2.0
//
//   Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS IS" BASIS,
//   WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
//   See the License for the specific language governing permissions and
// limitations under the License.

/**
 * API Keys Configuration
 * 
 * This file now uses environment variables for security.
 * API keys are loaded from .env.local file.
 */

// ========================================
// ENVIRONMENT VARIABLES SETUP
// ========================================

// Import environment variable loader
import { getEnvVar } from './envVars';

// Get API keys from environment variables
const ELEVEN_LABS_API_KEY = getEnvVar('VITE_ELEVEN_LABS_API_KEY');
const GEMINI_API_KEY = getEnvVar('VITE_GEMINI_API_KEY');

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
  console.log('  1. Run: ./setup-env.sh');
  console.log('  2. Edit .env.local with your API keys');
  console.log('  3. Restart the development server');
  console.log('');
  console.log('🔗 Get your API keys:');
  console.log('  ElevenLabs: https://elevenlabs.io/app/settings/api-keys');
  console.log('  Gemini: https://makersuite.google.com/app/apikey');
}
