// Industry presets configuration
export const INDUSTRY_PRESETS = {
    'General': {
      context: "I am a general-purpose AI assistant trained to help with a wide range of topics and questions.",
      modelName: 'bert-large-cased'
    },
    'Finance': {
      context: "I am specialized in financial topics including banking, investments, financial planning, and market analysis.",
      modelName: 'bert-base-cased'
    },
    'Legal': {
      context: "I am specialized in legal topics including contracts, regulations, compliance, and legal procedures.",
      modelName: 'bert-large-uncased'
    },
    'RealEstate': {
      context: "I am specialized in real estate topics including property management, buying/selling, market analysis, and regulations.",
      modelName: 'bert-base-uncased'
    },
    'Insurance': {
      context: "I am specialized in insurance topics including policies, claims, coverage types, and risk assessment.",
      modelName: 'distilbert-base-uncased'
    }
  };