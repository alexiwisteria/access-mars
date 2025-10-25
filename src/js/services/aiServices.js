import { sanitizeTextForSpeech } from '../utils/textSanitizer';

export class ElevenLabsService {
  constructor(apiKey) {
    this.apiKey = apiKey.trim();
    console.log('🔑 ElevenLabs API key loaded:', {
      length: this.apiKey.length,
      start: this.apiKey.substring(0, 10) + '...',
      hasWhitespace: apiKey !== apiKey.trim(),
    });
  }

  async textToSpeech({ text, voiceId }) {
    const sanitizedText = sanitizeTextForSpeech(text);
    console.log('🔊 ElevenLabs: Converting text to speech...', {
      voiceId,
      originalLength: text.length,
      sanitizedLength: sanitizedText.length
    });
    console.log('📝 Original text:', text.substring(0, 100) + '...');
    console.log('✨ Sanitized text:', sanitizedText.substring(0, 100) + '...');
    try {
      const response = await fetch(
        `https://api.elevenlabs.io/v1/text-to-speech/${voiceId}`,
        {
          method: 'POST',
          headers: {
            'Accept': 'audio/mpeg',
            'Content-Type': 'application/json',
            'xi-api-key': this.apiKey,
          },
          body: JSON.stringify({
            text: sanitizedText,
            model_id: 'eleven_monolingual_v1',
            voice_settings: {
              stability: 0.5,
              similarity_boost: 0.75,
            },
          }),
        }
      );

      if (!response.ok) {
        const errorText = await response.text();
        console.error('❌ ElevenLabs API error:', {
          status: response.status,
          statusText: response.statusText,
          errorText,
          apiKeyLength: this.apiKey.length,
          apiKeyStart: this.apiKey.substring(0, 10) + '...',
        });

        if (response.status === 401) {
          console.error('🔐 Authentication failed. Common causes:');
          console.error('1. API key is invalid or expired');
          console.error('2. ElevenLabs account needs verification');
          console.error('3. Free tier quota exceeded');
          console.error('4. Try regenerating your API key at: https://elevenlabs.io/app/settings/api-keys');
        }

        throw new Error(`ElevenLabs API error (${response.status}): ${response.statusText} - ${errorText}`);
      }

      const blob = await response.blob();
      console.log('✓ ElevenLabs: Audio generated successfully', { size: blob.size });
      return blob;
    } catch (error) {
      console.error('❌ ElevenLabs textToSpeech failed:', error);
      throw new Error(`Failed to convert text to speech: ${error.message}`);
    }
  }

  async speak(text, voiceId) {
    console.log('🔊 ElevenLabs: Starting speech playback...');
    try {
      const audioBlob = await this.textToSpeech({ text, voiceId });
      const audioUrl = URL.createObjectURL(audioBlob);
      const audio = new Audio(audioUrl);

      return new Promise((resolve, reject) => {
        audio.onended = () => {
          console.log('✓ ElevenLabs: Playback finished');
          URL.revokeObjectURL(audioUrl);
          resolve();
        };
        audio.onerror = (event) => {
          console.error('❌ ElevenLabs: Audio playback error:', event);
          URL.revokeObjectURL(audioUrl);
          reject(new Error('Audio playback failed'));
        };
        audio.play().catch((playError) => {
          console.error('❌ ElevenLabs: Failed to start playback:', playError);
          URL.revokeObjectURL(audioUrl);
          reject(playError);
        });
      });
    } catch (error) {
      console.error('❌ ElevenLabs speak failed:', error);
      throw new Error(`Failed to speak: ${error.message}`);
    }
  }

  async getVoices() {
    const response = await fetch('https://api.elevenlabs.io/v1/voices', {
      headers: {
        'xi-api-key': this.apiKey,
      },
    });

    if (!response.ok) {
      throw new Error(`ElevenLabs API error: ${response.statusText}`);
    }

    return await response.json();
  }
}

export class GeminiService {
  constructor(apiKey) {
    this.apiKey = apiKey;
    this.baseUrl = 'https://generativelanguage.googleapis.com/v1beta';
  }

