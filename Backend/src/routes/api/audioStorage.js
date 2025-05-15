const fs = require('fs').promises;
const path = require('path');
const { v4: uuidv4 } = require('uuid');

class audioStorage {
  constructor(options = {}) {
    this.baseDir = options.baseDir || path.join(__dirname, '../../storage/audio');
    this.maxSize = options.maxSize || 50 * 1024 * 1024; // 50MB default
    this.supportedFormats = ['wav', 'mp3', 'ogg'];
    this.audioFiles = new Map();
    this.metadata = new Map();
  }

  async initialize() {
    try {
      // Create storage directory if it doesn't exist
      await fs.mkdir(this.baseDir, { recursive: true });
      
      // Load existing audio files metadata
      const files = await fs.readdir(this.baseDir);
      for (const file of files) {
        const stats = await fs.stat(path.join(this.baseDir, file));
        this.metadata.set(file, {
          size: stats.size,
          created: stats.birthtime,
          lastAccessed: stats.atime
        });
      }

      // Set up cleanup interval (every 24 hours)
      setInterval(() => this.cleanup(), 24 * 60 * 60 * 1000);
      
      console.log('Audio storage initialized successfully');
      return true;
    } catch (error) {
      console.error('Failed to initialize audio storage:', error);
      throw error;
    }
  }

  async store(audioData, format) {
    if (!this.supportedFormats.includes(format)) {
      throw new Error(`Unsupported format. Supported formats: ${this.supportedFormats.join(', ')}`);
    }

    const id = uuidv4();
    const filename = `${id}.${format}`;
    const filepath = path.join(this.baseDir, filename);

    await fs.writeFile(filepath, audioData);
    this.metadata.set(filename, {
      size: audioData.length,
      created: new Date(),
      lastAccessed: new Date()
    });

    return id;
  }

  async get(id) {
    const files = await fs.readdir(this.baseDir);
    const audioFile = files.find(file => file.startsWith(id));
    
    if (!audioFile) {
      throw new Error('Audio file not found');
    }

    const filepath = path.join(this.baseDir, audioFile);
    const data = await fs.readFile(filepath);
    
    // Update last accessed time
    this.metadata.get(audioFile).lastAccessed = new Date();
    
    return data;
  }

  async cleanup() {
    const now = new Date();
    for (const [filename, meta] of this.metadata.entries()) {
      // Delete files older than 7 days or not accessed in 3 days
      const ageInDays = (now - meta.created) / (1000 * 60 * 60 * 24);
      const lastAccessedDays = (now - meta.lastAccessed) / (1000 * 60 * 60 * 24);
      
      if (ageInDays > 7 || lastAccessedDays > 3) {
        const filepath = path.join(this.baseDir, filename);
        await fs.unlink(filepath);
        this.metadata.delete(filename);
      }
    }
  }
}

module.exports = new audioStorage();