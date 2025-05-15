const User = require('../models/User');

exports.getUsers = async (req, res) => {
  try {
    const { search, dateJoined, interactionFrequency, sentiment, page = 1, limit = 10 } = req.query;
    
    let query = {};
    
    // Search filter
    if (search) {
      query.$or = [
        { name: new RegExp(search, 'i') },
        { email: new RegExp(search, 'i') },
        { id: new RegExp(search, 'i') }
      ];
    }
    
    // Date joined filter
    if (dateJoined) {
      const date = new Date();
      switch(dateJoined) {
        case 'last7days':
          date.setDate(date.getDate() - 7);
          break;
        case 'last30days':
          date.setDate(date.getDate() - 30);
          break;
        case 'last90days':
          date.setDate(date.getDate() - 90);
          break;
      }
      query.dateJoined = { $gte: date };
    }
    
    const users = await User.find(query)
      .skip((page - 1) * limit)
      .limit(limit)
      .select('-password');
      
    const total = await User.countDocuments(query);
    
    res.json({
      users,
      totalPages: Math.ceil(total / limit),
      currentPage: page,
      total
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.banUser = async (req, res) => {
  try {
    const user = await User.findByIdAndUpdate(
      req.params.id,
      { status: 'banned' },
      { new: true }
    );
    res.json(user);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.deleteUser = async (req, res) => {
  try {
    await User.findByIdAndDelete(req.params.id);
    res.json({ message: 'User deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};