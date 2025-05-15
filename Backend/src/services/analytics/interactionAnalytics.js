class InteractionAnalytics {
    async generateInteractionMetrics(timeRange) {
      // Generate metrics for interaction log dashboard
      return {
        totalInteractions: await this.countInteractions(timeRange),
        sentimentBreakdown: await this.getSentimentDistribution(timeRange),
        averageResponseTime: await this.calculateAverageResponseTime(timeRange),
        resolutionRate: await this.calculateResolutionRate(timeRange)
      };
    }
  
    async getSentimentTrends(startDate, endDate) {
      // Track sentiment trends over time
      return await Interaction.aggregate([
        {
          $match: {
            timestamp: { $gte: startDate, $lte: endDate }
          }
        },
        {
          $group: {
            _id: {
              date: { $dateToString: { format: "%Y-%m-%d", date: "$timestamp" } },
              sentiment: "$sentiment"
            },
            count: { $sum: 1 }
          }
        }
      ]);
    }
  }