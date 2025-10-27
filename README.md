# Access Mars - AI Enhanced

**A Martian AI Response & Telemetry Interface, a friendly "Marti" voice on Mars, smart enough to track your vitals, and human enough to crack a joke.**

## About This Project

This is a **hackathon remix** of the original [Access Mars](https://accessmars.withgoogle.com) project, created for a Mission to Mars hackathon. The original Access Mars is a collaboration between NASA, Jet Propulsion Lab, and Google Creative Lab to bring the real surface of Mars to your browser.

This enhanced version transforms the original WebVR experience by adding AI-powered voice interaction, intelligent tutoring, and conversational exploration capabilities - creating "MARBII" (Martian AI Response & Telemetry Interface) as your personal Mars exploration companion.

![alt text](https://accessmars.withgoogle.com/img/fbshare.jpg "Access Mars")

This is an experiment, not an official Google product. We will do our best to support and maintain this experiment but your mileage may vary.

### Background
The Curiosity rover has been on the surface of Mars for over five years. In that time, it has sent over 200,000 photos back to Earth. Using these photos, engineers at JPL have reconstructed the 3D surface of Mars for their scientists to use as a mission planning tool – surveying the terrain and identifying geologically significant areas for Curiosity to investigate further. And now you can explore the same Martian surface in your browser in an immersive WebVR experience.

Access Mars features four important mission locations: the Landing Site, Pahrump Hills, Marias Pass, and Murray Buttes. Additionally, users can visit Curiosity's "Current Location" for a look at where the rover has been in the past two to four weeks. And while you explore it all, JPL scientist Katie Stack Morgan will be your guide, teaching you about key mission details and highlighting points of interest.

### AI-Enhanced Features

This enhanced version of Access Mars introduces cutting-edge AI capabilities that transform the exploration experience:

#### 🤖 AI Tutor "Marti"
- **Conversational Learning**: Interact with an intelligent AI tutor that understands Mars exploration, geology, and Curiosity's mission
- **Contextual Responses**: Get personalized explanations based on your current location and interests
- **Adaptive Teaching**: The AI adjusts its teaching style based on your questions and learning pace
- **Mission Expertise**: Deep knowledge of Mars geology, rover operations, and NASA mission details

#### 🎤 Voice Interaction
- **Natural Speech Recognition**: Speak naturally to ask questions about Mars, Curiosity, or the terrain
- **Real-time Voice Capture**: Continuous listening with visual feedback and transcript display
- **High-Quality TTS**: ElevenLabs-powered text-to-speech for natural, engaging responses
- **Hands-free Exploration**: Navigate and learn without touching controls

#### 🧠 AI Services Integration
- **ElevenLabs TTS**: Professional-grade text-to-speech with natural voice synthesis
- **Google Gemini AI**: Advanced language understanding and contextual responses
- **Smart Text Processing**: Automatic sanitization and optimization of speech content
- **Fallback Systems**: Graceful degradation when services are unavailable

#### 🎯 Enhanced User Experience
- **Visual Feedback**: Real-time voice capture status and transcript display
- **Error Handling**: Comprehensive error management with user-friendly messages
- **Cross-browser Support**: Optimized for Chrome, Edge, Safari, and Firefox
- **Progressive Enhancement**: Core Mars exploration works without AI features

### Interaction Models
Access Mars supports Desktop 360, Mobile 360, Cardboard, Daydream, GearVR, Oculus, and Vive.

#### Traditional Interactions
Users use their primary interaction mode (mouse, finger, Cardboard button, etc.) to:

* learn about the Curiosity mission by clicking points of interest and highlighted rover parts.
* move from point to point by clicking on the terrain.
* travel to different mission sites by clicking the map icon.

6DOF users can use their room scale environments to explore on foot.

#### Voice Interactions
The AI-enhanced version adds powerful voice capabilities:

* **Ask Questions**: "What is this terrain?" or "Tell me about Curiosity's mission"
* **Get Explanations**: "Why is this area important?" or "What did Curiosity discover here?"
* **Navigate**: "Take me to Pahrump Hills" or "Show me the landing site"
* **Learn**: "Explain Mars geology" or "What is the atmosphere like?"

Voice interaction works across all supported platforms and provides hands-free exploration.

### Technologies
Access Mars is built with [A-Frame](https://github.com/aframevr/aframe), [Three.js](https://github.com/mrdoob/three.js/), and [glTF](https://github.com/KhronosGroup/glTF) with [Draco](https://github.com/google/draco) mesh compression.

#### Core Technologies
- **A-Frame**: WebVR framework for immersive experiences
- **Three.js**: 3D graphics library with custom progressive JPEG decoding
- **glTF**: 3D model format with Draco compression for efficient loading
- **Web Speech API**: Browser-native speech recognition and synthesis
- **Web Workers**: Background processing for texture decoding and AI services

#### AI & Voice Technologies
- **ElevenLabs API**: High-quality text-to-speech synthesis
- **Google Gemini AI**: Advanced language understanding and generation
- **Web Speech API**: Real-time speech recognition
- **Text Sanitization**: Smart processing for optimal speech synthesis
- **Progressive Enhancement**: Graceful fallbacks for unsupported features

#### Enhanced Rendering
Our fork of Three.js implements a progressive JPEG decoding scheme originally outlined in this [paper](https://github.com/bompo/streamingtextures/blob/master/JPEGStreaming.pdf) by Stefan Wagner. We load low-resolution textures initially, then high-resolution textures are loaded in the background as the user explores. The textures closest to the user are updated first.

These high-resolution textures are loaded using the progressive decoding scheme, which allows us to load a large texture without disrupting the render thread. An empty texture of the correct size is allocated before the rendering process begins. This avoids the usual stutter experienced when allocating a new texture during runtime. The desired JPEG is then decoded in 32x32 blocks of pixels at a time, and this data is sent to the texture we allocated earlier. Using the [texSubImage2D](https://developer.mozilla.org/en-US/docs/Web/API/WebGLRenderingContext/texSubImage2D) function, only the relevant 32x32 portion of the texture is updated at once. The decoding itself is done in a [WebWorker](https://developer.mozilla.org/en-US/docs/Web/API/Web_Workers_API), which uses an [emscripten](https://github.com/kripken/emscripten) version of [libjpeg](http://ijg.org/) to decode the JPEG manually.

### Setup Instructions

#### Prerequisites
- Node.js (v14 or higher)
- Modern browser with Web Speech API support (Chrome recommended)
- Microphone access for voice features
- API keys for AI services (optional but recommended)

#### Quick Start
1. **Clone and Install**
   ```bash
   git clone <repository-url>
   cd access-mars
   npm install
   ```

2. **Run Development Server**
   ```bash
   npm run start
   ```
   The application will be available at `http://localhost:3002`

3. **Basic Usage**
   - Open the URL in Chrome or Edge
   - Allow microphone permissions when prompted
   - Start exploring Mars with voice interaction!

#### AI Features Setup (Optional)

To enable full AI capabilities, you'll need API keys for ElevenLabs and Google Gemini:

##### ElevenLabs API Key
1. Sign up at [ElevenLabs](https://elevenlabs.io/)
2. Go to Settings → API Keys
3. Create a new API key
4. Add to your environment:
   ```bash
   # Create .env.local file
   echo "VITE_ELEVEN_LABS_API_KEY=your_key_here" > .env.local
   ```

##### Google Gemini API Key
1. Visit [Google AI Studio](https://makersuite.google.com/app/apikey)
2. Create a new API key
3. Add to your environment:
   ```bash
   # Add to .env.local
   echo "VITE_GEMINI_API_KEY=your_key_here" >> .env.local
   ```

##### Automated Setup
Use the provided setup script:
```bash
./setup-env.sh
```
This will guide you through the API key configuration process.

#### Browser Requirements
- **Chrome/Edge**: Full voice capture support
- **Safari**: Limited voice support
- **Firefox**: Basic voice support
- **HTTPS Required**: Microphone access requires secure connection

#### Troubleshooting
- **Voice not working**: Ensure HTTPS and microphone permissions
- **No AI responses**: Check API keys and network connection
- **Performance issues**: Try disabling voice features in unsupported browsers

### Building
Install node and browserify if you haven't already `npm install`

Running `npm run start` will spin up a local Budo server for development. The URL will be given in the terminal.

### Usage Examples

#### Voice Interaction Examples

**Basic Questions:**
- "What is this terrain?"
- "Tell me about Curiosity's mission"
- "What did the rover discover here?"

**Navigation Commands:**
- "Take me to Pahrump Hills"
- "Show me the landing site"
- "Go to Murray Buttes"

**Learning Queries:**
- "Explain Mars geology"
- "What is the atmosphere like on Mars?"
- "How does Curiosity work?"
- "What are the mission objectives?"

**Contextual Questions:**
- "Why is this area important?"
- "What makes this location special?"
- "How old are these rocks?"

#### Visual Feedback

The voice capture system provides real-time feedback:
- **Green indicator**: Voice capture active and listening
- **Yellow indicator**: Voice capture paused or processing
- **Red indicator**: Error or microphone access denied
- **Transcript display**: Shows what you said (disappears after 5 seconds)

#### AI Tutor Responses

The AI tutor "Marti" provides:
- **Educational explanations** about Mars geology and mission details
- **Contextual information** based on your current location
- **Conversational responses** that feel natural and engaging
- **Adaptive teaching** that adjusts to your questions and interests

### Contributors
This is not an official Google product, but an experiment that was a collaborative effort by friends from [NASA JPL Ops Lab](https://opslab.jpl.nasa.gov/) and Creative Lab.

#### Original Access Mars Team
* [Jeremy Abel](https://github.com/jeremyabel)
* [Manny Tan](https://github.com/mannytan)
* [Ryan Burke](https://github.com/ryburke)
* [Kelly Ann Lum](https://github.com/kellyannl)
* [Alex Menzies](https://github.com/amenzies)

#### Hackathon Enhancement Team
This **Mission to Mars hackathon remix** adds AI-powered voice interaction and intelligent tutoring capabilities, integrating:
- **ElevenLabs** for high-quality text-to-speech
- **Google Gemini AI** for conversational intelligence
- **Web Speech API** for voice capture and recognition
- **Custom AI Tutor Service** for contextual Mars education

The hackathon enhancements maintain the original mission of bringing Mars exploration to everyone while adding modern conversational AI capabilities for a more immersive and educational experience. This project demonstrates how AI can transform traditional educational content into interactive, voice-driven learning experiences.
