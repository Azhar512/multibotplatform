const socket = require('../../config/socket');

class PersonalityService {
  constructor() {
    this.io = socket.getIO();
  }

  async updatePersonalitySettings(settings) {
    try {
      // Update personality settings in database
      await PersonalityConfig.findOneAndUpdate(
        { isActive: true },
        { settings },
        { new: true }
      );

      // Emit real-time update
      this.io.emit('personalityUpdate', settings);
      
      return { success: true, settings };
    } catch (error) {
      console.error('Personality update error:', error);
      throw error;
    }
  }

  subscribeToPersonalityUpdates(socket) {
    socket.on('requestPersonalityUpdate', async () => {
      const currentSettings = await PersonalityConfig.findOne({ isActive: true });
      socket.emit('personalityUpdate', currentSettings);
    });
  }
}
