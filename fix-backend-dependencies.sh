#!/bin/bash

echo "🔧 Fixing Backend Dependencies..."

# Navigate to backend directory
cd /var/www/multibotplatform/Backend

# Remove node_modules and package-lock.json to ensure clean install
echo "🧹 Cleaning existing dependencies..."
rm -rf node_modules package-lock.json

# Install all dependencies fresh
echo "📦 Installing all backend dependencies..."
npm install

# Install specific missing packages
echo "📦 Installing specific AI packages..."
npm install @huggingface/inference
npm install @xenova/transformers
npm install @google-cloud/speech
npm install @google-cloud/text-to-speech

# Verify installation
echo "✅ Verifying package installation..."
npm list @huggingface/inference
npm list @xenova/transformers

echo "🚀 Starting backend server..."
npm start
