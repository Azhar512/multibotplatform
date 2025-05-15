class InteractionService {
    constructor() {
      this.personalityService = new PersonalityService();
      this.analyticsService = new InteractionAnalytics();
      this.aiService = new AIService();
    }
  
    async getInteractionDetails(interactionId) {
      const interaction = await Interaction.findById(interactionId);
      const personality = await this.personalityService.getPersonalityConfig(interactionId);
      const aiContext = await this.aiService.getContextualInfo(interactionId);
      
      return {
        ...interaction.toJSON(),
        personalitySettings: personality,
        aiContext: aiContext
      };
    }
  
    async getDashboardMetrics(timeRange) {
      return {
        metrics: await this.analyticsService.generateInteractionMetrics(timeRange),
        sentimentTrends: await this.analyticsService.getSentimentTrends(
          timeRange.startDate,
          timeRange.endDate
        )
      };
    }
  }