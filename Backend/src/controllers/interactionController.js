class InteractionLogController {
    async getInteractions(req, res) {
      try {
        const {
          page = 1,
          limit = 10,
          search,
          startDate,
          endDate,
          userId,
          sentiment
        } = req.query;
  
        const query = {};
        
        if (search) {
          query.$or = [
            { userMessage: { $regex: search, $options: 'i' } },
            { botResponse: { $regex: search, $options: 'i' } }
          ];
        }
  
        if (startDate && endDate) {
          query.timestamp = {
            $gte: new Date(startDate),
            $lte: new Date(endDate)
          };
        }
  
        if (userId && userId !== 'all') {
          query.userId = userId;
        }
  
        if (sentiment && sentiment !== 'all') {
          query.sentiment = sentiment;
        }
  
        const interactions = await InteractionService.getInteractions(query, page, limit);
        res.json(interactions);
      } catch (error) {
        res.status(500).json({ error: error.message });
      }
    }
  
    async updateInteractionStatus(req, res) {
      try {
        const { id } = req.params;
        const { status } = req.body;
        
        const interaction = await InteractionService.updateStatus(id, status);
        res.json(interaction);
      } catch (error) {
        res.status(500).json({ error: error.message });
      }
    }
  
    async exportInteractions(req, res) {
      try {
        const { format } = req.query;
        const data = await InteractionService.exportData(format);
        res.json({ downloadUrl: data });
      } catch (error) {
        res.status(500).json({ error: error.message });
      }
    }
  }
  