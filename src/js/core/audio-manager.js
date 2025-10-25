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

// MODIFICATIONS: Enhanced with voice capture integration, TTS completion callbacks,
// and pause/resume functionality for AI voice interactions.


/**
 * AudioManager
 *
 * Singleton class which handles voice-over and sound fx playback.
 */

import sono from 'sono';
import { Scene } from './scene';
import { SimpleAudioCapture } from '../services/simpleAudioCapture';
import { AI_CONFIG } from '../config/aiConfig';

class StaticAudioManager {

	constructor() {
		this.currentVO = null;
		this.disableVO = false;
		this.disableSFX = false;
		this.useElevenLabs = false;
		this.elevenLabsEndpoint = 'https://xosrjtiqqiqcznjxjvtj.supabase.co/functions/v1/eleven-labs-tts';
		
		// Initialize simple audio capture
		this.audioCapture = new SimpleAudioCapture();
		this.setupAudioCaptureCallbacks();

		// TTS completion callback
		this.onTTSCompleteCallback = null;

		const audio = document.createElement( 'audio' );
		const status = !!( audio.canPlayType && audio.canPlayType( 'audio/mpeg;' ).replace( /no/, '' ) );
		this.format = status ? '.mp3' : '.ogg';
	}

	playVO( name, delay = 0 ) {
		this.stopVO();

		if ( this.disableVO ) return;

		this.currentVO = sono.create( 'vo/' + name + this.format );

		// Play the VO with a given delay
		this.currentVO.play( delay );

		return this.currentVO;
	}

	stopVO() {
		if ( this.currentVO ) {
			if (this.currentVO.stop) {
				// Sono object
				this.currentVO.stop();
			} else if (this.currentVO.pause) {
				// HTML5 Audio object
				this.currentVO.pause();
				this.currentVO.currentTime = 0;
			}
		}
	}

	playSFX( name , isByPassed ) {
		this.currentSFX = sono.create( 'sfx/' + name + this.format );

		if ( !this.disableSFX || isByPassed) {
			this.currentSFX.play();
		}

		return this.currentSFX;
	}

	playAtmosphere( name ) {
		if ( this.disableAtmosphere ) return;
		this.currentAtmosphere = sono.create( 'sfx/atmosphere' + this.format );
		this.currentAtmosphere.loop = true;
		this.currentAtmosphere.volume = 0.4;
		this.currentAtmosphere.play();
	}

	async playTTS( text, voiceId = AI_CONFIG.DEFAULT_VOICE_ID ) {
		console.log('🔊 AudioManager.playTTS called:', {
			text: text.substring(0, 50) + '...',
			voiceId: voiceId,
			disableVO: this.disableVO,
			timestamp: new Date().toISOString()
		});

		this.stopVO();

		if ( this.disableVO ) {
			console.log('⚠️ Voice-over disabled, skipping TTS');
			return;
		}

		try {
			// Use ElevenLabs API directly instead of Supabase endpoint
			console.log('📡 Sending TTS request to ElevenLabs API...');
			
			// Get ElevenLabs API key from global config
			const elevenLabsApiKey = window.AI_CONFIG && window.AI_CONFIG.ELEVEN_LABS_API_KEY;
			if (!elevenLabsApiKey) {
				console.error('❌ ElevenLabs API key not available');
				return null;
			}

			const response = await fetch(`https://api.elevenlabs.io/v1/text-to-speech/${voiceId}`, {
				method: 'POST',
				headers: {
					'Accept': 'audio/mpeg',
					'Content-Type': 'application/json',
					'xi-api-key': elevenLabsApiKey,
				},
				body: JSON.stringify({
					text: text,
					model_id: 'eleven_monolingual_v1',
					voice_settings: {
						stability: 0.5,
						similarity_boost: 0.75,
					},
				})
			});

			console.log('📥 TTS response received:', {
				status: response.status,
				statusText: response.statusText,
				ok: response.ok
			});

			if ( !response.ok ) {
				const errorText = await response.text();
				console.error( '❌ Eleven Labs TTS failed:', errorText );
				return null;
			}

			const audioBlob = await response.blob();
			console.log('🎵 Audio blob received:', {
				size: audioBlob.size,
				type: audioBlob.type,
				timestamp: new Date().toISOString()
			});

			const audioUrl = URL.createObjectURL( audioBlob );
			console.log('🔗 Audio URL created:', audioUrl);

			// Use native HTML5 Audio instead of Sono for TTS
			const audio = new Audio(audioUrl);
			console.log('🎶 HTML5 Audio object created:', !!audio);

			// Set up event listeners for cleanup
			audio.addEventListener('ended', () => {
				console.log('🔊 TTS playback ended');
				URL.revokeObjectURL(audioUrl);
				// Notify that TTS is complete
				if (this.onTTSCompleteCallback) {
					this.onTTSCompleteCallback();
				}
			});

			audio.addEventListener('error', (error) => {
				console.error('❌ TTS playback error:', error);
				URL.revokeObjectURL(audioUrl);
			});

			// Store reference for potential cleanup
			this.currentVO = audio;

			// Play the audio
			audio.play().then(() => {
				console.log('▶️ Audio playback started');
			}).catch((playError) => {
				console.error('❌ Failed to start audio playback:', playError);
				URL.revokeObjectURL(audioUrl);
			});

			return audio;
		} catch ( error ) {
			console.error( 'Error generating TTS:', error );
			return null;
		}
	}

