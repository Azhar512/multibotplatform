#!/bin/bash

echo "🔧 Installing ALL Backend Dependencies..."

# Navigate to backend directory
cd /var/www/multibotplatform/Backend

# Install all missing packages that are commonly used in the project
echo "📦 Installing core AI and ML packages..."
npm install sentiment
npm install natural
npm install compromise
npm install franc
npm install langdetect
npm install node-nlp
npm install wink-nlp
npm install wink-eng-lite-model

# Install additional packages that might be missing
echo "📦 Installing additional utility packages..."
npm install moment
npm install date-fns
npm install lodash
npm install uuid
npm install crypto-js
npm install bcrypt
npm install jsonwebtoken
npm install express
npm install mongoose
npm install cors
npm install helmet
npm install express-rate-limit
npm install express-slow-down
npm install express-validator
npm install multer
npm install node-cron
npm install socket.io
npm install twilio
npm install winston
npm install dotenv

# Install Google Cloud packages
echo "📦 Installing Google Cloud packages..."
npm install @google-cloud/speech
npm install @google-cloud/text-to-speech
npm install @google-cloud/translate
npm install @google-cloud/language

# Install AI/ML packages
echo "📦 Installing AI/ML packages..."
npm install @huggingface/inference
npm install @xenova/transformers
npm install openai
npm install axios

# Install testing packages
echo "📦 Installing testing packages..."
npm install jest
npm install supertest
npm install eslint
npm install eslint-config-airbnb-base
npm install eslint-plugin-import

# Install development packages
echo "📦 Installing development packages..."
npm install nodemon
npm install concurrently

# Verify critical packages
echo "✅ Verifying critical package installation..."
npm list sentiment
npm list @huggingface/inference
npm list @xenova/transformers
npm list openai
npm list mongoose
npm list express

echo "🚀 Starting backend server..."
npm start