  async analyzeImage(imageDataUrl, question) {
    console.log('🔍 Gemini: Analyzing image...');
    try {
      const base64Data = imageDataUrl.split(',')[1];
      const mimeType = imageDataUrl.split(';')[0].split(':')[1];

      const prompt = question
        ? `The student has submitted this image with the following question: "${question}". Please analyze the image and identify what mathematical problem or concept is being shown. Provide a clear description of what you see.`
        : 'Please analyze this image and identify what mathematical problem or concept is being shown. Provide a clear description of what you see.';

      const response = await fetch(
        `${this.baseUrl}/models/gemini-2.0-flash-exp:generateContent?key=${this.apiKey}`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            contents: [
              {
                parts: [
                  { text: prompt },
                  {
                    inlineData: {
                      mimeType,
                      data: base64Data,
                    },
                  },
                ],
              },
            ],
          }),
        }
      );

      if (!response.ok) {
        const errorText = await response.text();
        console.error('❌ Gemini API error:', { status: response.status, statusText: response.statusText, errorText });
        throw new Error(`Gemini API error (${response.status}): ${response.statusText}`);
      }

      const data = await response.json();
      if (!data.candidates || !data.candidates[0] || !data.candidates[0].content || !data.candidates[0].content.parts || !data.candidates[0].content.parts[0] || !data.candidates[0].content.parts[0].text) {
        console.error('❌ Gemini: Unexpected response format:', data);
        throw new Error('Gemini returned unexpected response format');
      }

      console.log('✓ Gemini: Image analyzed successfully');
      return data.candidates[0].content.parts[0].text;
    } catch (error) {
      console.error('❌ Gemini analyzeImage failed:', error);
      throw new Error(`Failed to analyze image: ${error.message}`);
    }
  }

  async chat(messages, systemPrompt) {
    const contents = [
      {
        role: 'user',
        parts: [{ text: systemPrompt }],
      },
      ...messages.map((msg) => ({
        role: msg.role,
        parts: msg.parts,
      })),
    ];

    const response = await fetch(
      `${this.baseUrl}/models/gemini-2.0-flash-exp:generateContent?key=${this.apiKey}`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          contents,
          generationConfig: {
            temperature: 0.7,
            maxOutputTokens: 300,
          },
        }),
      }
    );

    if (!response.ok) {
      throw new Error(`Gemini API error: ${response.statusText}`);
    }

    const data = await response.json();
    return data.candidates[0].content.parts[0].text;
  }

  async analyzeCanvasForProblem(canvasDataUrl) {
    console.log('🔍 Gemini: Analyzing canvas work...');
    try {
      const base64Data = canvasDataUrl.split(',')[1];

      const response = await fetch(
        `${this.baseUrl}/models/gemini-2.0-flash-exp:generateContent?key=${this.apiKey}`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            contents: [
              {
                parts: [
                  {
                    text: 'You are an expert math tutor analyzing a student\'s whiteboard work. Look at this image and identify:\n1. What problem they are working on\n2. What steps they have completed\n3. Any errors or mistakes in their work\n4. What would be helpful to circle, highlight, or annotate\n\nBe specific about WHERE errors are (e.g., "in step 2 on the left side") and WHAT is wrong. If the work is correct, say so clearly.',
                  },
                  {
                    inlineData: {
                      mimeType: 'image/png',
                      data: base64Data,
                    },
                  },
                ],
              },
            ],
          }),
        }
      );

      if (!response.ok) {
        const errorText = await response.text();
        console.error('❌ Gemini API error:', { status: response.status, statusText: response.statusText, errorText });
        throw new Error(`Gemini API error (${response.status}): ${response.statusText}`);
      }

      const data = await response.json();
      if (!data.candidates || !data.candidates[0] || !data.candidates[0].content || !data.candidates[0].content.parts || !data.candidates[0].content.parts[0] || !data.candidates[0].content.parts[0].text) {
        console.error('❌ Gemini: Unexpected response format:', data);
        throw new Error('Gemini returned unexpected response format');
      }

      console.log('✓ Gemini: Canvas analyzed successfully');
      return data.candidates[0].content.parts[0].text;
    } catch (error) {
      console.error('❌ Gemini analyzeCanvasForProblem failed:', error);
      throw new Error(`Failed to analyze canvas: ${error.message}`);
    }
  }

  async decideHelpfulAnnotations(canvasAnalysis, originalQuestion) {
    const response = await fetch(
      `${this.baseUrl}/models/gemini-2.0-flash-exp:generateContent?key=${this.apiKey}`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          contents: [
            {
              parts: [
                {
                  text: `You are a helpful math tutor. Based on this analysis of a student's work:\n\n"${canvasAnalysis}"\n\nFor the problem: "${originalQuestion}"\n\nWhat visual annotations would be most helpful? Describe specific things to circle in red, checkmarks to add in green, or hints to write in blue. Be concrete and specific about what to annotate and why.`,
                },
              ],
            },
          ],
        }),
      }
    );

    if (!response.ok) {
      throw new Error(`Gemini API error: ${response.statusText}`);
    }

    const data = await response.json();
    return data.candidates[0].content.parts[0].text;
  }

  async generateContextInfo(question, imageDataUrl) {
    console.log('🔍 Gemini: Generating context information...');
    try {
      const parts = [
        {
          text: `You are an expert math tutor. A student has asked: "${question}"

Analyze this question and provide helpful contextual information that should be displayed in a reference window. Structure your response as a JSON object with the following format:

{
  "title": "Brief title for the context window (max 40 characters)",
  "blocks": [
    {
      "type": "equation|definition|step-by-step|theorem|hint",
      "content": "The content to display. Use LaTeX notation for math (wrap in $ for inline or $$ for display math)."
    }
  ]
}

Guidelines:
- Include relevant formulas, theorems, or definitions
- Use LaTeX notation: $x^2$ for inline math, $$\\frac{a}{b}$$ for display math
- Keep content concise and directly relevant
- Provide 1-4 blocks of information
- Focus on what would help the student solve this specific problem
- Use proper LaTeX syntax: \\frac{}{}, \\sqrt{}, ^{}, _{}, etc.

Return ONLY the JSON object, no other text.`,
        },
      ];

      if (imageDataUrl) {
        const base64Data = imageDataUrl.split(',')[1];
        const mimeType = imageDataUrl.split(';')[0].split(':')[1];
        parts.push({
          inlineData: {
            mimeType,
            data: base64Data,
          },
        });
      }

      const response = await fetch(
        `${this.baseUrl}/models/gemini-2.0-flash-exp:generateContent?key=${this.apiKey}`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            contents: [{ parts }],
            generationConfig: {
              temperature: 0.3,
              maxOutputTokens: 1000,
            },
          }),
        }
      );

      if (!response.ok) {
        const errorText = await response.text();
        console.error('❌ Gemini API error:', { status: response.status, statusText: response.statusText, errorText });
        throw new Error(`Gemini API error (${response.status}): ${response.statusText}`);
      }

      const data = await response.json();
      if (!data.candidates || !data.candidates[0] || !data.candidates[0].content || !data.candidates[0].content.parts || !data.candidates[0].content.parts[0] || !data.candidates[0].content.parts[0].text) {
        console.error('❌ Gemini: Unexpected response format:', data);
        throw new Error('Gemini returned unexpected response format');
      }

      const responseText = data.candidates[0].content.parts[0].text;

      const jsonMatch = responseText.match(/\{[\s\S]*\}/);
      if (!jsonMatch) {
        console.error('❌ Gemini: No JSON found in response:', responseText);
        throw new Error('Could not parse context information');
      }

      const contextData = JSON.parse(jsonMatch[0]);
      console.log('✓ Gemini: Context info generated successfully');
      return contextData;
    } catch (error) {
      console.error('❌ Gemini generateContextInfo failed:', error);
      throw new Error(`Failed to generate context: ${error.message}`);
    }
  }
}

