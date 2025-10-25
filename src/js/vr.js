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
import qs from 'qs';

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
	// Skip splash screen for minimal terrain experience
	// initSplash();
	
	// Go directly to terrain
	setTimeout(() => {
		const parsedQueryString = qs.parse(location.search.slice(1));
		const site = parsedQueryString.site ? parsedQueryString.site : 'landing_site';
		
		Scene.init(parsedQueryString);
		Scene.setModeType('360'); // Default to 360 mode
		Scene.loadSite(site);
	}, 100);
});
