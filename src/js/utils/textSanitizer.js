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
 * Text Sanitizer Utility
 * 
 * Sanitizes text for speech synthesis by removing or replacing
 * problematic characters and formatting.
 */

export function sanitizeTextForSpeech(text) {
  if (!text || typeof text !== 'string') {
    return '';
  }

  let sanitized = text;

  // Remove HTML tags
  sanitized = sanitized.replace(/<[^>]*>/g, '');

  // Replace common HTML entities
  sanitized = sanitized.replace(/&nbsp;/g, ' ');
  sanitized = sanitized.replace(/&amp;/g, '&');
  sanitized = sanitized.replace(/&lt;/g, '<');
  sanitized = sanitized.replace(/&gt;/g, '>');
  sanitized = sanitized.replace(/&quot;/g, '"');
  sanitized = sanitized.replace(/&#39;/g, "'");

  // Replace multiple spaces with single space
  sanitized = sanitized.replace(/\s+/g, ' ');

  // Remove or replace problematic characters for speech
  sanitized = sanitized.replace(/[^\w\s.,!?;:'"()-]/g, ' ');

  // Clean up multiple punctuation
  sanitized = sanitized.replace(/[.]{2,}/g, '.');
  sanitized = sanitized.replace(/[!]{2,}/g, '!');
  sanitized = sanitized.replace(/[?]{2,}/g, '?');

  // Remove leading/trailing whitespace
  sanitized = sanitized.trim();

  // Ensure text ends with proper punctuation
  if (sanitized && !sanitized.match(/[.!?]$/)) {
    sanitized += '.';
  }

  return sanitized;
}

export function extractMathExpressions(text) {
  // Extract LaTeX math expressions for special handling
  const mathRegex = /\$([^$]+)\$/g;
  const displayMathRegex = /\$\$([^$]+)\$\$/g;
  
  const inlineMath = [];
  const displayMath = [];
  
  let match;
  while ((match = mathRegex.exec(text)) !== null) {
    inlineMath.push(match[1]);
  }
  
  while ((match = displayMathRegex.exec(text)) !== null) {
    displayMath.push(match[1]);
  }
  
  return { inlineMath, displayMath };
}

export function convertMathToSpeech(text) {
  // Convert common math expressions to speech-friendly text
  let speechText = text;
  
  // Replace common math symbols
  speechText = speechText.replace(/\*/g, ' times ');
  speechText = speechText.replace(/\+/g, ' plus ');
  speechText = speechText.replace(/-/g, ' minus ');
  speechText = speechText.replace(/\//g, ' divided by ');
  speechText = speechText.replace(/=/g, ' equals ');
  speechText = speechText.replace(/</g, ' less than ');
  speechText = speechText.replace(/>/g, ' greater than ');
  
  // Handle exponents
  speechText = speechText.replace(/\^(\d+)/g, ' to the power of $1');
  
  // Handle fractions
  speechText = speechText.replace(/\\frac\{([^}]+)\}\{([^}]+)\}/g, '$1 over $2');
  
  // Handle square roots
  speechText = speechText.replace(/\\sqrt\{([^}]+)\}/g, 'square root of $1');
  
  return speechText;
}
