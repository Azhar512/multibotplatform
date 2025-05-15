class PersonalityProcessor {
  static processPersonalityTraits(traits) {
    // Map personality traits to AI model parameters
    return {
      temperature: this.mapTemperature(traits),
      topP: this.mapTopP(traits),
      systemPrompt: this.generateSystemPrompt(traits)
    };
  }

  static mapTemperature(traits) {
    // Map creativity/randomness based on traits
    const { Humour, Empathy, Assertiveness } = traits;
    
    // Higher humour and empathy increases randomness
    const baseTemp = (Humour + Empathy) / 200;
    
    // Assertiveness can moderate temperature
    const temperatureAdjustment = Assertiveness > 70 ? 0.1 : -0.1;
    
    return Math.min(Math.max(baseTemp + temperatureAdjustment, 0.1), 1);
  }

  static mapTopP(traits) {
    // Map response diversity
    const { Confidence, Patience } = traits;
    
    // Higher confidence and patience suggest more focused responses
    return 1 - ((Confidence + Patience) / 200);
  }

  static generateSystemPrompt(traits) {
    const characterDescriptions = {
      Empathy: traits.Empathy > 70 ? "deeply understanding and compassionate" : 
               traits.Empathy > 40 ? "somewhat considerate" : "direct and matter-of-fact",
      Assertiveness: traits.Assertiveness > 70 ? "confident and decisive" : 
                     traits.Assertiveness > 40 ? "balanced" : "passive and accommodating",
      Humour: traits.Humour > 70 ? "witty and playful" : 
              traits.Humour > 40 ? "occasionally lighthearted" : "serious and professional"
    };

    return `You are an AI assistant who is ${characterDescriptions.Empathy}, 
            ${characterDescriptions.Assertiveness}, and ${characterDescriptions.Humour}. 
            Adapt your communication style accordingly while maintaining professionalism.`;
  }
}

export default PersonalityProcessor;