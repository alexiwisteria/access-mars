/**
 * Simple Audio Capture Service
 * 
 * Basic Web Speech API implementation for voice input
 * Includes AI integration for Gemini responses
 */

import { ElevenLabsService, GeminiService, AITutorService } from './aiServices';
import { AI_CONFIG } from '../config/aiConfig';

export class SimpleAudioCapture {
  constructor() {
    this.recognition = null;
    this.isListening = false;
    this.isSupported = false;
    this.isPaused = false;
    this.onTranscriptCallback = null;
    this.onErrorCallback = null;
    this.onStatusChangeCallback = null;
    
    // AI services
    this.elevenLabsService = null;
    this.geminiService = null;
    this.aiTutorService = null;
    
    this.init();
  }

  init() {
    // Check for Web Speech API support
    if ('SpeechRecognition' in window || 'webkitSpeechRecognition' in window) {
      this.isSupported = true;
      this.setupRecognition();
      console.log('✅ Simple Audio Capture initialized');
    } else {
      console.warn('❌ Speech Recognition not supported in this browser');
    }
    
    // Try to initialize AI services, retry if keys not ready
    this.tryInitializeAIServices();
    
    // Set up TTS completion callback
    this.setupTTSCompletionCallback();
  }

  setupTTSCompletionCallback() {
    // Wait for AudioManager to be available
    const checkAudioManager = () => {
      if (window.AudioManager) {
        window.AudioManager.onTTSComplete(() => {
          console.log('🔊 TTS completed, resuming voice capture...');
          this.resumeListening();
        });
        console.log('✅ TTS completion callback set up');
      } else {
        setTimeout(checkAudioManager, 100);
      }
    };
    checkAudioManager();
  }

  tryInitializeAIServices() {
    // Check if API keys are available
    if (window.AI_CONFIG && window.AI_CONFIG.GEMINI_API_KEY && window.AI_CONFIG.ELEVEN_LABS_API_KEY) {
      this.initializeAIServices();
    } else {
      // Retry after a short delay
      setTimeout(() => {
        this.tryInitializeAIServices();
      }, 500);
    }
  }

  initializeAIServices() {
    console.log('🤖 Initializing AI services...');
    
    // Use global AI_CONFIG which should now be available
    const config = window.AI_CONFIG || AI_CONFIG;
    
    // Initialize ElevenLabs service
    if (config.ELEVEN_LABS_API_KEY) {
      this.elevenLabsService = new ElevenLabsService(config.ELEVEN_LABS_API_KEY);
      console.log('✅ ElevenLabs service initialized');
    } else {
      console.warn('⚠️ ElevenLabs API key not configured');
    }

    // Initialize Gemini service
    if (config.GEMINI_API_KEY) {
      this.geminiService = new GeminiService(config.GEMINI_API_KEY);
      console.log('✅ Gemini service initialized');
    } else {
      console.warn('⚠️ Gemini API key not configured');
    }

    // Initialize AI Tutor service
    if (this.geminiService) {
      this.aiTutorService = new AITutorService({
        geminiService: this.geminiService,
        pushinessLevel: config.TUTOR_PUSHINESS_LEVEL || 3
      });
      console.log('✅ AI Tutor service initialized');
    } else {
      console.warn('⚠️ AI Tutor service not available (no Gemini API key)');
    }
  }

  setupRecognition() {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    this.recognition = new SpeechRecognition();

    // Basic configuration
    this.recognition.continuous = true;
    this.recognition.interimResults = true;
    this.recognition.lang = 'en-US';

    // Event handlers
    this.recognition.onstart = () => {
      console.log('🎤 Simple audio capture started');
      this.isListening = true;
      this.notifyStatusChange('listening');
    };

    this.recognition.onresult = (event) => {
      let finalTranscript = '';
      let interimTranscript = '';

      for (let i = event.resultIndex; i < event.results.length; i++) {
        const transcript = event.results[i][0].transcript;
        if (event.results[i].isFinal) {
          finalTranscript += transcript;
        } else {
          interimTranscript += transcript;
        }
      }

      // Only process final transcripts
      if (finalTranscript) {
        console.log('📝 Transcript:', finalTranscript);
        if (this.onTranscriptCallback) {
          this.onTranscriptCallback(finalTranscript);
        }
        
        // Process with AI if available
        this.processTranscript(finalTranscript);
      }
    };

    this.recognition.onerror = (event) => {
      console.error('❌ Speech recognition error:', event.error);
      this.isListening = false;
      this.notifyStatusChange('error');
      if (this.onErrorCallback) {
        this.onErrorCallback(event.error);
      }
    };

    this.recognition.onend = () => {
      console.log('🎤 Simple audio capture ended');
      this.isListening = false;
      this.notifyStatusChange('stopped');
      // Auto-restart if it was listening
      if (this.isListening) {
        this.start();
      }
    };
  }

  start() {
    if (!this.isSupported) {
      console.warn('❌ Speech Recognition not supported');
      return false;
    }

    if (this.isListening) {
      console.log('⚠️ Already listening');
      return true;
    }

    try {
      this.recognition.start();
      return true;
    } catch (error) {
      console.error('❌ Failed to start recognition:', error);
      return false;
    }
  }

  stop() {
    if (this.recognition && this.isListening) {
      this.recognition.stop();
      this.isListening = false;
      this.isPaused = false;
      console.log('🛑 Simple audio capture stopped');
    }
  }

  pauseListening() {
    if (this.recognition && this.isListening && !this.isPaused) {
      this.recognition.stop();
      this.isPaused = true;
      console.log('⏸️ Audio capture paused');
      this.notifyStatusChange('paused');
    }
  }

  resumeListening() {
    if (this.isPaused) {
      this.isPaused = false;
      this.start();
      console.log('▶️ Audio capture resumed');
    }
  }

  // Simple callback setters
  setOnTranscript(callback) {
    this.onTranscriptCallback = callback;
  }

  setOnError(callback) {
    this.onErrorCallback = callback;
  }

  setOnStatusChange(callback) {
    this.onStatusChangeCallback = callback;
  }

  // Helper method to notify status changes
  notifyStatusChange(status) {
    if (this.onStatusChangeCallback) {
      this.onStatusChangeCallback(status);
    }
  }

  // Process transcript with AI
  async processTranscript(transcript) {
    console.log('🎯 Processing transcript with AI:', transcript);
    
    if (!this.aiTutorService) {
      console.warn('⚠️ AI Tutor service not available');
      return;
    }

    try {
      // Pause listening while AI is processing and speaking
      this.pauseListening();
      
      console.log('🤖 Getting AI response...');
      const response = await this.aiTutorService.getResponse(transcript);
      
      if (response) {
        console.log('✅ AI Response:', response);
        
        // Use AudioManager for TTS if available
        if (window.AudioManager) {
          console.log('🔊 Playing AI response with AudioManager...');
          await window.AudioManager.playTTS(response);
          // Note: Resume listening will happen via TTS completion callback
        } else {
          console.warn('⚠️ AudioManager not available for TTS');
          // Resume listening if AudioManager not available
          this.resumeListening();
        }
      } else {
        console.warn('⚠️ AI returned empty response');
        // Resume listening if no response
        this.resumeListening();
      }
      
    } catch (error) {
      console.error('❌ Error processing transcript:', error);
      // Resume listening even if there was an error
      this.resumeListening();
    }
  }

  // Get current status
  getStatus() {
    return {
      isSupported: this.isSupported,
      isListening: this.isListening
    };
  }
}
