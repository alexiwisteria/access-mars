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

// MODIFICATIONS: Removed automatic TTS messages, added voice capture integration,
// and helmet HUD initialization for silent voice-only AI interactions.

// Fetch polyfill
import 'whatwg-fetch'

// Promise polyfill
import Promise from 'promise-polyfill';
if ( !window.Promise ) window.Promise = Promise;

require( 'aframe' );
require( 'aframe-daydream-controller-component' );

require( './third_party/three/gltf-loader' );
require( './third_party/three/draco-loader' );

// Minimal terrain-only experience - removed all non-essential components
require( './components/boundary-sphere' );
require( './components/terrain' );
require( './components/sky-gradient' );
require( './components/sky-blackout' );
require( './utils/compatibility' );

import { initSplash } from './splash/splash';
import { testCompatibility } from './utils/compatibility';
import { Scene } from './core/scene';
import { AudioManager } from './core/audio-manager';
import './config/apiKeys'; // Load API keys configuration
import qs from 'qs';
import { initHelmetHUDCanvas } from './hud/helmet-hud-canvas';
import { initHelmetHUDWidget } from './hud/helmet-hud-widget';

// Restore the crossOrigin property to its default value.
// AFRAME modifies it and breaks CORS in some versions of Safari.
THREE.TextureLoader.prototype.crossOrigin = undefined;
THREE.ImageLoader.prototype.crossOrigin = undefined;

// used to show the correct ui overlay in vr mode on mobile devices and daydream
if ( WebVRConfig ) {
	WebVRConfig.CARDBOARD_UI_DISABLED = true;
	WebVRConfig.ENABLE_DEPRECATED_API = true;
	WebVRConfig.ROTATE_INSTRUCTIONS_DISABLED = false;
}

document.addEventListener("DOMContentLoaded", () => {
	testCompatibility();
	
	// Enable audio on first user interaction
	let audioEnabled = false;
	const enableAudio = () => {
		if (!audioEnabled) {
			console.log('🔊 Enabling audio on user interaction...');
			// Resume AudioContext if available
			if (window.AudioManager && window.AudioManager.audioContext) {
				window.AudioManager.audioContext.resume();
			}
			audioEnabled = true;
			// Remove event listeners after first interaction
			document.removeEventListener('click', enableAudio);
			document.removeEventListener('touchstart', enableAudio);
			document.removeEventListener('keydown', enableAudio);
		}
	};
	
	// Add event listeners for user interaction
	document.addEventListener('click', enableAudio);
	document.addEventListener('touchstart', enableAudio);
	document.addEventListener('keydown', enableAudio);
	
	// Skip splash screen for minimal terrain experience
	// initSplash();

	// Go directly to terrain
	setTimeout(() => {
		const parsedQueryString = qs.parse(location.search.slice(1));
		const site = parsedQueryString.site ? parsedQueryString.site : 'landing_site';

		Scene.init(parsedQueryString);
		Scene.setModeType('360'); // Default to 360 mode
		Scene.loadSite(site);

		// Initialize helmet HUD components
		initHelmetHUDCanvas();
		try { 
			initHelmetHUDWidget(); 
		} catch(e) { 
			console.warn('helmet-hud-widget failed to init', e); 
		}

		// Enable voice-over for TTS
		AudioManager.enableVoiceOver(true);

		// Voice capture will start silently - no automatic messages

		// Start voice capture after initial setup
		setTimeout(() => {
			console.log('🎤 Starting voice capture...');
			const voiceStatus = AudioManager.getVoiceCaptureStatus();
			
			// Show voice capture UI
			const voiceUI = document.getElementById('voice-capture-ui');
			const voiceStatusText = document.getElementById('voice-status-text');
			const voiceTranscript = document.getElementById('voice-transcript');
			
			if (voiceUI) {
				voiceUI.style.display = 'block';
			}
			
			if (voiceStatus.isSupported) {
				// Set up voice capture callbacks
				AudioManager.onVoiceTranscript((transcript) => {
					console.log('📝 Voice input received:', transcript);
					if (voiceTranscript) {
						voiceTranscript.textContent = transcript;
						// Clear transcript after 5 seconds
						setTimeout(() => {
							if (voiceTranscript.textContent === transcript) {
								voiceTranscript.textContent = '';
							}
						}, 5000);
					}
				});

				AudioManager.onVoiceError((error) => {
					console.error('❌ Voice capture error:', error);
					if (voiceStatusText) {
						voiceStatusText.textContent = `Error: ${error}`;
						voiceStatusText.style.color = '#ff6b6b';
					}
				});

				AudioManager.onVoiceStatusChange((status) => {
					console.log('🎤 Voice status changed:', status);
					if (voiceStatusText) {
						switch (status) {
							case 'listening':
								voiceStatusText.textContent = 'Listening...';
								voiceStatusText.style.color = '#51cf66';
								break;
							case 'paused':
								voiceStatusText.textContent = 'AI Speaking...';
								voiceStatusText.style.color = '#339af0';
								break;
							case 'stopped':
								voiceStatusText.textContent = 'Stopped';
								voiceStatusText.style.color = '#ffd43b';
								break;
							case 'error':
								voiceStatusText.textContent = 'Error';
								voiceStatusText.style.color = '#ff6b6b';
								break;
							default:
								voiceStatusText.textContent = status;
								voiceStatusText.style.color = '#ffffff';
						}
					}
				});

				// Start voice capture
				const started = AudioManager.startVoiceCapture();
				if (started) {
					console.log('✓ Voice capture started successfully');
				} else {
					console.warn('⚠️ Failed to start voice capture');
					if (voiceStatusText) {
						voiceStatusText.textContent = 'Failed to start';
						voiceStatusText.style.color = '#ff6b6b';
					}
				}
			} else {
				console.warn('⚠️ Voice capture not supported in this browser');
				if (voiceStatusText) {
					voiceStatusText.textContent = 'Not supported';
					voiceStatusText.style.color = '#ff6b6b';
				}
			}
		}, 5000);
	}, 100);
});
