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
 * Environment Variables Loader
 * 
 * This file loads environment variables from .env.local for the browser
 * Since the current build system doesn't support .env files, we'll create
 * a simple loader that reads the file and makes variables available.
 */

// Simple environment variable loader
let envVars = {};

// Try to load environment variables
async function loadEnvVars() {
  try {
    // In a real browser environment, we can't read local files directly
    // So we'll create a simple configuration object
    // Users will need to manually add their keys here or use a different approach
    
    // For now, we'll use a simple object that can be easily modified
    envVars = {
      VITE_ELEVEN_LABS_API_KEY: '',
      VITE_GEMINI_API_KEY: '',
      VITE_TUTOR_PUSHINESS_LEVEL: '3'
    };
    
    console.log('📁 Environment variables loaded (manual configuration)');
    console.log('💡 To add API keys, edit src/js/config/envVars.js');
    
  } catch (error) {
    console.warn('⚠️ Could not load environment variables:', error);
    envVars = {};
  }
}

// Export function to get environment variables
export function getEnvVar(key, defaultValue = '') {
  return envVars[key] || defaultValue;
}

// Export function to set environment variables (for manual configuration)
export function setEnvVar(key, value) {
  envVars[key] = value;
  console.log(`🔧 Set ${key} = ${value ? '***' + value.slice(-4) : 'empty'}`);
}

// Initialize on load
loadEnvVars();

// Export the envVars object for debugging
export { envVars };
