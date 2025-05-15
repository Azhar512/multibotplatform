const cron = require('node-cron');
const Stats = require('../models/DashboardStats');
const Transaction = require('../models/Transaction');

// Helper function to calculate percentage change
const calculatePercentageChange = (current, previous) => {
  if (!previous || previous === 0) return 0;
  return ((current - previous) / previous) * 100;
};

// Function to update stats
async function updateStats() {
  try {
    console.log('Starting stats update...');

    // Get current period stats
    const currentPeriod = new Date();
    const previousPeriod = new Date();
    previousPeriod.setMonth(previousPeriod.getMonth() - 1);

    // Current period metrics
    const currentStats = await Transaction.aggregate([
      {
        $match: {
          createdAt: { $gte: previousPeriod }
        }
      },
      {
        $group: {
          _id: null,
          totalRevenue: { $sum: '$amount' },
          totalProfit: { $sum: '$profit' },
          transactionCount: { $sum: 1 }
        }
      }
    ]);

    // Previous period metrics for comparison
    const previousStats = await Transaction.aggregate([
      {
        $match: {
          createdAt: {
            $gte: new Date(previousPeriod.setMonth(previousPeriod.getMonth() - 1)),
            $lt: previousPeriod
          }
        }
      },
      {
        $group: {
          _id: null,
          totalRevenue: { $sum: '$amount' },
          totalProfit: { $sum: '$profit' },
          transactionCount: { $sum: 1 }
        }
      }
    ]);

    const current = currentStats[0] || { totalRevenue: 0, totalProfit: 0, transactionCount: 0 };
    const previous = previousStats[0] || { totalRevenue: 0, totalProfit: 0, transactionCount: 0 };

    // Calculate average sales
    const averageSales = current.transactionCount > 0 
      ? current.totalRevenue / current.transactionCount 
      : 0;
    const previousAverageSales = previous.transactionCount > 0 
      ? previous.totalRevenue / previous.transactionCount 
      : 0;

    // Calculate margin rate
    const marginRate = current.totalRevenue > 0 
      ? (current.totalProfit / current.totalRevenue) * 100 
      : 0;
    const previousMarginRate = previous.totalRevenue > 0 
      ? (previous.totalProfit / previous.totalRevenue) * 100 
      : 0;

    // Create new stats document
    const newStats = new Stats({
      totalRevenue: current.totalRevenue,
      totalProfit: current.totalProfit,
      averageSales: averageSales,
      marginRate: marginRate,
      previousStats: {
        revenueChange: calculatePercentageChange(current.totalRevenue, previous.totalRevenue),
        profitChange: calculatePercentageChange(current.totalProfit, previous.totalProfit),
        averageSalesChange: calculatePercentageChange(averageSales, previousAverageSales),
        marginRateChange: calculatePercentageChange(marginRate, previousMarginRate)
      }
    });

    await newStats.save();
    console.log('Stats updated successfully');
  } catch (error) {
    console.error('Error updating stats:', error);
  }
}

// Initialize scheduled tasks
function initScheduledTasks() {
  // Run every hour
  cron.schedule('0 * * * *', async () => {
    console.log('Running hourly stats update...');
    await updateStats();
  });

  // Run daily at midnight
  cron.schedule('0 0 * * *', async () => {
    console.log('Running daily stats update...');
    await updateStats();
  });

  // Run monthly on the 1st at midnight
  cron.schedule('0 0 1 * *', async () => {
    console.log('Running monthly stats update...');
    await updateStats();
  });
}

module.exports = {
  initScheduledTasks,
  updateStats // Export for manual triggering if needed
};