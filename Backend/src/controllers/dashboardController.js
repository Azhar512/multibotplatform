import DashboardStats from '../models/DashboardStats.js';
import BotInteraction from '../models/BotInteraction.js';
import User from '../models/User.js';

const getDashboardStats = async (req, res) => {
  try {
    const currentDate = new Date();
    const lastMonth = new Date();
    lastMonth.setMonth(lastMonth.getMonth() - 1);

    const currentStats = await BotInteraction.aggregate([
      {
        $match: {
          createdAt: { $gte: lastMonth }
        }
      },
      {
        $group: {
          _id: null,
          totalInteractions: { $sum: 1 },
          successfulInteractions: {
            $sum: { $cond: ['$successful', 1, 0] }
          },
          totalResponseTime: { $sum: '$responseTime' },
          totalRating: { $sum: '$feedback.rating' },
          ratingCount: {
            $sum: { $cond: [{ $gt: ['$feedback.rating', 0] }, 1, 0] }
          },
          interactionsByType: {
            $push: '$interactionType'
          },
          averagePersonality: {
            $avg: {
              friendliness: '$personalitySettings.friendliness',
              formality: '$personalitySettings.formality',
              creativity: '$personalitySettings.creativity',
              expertise: '$personalitySettings.expertise'
            }
          }
        }
      }
    ]);

    const stats = currentStats[0] || {};
    const activeUsers = await User.countDocuments({ lastActive: { $gte: lastMonth } });

    const interactionsByType = stats.interactionsByType?.reduce((acc, type) => {
      acc[type] = (acc[type] || 0) + 1;
      return acc;
    }, {}) || {};

    const calculatedStats = {
      totalInteractions: stats.totalInteractions || 0,
      interactionsByType,
      averageResponseTime: stats.totalInteractions ?
        stats.totalResponseTime / stats.totalInteractions : 0,
      successRate: stats.totalInteractions ?
        (stats.successfulInteractions / stats.totalInteractions) * 100 : 0,
      averageUserRating: stats.ratingCount ?
        stats.totalRating / stats.ratingCount : 0,
      activeUsers,
      personalityMetrics: stats.averagePersonality || {
        averageFriendliness: 0,
        averageFormality: 0,
        averageCreativity: 0,
        averageExpertise: 0
      }
    };

    await DashboardStats.create(calculatedStats);

    res.json(calculatedStats);

  } catch (error) {
    console.error('Error in getDashboardStats:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch dashboard stats'
    });
  }
};

const getInteractionTrends = async (req, res) => {
  try {
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const trends = await BotInteraction.aggregate([
      {
        $match: {
          createdAt: { $gte: thirtyDaysAgo }
        }
      },
      {
        $group: {
          _id: {
            date: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } },
            type: "$interactionType"
          },
          count: { $sum: 1 },
          avgResponseTime: { $avg: "$responseTime" },
          successRate: {
            $avg: { $cond: ["$successful", 1, 0] }
          }
        }
      },
      {
        $sort: { "_id.date": 1 }
      }
    ]);

    res.json(trends);
  } catch (error) {
    console.error('Error in getInteractionTrends:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch interaction trends'
    });
  }
};

const getPersonalityEffectiveness = async (req, res) => {
  try {
    const effectiveness = await BotInteraction.aggregate([
      {
        $match: {
          feedback: { $exists: true }
        }
      },
      {
        $group: {
          _id: null,
          friendlinessEffect: {
            $avg: {
              $multiply: ["$personalitySettings.friendliness", "$feedback.rating"]
            }
          },
          formalityEffect: {
            $avg: {
              $multiply: ["$personalitySettings.formality", "$feedback.rating"]
            }
          }
          // Add other metrics as needed
        }
      }
    ]);

    res.json(effectiveness[0] || {});
  } catch (error) {
    console.error('Error in getPersonalityEffectiveness:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch personality effectiveness'
    });
  }
};

export default {
  getDashboardStats,
  getInteractionTrends,
  getPersonalityEffectiveness
};
