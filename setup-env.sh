#!/bin/bash

# Environment Setup Script for Access Mars
# Creates .env.local file with proper structure

echo "🔧 Setting up environment variables for Access Mars..."

# Create .env.local file
cat > .env.local << 'EOF'
# Environment Variables for Access Mars
# This file is automatically ignored by git for security

# ElevenLabs API Key
# Get from: https://elevenlabs.io/app/settings/api-keys
VITE_ELEVEN_LABS_API_KEY=

# Google Gemini API Key  
# Get from: https://makersuite.google.com/app/apikey
VITE_GEMINI_API_KEY=

# AI Tutor Pushiness Level (optional)
# Range: 1-5 (1 = very gentle, 5 = very pushy)
VITE_TUTOR_PUSHINESS_LEVEL=3
EOF

echo "✅ Created .env.local file"
echo ""
echo "📝 Next steps:"
echo "1. Edit .env.local and add your API keys"
echo "2. Get ElevenLabs API key: https://elevenlabs.io/app/settings/api-keys"
echo "3. Get Gemini API key: https://makersuite.google.com/app/apikey"
echo "4. Restart your development server: npm run start"
echo ""
echo "🔒 Security: .env.local is automatically ignored by git"