	enableElevenLabs( enable = true ) {
		this.useElevenLabs = enable;
	}

	enableVoiceOver( enable = true ) {
		this.disableVO = !enable;
		console.log('🔊 Voice-over', enable ? 'enabled' : 'disabled');
	}

	setupAudioCaptureCallbacks() {
		// Handle transcript events
		this.audioCapture.setOnTranscript((transcript) => {
			console.log('📝 Audio transcript:', transcript);
			
			// You can add UI updates here to show the transcript
			if (this.onVoiceTranscriptCallback) {
				this.onVoiceTranscriptCallback(transcript);
			}
		});

		// Handle errors
		this.audioCapture.setOnError((error) => {
			console.error('❌ Audio capture error:', error);
			if (this.onVoiceErrorCallback) {
				this.onVoiceErrorCallback(error);
			}
		});

		// Handle status changes
		this.audioCapture.setOnStatusChange((status) => {
			console.log('🎤 Audio capture status:', status);
			if (this.onVoiceStatusChangeCallback) {
				this.onVoiceStatusChangeCallback(status);
			}
		});
	}

	// Voice capture methods
	startVoiceCapture() {
		console.log('🎤 Starting simple voice capture...');
		return this.audioCapture.start();
	}

	stopVoiceCapture() {
		console.log('🎤 Stopping simple voice capture...');
		this.audioCapture.stop();
	}

	toggleVoiceCapture() {
		if (this.audioCapture.isListening) {
			this.stopVoiceCapture();
		} else {
			this.startVoiceCapture();
		}
	}

	getVoiceCaptureStatus() {
		return this.audioCapture.getStatus();
	}

	// Voice capture pause/resume methods
	pauseVoiceCapture() {
		this.audioCapture.pauseListening();
	}

	resumeVoiceCapture() {
		this.audioCapture.resumeListening();
	}

	// Callback setters for voice events
	onVoiceTranscript(callback) {
		this.onVoiceTranscriptCallback = callback;
	}

	onVoiceError(callback) {
		this.onVoiceErrorCallback = callback;
	}

	onVoiceStatusChange(callback) {
		this.onVoiceStatusChangeCallback = callback;
	}

	// TTS completion callback
	onTTSComplete(callback) {
		this.onTTSCompleteCallback = callback;
	}
}

export let AudioManager = new StaticAudioManager();

// Make AudioManager available globally for fallback TTS
if (typeof window !== 'undefined') {
  window.AudioManager = AudioManager;
  console.log('🌐 AudioManager made available globally');
}
