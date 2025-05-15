const integrationSchema = new mongoose.Schema({
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: 'User'
    },
    apiKey: String,
    webhookUrl: String,
    crmSystem: {
      type: String,
      enum: ['none', 'salesforce', 'hubspot', 'zendesk'],
      default: 'none'
    },
    features: {
      callHandling: { type: Boolean, default: false },
      appointmentBooking: { type: Boolean, default: false },
      customerNotifications: { type: Boolean, default: false },
      returnsHandling: { type: Boolean, default: false }
    }
  });
  