/**
 * Voice Capture Service
 * 
 * Handles voice input using the Web Speech API and integrates with AI services
 */

import { ElevenLabsService, GeminiService, AITutorService } from './aiServices';
import { AI_CONFIG, isConfigured, getConfigWarnings, debugConfig } from '../config/aiConfig';

export class VoiceCaptureService {
  constructor() {
    this.recognition = null;
    this.isListening = false;
    this.isSupported = false;
    this.elevenLabsService = null;
    this.geminiService = null;
    this.aiTutorService = null;
    this.onTranscriptCallback = null;
    this.onErrorCallback = null;
    this.onStatusChangeCallback = null;
    
    this.init();
  }

  init() {
    // Check for Web Speech API support
    if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
      this.isSupported = true;
      this.setupRecognition();
    } else {
      console.warn('⚠️ Speech recognition not supported in this browser');
      this.isSupported = false;
    }

    // Initialize AI services with environment variables
    this.initializeAIServices();
  }

  initializeAIServices() {
    try {
      // Run debug configuration
      debugConfig();
      
      const config = isConfigured();
      const warnings = getConfigWarnings();
      
      // Log configuration warnings
      if (warnings.length > 0) {
        console.warn('⚠️ Configuration warnings:');
        warnings.forEach(warning => console.warn('  -', warning));
      }
      
      // Initialize ElevenLabs service
      if (config.elevenLabs) {
        console.log('🔧 Initializing ElevenLabs service with API key...');
        console.log('📝 ElevenLabs API key:', AI_CONFIG.ELEVEN_LABS_API_KEY ? AI_CONFIG.ELEVEN_LABS_API_KEY.substring(0, 10) + '...' : 'empty');
        this.elevenLabsService = new ElevenLabsService(AI_CONFIG.ELEVEN_LABS_API_KEY);
        console.log('✓ ElevenLabs service initialized with API key');
      } else {
        console.log('ℹ️ ElevenLabs service will use Supabase endpoint (no API key)');
        console.log('🔍 ElevenLabs config check:', {
          configElevenLabs: config.elevenLabs,
          aiConfigElevenLabs: !!AI_CONFIG.ELEVEN_LABS_API_KEY,
          aiConfigElevenLabsValue: AI_CONFIG.ELEVEN_LABS_API_KEY
        });
      }
      
      // Initialize Gemini service
      if (config.gemini) {
        this.geminiService = new GeminiService(AI_CONFIG.GEMINI_API_KEY);
        console.log('✓ Gemini service initialized with API key');
      } else {
        console.log('ℹ️ Gemini service initialized without API key');
      }

      // Initialize AI Tutor service
      this.aiTutorService = new AITutorService({
        pushinessLevel: AI_CONFIG.TUTOR_PUSHINESS_LEVEL,
        conversationHistory: [],
        apiKey: AI_CONFIG.GEMINI_API_KEY
      });
      console.log('✓ AI Tutor service initialized');
    } catch (error) {
      console.error('❌ Failed to initialize AI services:', error);
    }
  }

  setupRecognition() {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    this.recognition = new SpeechRecognition();

    // Configure recognition settings
    this.recognition.continuous = true;
    this.recognition.interimResults = true;
    this.recognition.lang = 'en-US';
    this.recognition.maxAlternatives = 1;

    // Event handlers
    this.recognition.onstart = () => {
      console.log('🎤 Voice recognition started');
      console.log('🔧 Recognition settings:', {
        continuous: this.recognition.continuous,
        interimResults: this.recognition.interimResults,
        lang: this.recognition.lang,
        maxAlternatives: this.recognition.maxAlternatives,
        timestamp: new Date().toISOString()
      });
      this.isListening = true;
      this.notifyStatusChange('listening');
    };

    this.recognition.onresult = (event) => {
      this.handleRecognitionResult(event);
    };

    this.recognition.onerror = (event) => {
      console.error('❌ Speech recognition error:', event.error);
      console.error('🔍 Error details:', {
        error: event.error,
        type: event.type,
        timestamp: new Date().toISOString()
      });
      this.isListening = false;
      this.notifyStatusChange('error');
      this.notifyError(event.error);
    };

    this.recognition.onend = () => {
      console.log('🎤 Voice recognition ended');
      console.log('📊 Session stats:', {
        wasListening: this.isListening,
        timestamp: new Date().toISOString()
      });
      this.isListening = false;
      this.notifyStatusChange('stopped');
    };
  }

  handleRecognitionResult(event) {
    console.log('🎤 Voice recognition result received:', {
      resultIndex: event.resultIndex,
      resultsLength: event.results.length,
      timestamp: new Date().toISOString()
    });

    let finalTranscript = '';
    let interimTranscript = '';

    // Process all results
    for (let i = event.resultIndex; i < event.results.length; i++) {
      const transcript = event.results[i][0].transcript;
      const confidence = event.results[i][0].confidence;
      const isFinal = event.results[i].isFinal;
      
      console.log(`📝 Result ${i}:`, {
        transcript: transcript,
        confidence: confidence,
        isFinal: isFinal
      });
      
      if (isFinal) {
        finalTranscript += transcript;
      } else {
        interimTranscript += transcript;
      }
    }

    // Notify about interim results
    if (interimTranscript) {
      console.log('🔄 Interim transcript:', interimTranscript);
      this.notifyTranscript(interimTranscript, false);
    }

    // Process final results
    if (finalTranscript) {
      console.log('✅ Final transcript ready:', finalTranscript);
      console.log('📊 Transcript stats:', {
        length: finalTranscript.length,
        wordCount: finalTranscript.split(' ').length,
        timestamp: new Date().toISOString()
      });
      
      this.notifyTranscript(finalTranscript, true);
      this.processTranscript(finalTranscript);
    }
  }

  async processTranscript(transcript) {
    console.log('🎯 Starting transcript processing...');
    console.log('📝 Transcript:', transcript);
    console.log('📊 Processing details:', {
      transcriptLength: transcript.length,
      wordCount: transcript.split(' ').length,
      timestamp: new Date().toISOString(),
      aiTutorAvailable: !!this.aiTutorService,
      elevenLabsAvailable: !!this.elevenLabsService
    });
    
    if (!this.aiTutorService) {
      console.warn('⚠️ AI Tutor service not available');
      console.log('🔧 Available services:', {
        elevenLabs: !!this.elevenLabsService,
        gemini: !!this.geminiService,
        tutor: !!this.aiTutorService
      });
      this.playFallbackResponse('I heard you say: ' + transcript + '. However, I need a Gemini API key to provide intelligent responses.');
      return;
    }

    try {
      console.log('🤖 Calling AI Tutor service...');
      console.log('📡 Request details:', {
        userMessage: transcript,
        hasImage: false,
        timestamp: new Date().toISOString()
      });
      
      const response = await this.aiTutorService.getResponse(transcript);
      
      if (response) {
        console.log('✅ AI Response received successfully!');
        console.log('📝 Response details:', {
          responseLength: response.length,
          wordCount: response.split(' ').length,
          timestamp: new Date().toISOString()
        });
        console.log('💬 Response text:', response);
        
        if (this.elevenLabsService) {
          console.log('🔊 Using ElevenLabs for TTS...');
          console.log('🎵 TTS details:', {
            text: response.substring(0, 100) + '...',
            voiceId: AI_CONFIG.DEFAULT_VOICE_ID,
            timestamp: new Date().toISOString()
          });
          try {
            await this.elevenLabsService.speak(response, AI_CONFIG.DEFAULT_VOICE_ID);
            console.log('✅ ElevenLabs TTS completed');
          } catch (error) {
            console.error('❌ ElevenLabs TTS failed:', error);
            console.log('🔄 Falling back to Supabase TTS...');
            this.playFallbackResponse(response);
          }
        } else if (AI_CONFIG.ELEVEN_LABS_API_KEY) {
          // Try to initialize ElevenLabs service dynamically
          console.log('🔧 Initializing ElevenLabs service dynamically...');
          try {
            this.elevenLabsService = new ElevenLabsService(AI_CONFIG.ELEVEN_LABS_API_KEY);
            console.log('✅ ElevenLabs service initialized dynamically');
            
            console.log('🔊 Using ElevenLabs for TTS...');
            await this.elevenLabsService.speak(response, AI_CONFIG.DEFAULT_VOICE_ID);
            console.log('✅ ElevenLabs TTS completed');
          } catch (error) {
            console.error('❌ Dynamic ElevenLabs initialization failed:', error);
            console.log('🔄 Falling back to Supabase TTS...');
            this.playFallbackResponse(response);
          }
        } else {
          console.log('🔊 Using fallback TTS (Supabase endpoint)...');
          console.log('🔍 ElevenLabs service not available:', {
            elevenLabsService: !!this.elevenLabsService,
            elevenLabsApiKey: !!AI_CONFIG.ELEVEN_LABS_API_KEY,
            timestamp: new Date().toISOString()
          });
          this.playFallbackResponse(response);
        }
      } else {
        console.warn('⚠️ AI Tutor returned empty response');
        console.log('🔍 Debug info:', {
          response: response,
          responseType: typeof response,
          timestamp: new Date().toISOString()
        });
        this.playFallbackResponse('I heard you, but I need a Gemini API key to respond intelligently.');
      }
    } catch (error) {
      console.error('❌ Error processing transcript:', error);
      console.error('🔍 Error details:', {
        message: error.message,
        stack: error.stack,
        timestamp: new Date().toISOString()
      });
      this.playFallbackResponse('Sorry, I encountered an error processing your request. Please check your API configuration.');
    }
  }

  playFallbackResponse(text) {
    console.log('🔊 Starting fallback TTS...');
    console.log('📝 Fallback text:', text);
    console.log('🔧 Fallback details:', {
      textLength: text.length,
      audioManagerAvailable: !!window.AudioManager,
      timestamp: new Date().toISOString()
    });
    
    // Use the existing AudioManager TTS as fallback
    if (window.AudioManager) {
      console.log('✅ Using AudioManager.playTTS for fallback');
      try {
        window.AudioManager.playTTS(text);
        console.log('✅ Fallback TTS started successfully');
      } catch (error) {
        console.error('❌ Fallback TTS failed:', error);
      }
    } else {
      console.warn('⚠️ AudioManager not available for fallback TTS');
    }
  }

  startListening() {
    console.log('🎤 Attempting to start voice recognition...');
    console.log('🔧 Pre-start checks:', {
      isSupported: this.isSupported,
      isListening: this.isListening,
      recognitionExists: !!this.recognition,
      timestamp: new Date().toISOString()
    });

    if (!this.isSupported) {
      console.error('❌ Speech recognition not supported');
      this.notifyError('Speech recognition not supported');
      return false;
    }

    if (this.isListening) {
      console.log('ℹ️ Already listening - no action needed');
      return true;
    }

    try {
      console.log('🚀 Starting speech recognition...');
      this.recognition.start();
      console.log('✅ Speech recognition start() called successfully');
      return true;
    } catch (error) {
      console.error('❌ Failed to start recognition:', error);
      console.error('🔍 Start error details:', {
        message: error.message,
        stack: error.stack,
        timestamp: new Date().toISOString()
      });
      this.notifyError('Failed to start voice recognition');
      return false;
    }
  }

  stopListening() {
    if (this.recognition && this.isListening) {
      this.recognition.stop();
    }
  }

  toggleListening() {
    if (this.isListening) {
      this.stopListening();
    } else {
      this.startListening();
    }
  }

  // Callback setters
  onTranscript(callback) {
    this.onTranscriptCallback = callback;
  }

  onError(callback) {
    this.onErrorCallback = callback;
  }

  onStatusChange(callback) {
    this.onStatusChangeCallback = callback;
  }

  // Notification methods
  notifyTranscript(transcript, isFinal) {
    if (this.onTranscriptCallback) {
      this.onTranscriptCallback(transcript, isFinal);
    }
  }

  notifyError(error) {
    if (this.onErrorCallback) {
      this.onErrorCallback(error);
    }
  }

  notifyStatusChange(status) {
    if (this.onStatusChangeCallback) {
      this.onStatusChangeCallback(status);
    }
  }

  // Getters
  getIsListening() {
    return this.isListening;
  }

  getIsSupported() {
    return this.isSupported;
  }

  getAIServices() {
    return {
      elevenLabs: this.elevenLabsService,
      gemini: this.geminiService,
      tutor: this.aiTutorService
    };
  }

  // Cleanup
  destroy() {
    this.stopListening();
    this.recognition = null;
    this.isListening = false;
  }
}
