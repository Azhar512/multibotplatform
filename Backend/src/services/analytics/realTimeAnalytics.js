class RealTimeAnalytics {
    constructor() {
      this.io = socket.getIO();
      this.activeUsers = new Set();
      this.initializeSocketListeners();
    }
  
    initializeSocketListeners() {
      this.io.on('connection', (socket) => {
        this.handleUserConnection(socket);
        
        socket.on('disconnect', () => {
          this.handleUserDisconnection(socket);
        });
      });
    }
  
    handleUserConnection(socket) {
      this.activeUsers.add(socket.id);
      this.broadcastAnalytics();
    }
  
    handleUserDisconnection(socket) {
      this.activeUsers.delete(socket.id);
      this.broadcastAnalytics();
    }
  
    async broadcastAnalytics() {
      const realTimeMetrics = await this.generateRealTimeMetrics();
      this.io.emit('analyticsUpdate', realTimeMetrics);
    }
  
    async generateRealTimeMetrics() {
      const currentTime = new Date();
      const lastHour = new Date(currentTime - 60 * 60 * 1000);
  
      return {
        activeUsers: this.activeUsers.size,
        recentInteractions: await Interaction.countDocuments({
          createdAt: { $gte: lastHour }
        }),
        sentimentDistribution: await this.getRealtimeSentimentDistribution(),
        averageResponseTime: await this.calculateRealtimeResponseTime()
      };
    }
  }
  