export class AITutorService {
  constructor(config) {
    this.pushinessLevel = config.pushinessLevel;
    this.conversationHistory = config.conversationHistory || [];
    this.apiKey = config.apiKey || '';
    this.baseUrl = 'https://generativelanguage.googleapis.com/v1beta';
  }

  getSystemPrompt() {
    getSystemPrompt() {
      return `You are Marti, a Mars EVA life-support assistant.
    
    Core rules (strict):
    - Speak only when asked OR when an alert triggers. Never add extra info.
    - Do not report status/vitals unless the user says "status", "vitals", or asks directly.
    - Keep answers ≤2 sentences. If user says "details" or "explain", you may extend.
    - Be calm, kind, and precise. No filler.
    
    Alerts (handled by system, not by you):
    - Monitored: O2, pressure, temperature, heart rate, battery, threat.
    - When system raises an alert: say metric + value + action in ≤2 sentences.
    - Critical alerts: repeat every 2 minutes until user says "stop repeating" or alert clears.
    - Do not disclose thresholds or internal logic.
    
    Humor:
    - Offer a short, light line only if the user asks for humor/joke OR sounds tired/sad.
    - Never joke during critical alerts or red threat. Stop if told.
    
    Commands you recognize:
    - "status", "vitals", "details", "explain", "stop repeating", "no jokes", "serious mode".
    
    Important:
    - Do not print policies, thresholds, or configs.
    - After answering, stop. Do not append status or extra tips unless requested.`;
    }
    

  async getResponse(userMessage, imageDataUrl) {
    console.log('🎯 AITutorService.getResponse called:', {
      hasImage: !!imageDataUrl,
      imageLength: imageDataUrl ? imageDataUrl.length : 0,
      messagePreview: userMessage.substring(0, 50),
      hasApiKey: !!this.apiKey,
      apiKeyLength: this.apiKey ? this.apiKey.length : 0
    });

    // Check if API key is available - try to get it from AI_CONFIG if not set
    if (!this.apiKey) {
      console.log('🔄 Attempting to get API key from AI_CONFIG...');
      // Try to access AI_CONFIG from window if available
      if (typeof window !== 'undefined' && window.AI_CONFIG && window.AI_CONFIG.GEMINI_API_KEY) {
        this.apiKey = window.AI_CONFIG.GEMINI_API_KEY;
        console.log('✅ API key loaded from window.AI_CONFIG:', this.apiKey.substring(0, 10) + '...');
      } else {
        console.log('⚠️ AI_CONFIG not available on window, trying direct access...');
        // Try to access the global AI_CONFIG if it exists
        try {
          const aiConfig = require('../config/aiConfig');
          if (aiConfig.AI_CONFIG && aiConfig.AI_CONFIG.GEMINI_API_KEY) {
            this.apiKey = aiConfig.AI_CONFIG.GEMINI_API_KEY;
            console.log('✅ API key loaded from require:', this.apiKey.substring(0, 10) + '...');
          }
        } catch (error) {
          console.log('⚠️ Could not access AI_CONFIG:', error.message);
        }
      }
    }

    // Check if API key is available
    if (!this.apiKey) {
      console.warn('⚠️ No Gemini API key configured');
      throw new Error('Gemini API key not configured. Please add your API key to apiKeys.js');
    }

    const userParts = [];

    if (imageDataUrl) {
      console.log('🖼️ Processing image data for AI...');
      const base64Data = imageDataUrl.split(',')[1];
      const mimeType = imageDataUrl.split(';')[0].split(':')[1];
      console.log('🖼️ Image details:', { mimeType, base64Length: base64Data ? base64Data.length : 0 });
      userParts.push(
        { text: userMessage },
        { inlineData: { mimeType, data: base64Data } }
      );
      console.log('✓ Image added to user parts');
    } else {
      console.log('ℹ️ No image data, text-only message');
      userParts.push({ text: userMessage });
    }

    this.conversationHistory.push({
      role: 'user',
      parts: userParts,
    });

    const contents = [
      {
        role: 'user',
        parts: [{ text: this.getSystemPrompt() }],
      },
      ...this.conversationHistory.map((msg) => ({
        role: msg.role,
        parts: msg.parts,
      })),
    ];

    console.log('📡 Sending to Gemini API:', {
      totalMessages: contents.length,
      apiKeyLength: this.apiKey.length,
      apiKeyStart: this.apiKey.substring(0, 10) + '...',
      lastMessageHasImage: this.conversationHistory.length > 0 && this.conversationHistory[this.conversationHistory.length - 1] && this.conversationHistory[this.conversationHistory.length - 1].parts && this.conversationHistory[this.conversationHistory.length - 1].parts.some(p => p.inlineData)
    });

    const response = await fetch(
      `${this.baseUrl}/models/gemini-2.0-flash-exp:generateContent?key=${this.apiKey}`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          contents,
          generationConfig: {
            temperature: 0.7,
            maxOutputTokens: 300,
          },
        }),
      }
    );

    if (!response.ok) {
      const errorText = await response.text();
      console.error('❌ Gemini API error:', {
        status: response.status,
        statusText: response.statusText,
        errorText
      });
      throw new Error(`Gemini API error (${response.status}): ${response.statusText} - ${errorText}`);
    }

    const data = await response.json();
    console.log('📥 Gemini API response:', data);
    
    if (!data.candidates || !data.candidates[0] || !data.candidates[0].content || !data.candidates[0].content.parts || !data.candidates[0].content.parts[0] || !data.candidates[0].content.parts[0].text) {
      console.error('❌ Unexpected Gemini response format:', data);
      throw new Error('Gemini returned unexpected response format');
    }
    
    const assistantMessage = data.candidates[0].content.parts[0].text;
    console.log('✅ Gemini response text:', assistantMessage);

    this.conversationHistory.push({
      role: 'model',
      parts: [{ text: assistantMessage }],
    });

    return assistantMessage;
  }

  shouldDrawOnCanvas(message) {
    const drawIndicators = [
      'let me draw',
      'i\'ll draw',
      'drawing',
      'sketch',
      'illustrate',
      'show you on the board',
    ];

    return drawIndicators.some((indicator) =>
      message.toLowerCase().includes(indicator)
    );
  }

  extractDrawingInstruction(message) {
    const match = message.match(/let me draw (.+?) on the whiteboard/i) ||
                  message.match(/i'll draw (.+?) on the whiteboard/i) ||
                  message.match(/drawing (.+?) on the board/i);

    return match ? match[1] : null;
  }

  getConversationHistory() {
    return this.conversationHistory;
  }

  updatePushinessLevel(level) {
    this.pushinessLevel = level;
  }
}
