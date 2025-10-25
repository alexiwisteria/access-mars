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
 * AudioManager
 *
 * Singleton class which handles voice-over and sound fx playback.
 */

import sono from 'sono';
import { Scene } from './scene';
import { VoiceCaptureService } from '../services/voiceCaptureService';

class StaticAudioManager {

	constructor() {
		this.currentVO = null;
		this.disableVO = false;
		this.disableSFX = false;
		this.useElevenLabs = false;
		this.elevenLabsEndpoint = 'https://xosrjtiqqiqcznjxjvtj.supabase.co/functions/v1/eleven-labs-tts';
		
		// Initialize voice capture service
		this.voiceCaptureService = new VoiceCaptureService();
		this.setupVoiceCaptureCallbacks();

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
			this.currentVO.stop();
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

	async playTTS( text, voiceId = '21m00Tcm4TlvDq8ikWAM' ) {
		console.log('🔊 AudioManager.playTTS called:', {
			text: text.substring(0, 50) + '...',
			voiceId: voiceId,
			endpoint: this.elevenLabsEndpoint,
			disableVO: this.disableVO,
			timestamp: new Date().toISOString()
		});

		this.stopVO();

		if ( this.disableVO ) {
			console.log('⚠️ Voice-over disabled, skipping TTS');
			return;
		}

		try {
			console.log('📡 Sending TTS request to Supabase endpoint...');
			const response = await fetch( this.elevenLabsEndpoint, {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json',
				},
				body: JSON.stringify({
					text: text,
					voice_id: voiceId
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

			this.currentVO = sono.create( audioUrl );
			console.log('🎶 Sono audio object created:', !!this.currentVO);

			this.currentVO.play();
			console.log('▶️ Audio playback started');

			return this.currentVO;
		} catch ( error ) {
			console.error( 'Error generating TTS:', error );
			return null;
		}
	}

	enableElevenLabs( enable = true ) {
		this.useElevenLabs = enable;
	}

	setupVoiceCaptureCallbacks() {
		// Handle transcript events
		this.voiceCaptureService.onTranscript((transcript, isFinal) => {
			console.log('📝 Voice transcript:', { transcript, isFinal });
			
			// You can add UI updates here to show the transcript
			if (isFinal && this.onVoiceTranscript) {
				this.onVoiceTranscript(transcript);
			}
		});

		// Handle errors
		this.voiceCaptureService.onError((error) => {
			console.error('❌ Voice capture error:', error);
			if (this.onVoiceError) {
				this.onVoiceError(error);
			}
		});

		// Handle status changes
		this.voiceCaptureService.onStatusChange((status) => {
			console.log('🎤 Voice capture status:', status);
			if (this.onVoiceStatusChange) {
				this.onVoiceStatusChange(status);
			}
		});
	}

	// Voice capture methods
	startVoiceCapture() {
		console.log('🎤 Starting voice capture...');
		return this.voiceCaptureService.startListening();
	}

	stopVoiceCapture() {
		console.log('🎤 Stopping voice capture...');
		this.voiceCaptureService.stopListening();
	}

	toggleVoiceCapture() {
		this.voiceCaptureService.toggleListening();
	}

	getVoiceCaptureStatus() {
		return {
			isListening: this.voiceCaptureService.getIsListening(),
			isSupported: this.voiceCaptureService.getIsSupported()
		};
	}

	// Callback setters for voice events
	onVoiceTranscript(callback) {
		this.onVoiceTranscript = callback;
	}

	onVoiceError(callback) {
		this.onVoiceError = callback;
	}

	onVoiceStatusChange(callback) {
		this.onVoiceStatusChange = callback;
	}

	// Get AI services for external use
	getAIServices() {
		return this.voiceCaptureService.getAIServices();
	}
}

export let AudioManager = new StaticAudioManager();

// Make AudioManager available globally for fallback TTS
if (typeof window !== 'undefined') {
  window.AudioManager = AudioManager;
  console.log('🌐 AudioManager made available globally');
}
