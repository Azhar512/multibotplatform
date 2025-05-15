const TrainingData = require('../models/TrainingData');
const trainingService = require('../services/trainingService');

exports.uploadTrainingData = async (req, res) => {
  try {
    const fileUrls = await trainingService.uploadFiles(req.files);
    const trainingData = await TrainingData.findOneAndUpdate(
      { userId: req.user.id },
      { 
        $push: { 
          businessData: { 
            $each: fileUrls.map(url => ({
              fileUrl: url,
              fileName: url.split('/').pop(),
              fileType: url.split('.').pop()
            }))
          }
        }
      },
      { new: true, upsert: true }
    );
    
    // Trigger async training process
    trainingService.trainAI(req.user.id, fileUrls);
    
    res.json(trainingData);
  } catch (error) {
    res.status(500).json({ error: 'Failed to upload training data' });
  }
};
