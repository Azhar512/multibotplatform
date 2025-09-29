import fs from 'fs/promises';
import path from 'path';
import { v4 as uuidv4 } from 'uuid';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

// For __dirname compatibility in ESM
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

class AudioStorage {
  constructor(options = {}) {
    this.baseDir = options.baseDir || path.join(__dirname, '../../storage/audio');
    this.maxSize = options.maxSize || 50 * 1024 * 1024; // 50MB default
    this.supportedFormats = ['wav', 'mp3', 'ogg'];
    this.audioFiles = new Map();
    this.metadata = new Map();
  }

  async initialize() {
    try {
      await fs.mkdir(this.baseDir, { recursive: true });
      const files = await fs.readdir(this.baseDir);

      for (const file of files) {
        const stats = await fs.stat(path.join(this.baseDir, file));
        this.metadata.set(file, {
          size: stats.size,
          created: stats.birthtime,
          lastAccessed: stats.atime
        });
      }

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
    this.metadata.get(audioFile).lastAccessed = new Date();

    return data;
  }

  async cleanup() {
    const now = new Date();
    for (const [filename, meta] of this.metadata.entries()) {
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

const audioStorage = new AudioStorage();
export default audioStorage;
