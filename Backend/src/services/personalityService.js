class PersonalityService {
  constructor() {
    this.empathyPhrases = [
      "I understand your perspective. ",
      "I see where you're coming from. ",
      "That's a valid point. ",
      "I appreciate you sharing that. ",
      "I hear what you're saying. ",
      "Your feelings are completely valid. "
    ];

    this.humorPhrases = {
      light: [
        " 😊 ",
        " (in a friendly way) ",
        " - and hey, who doesn't love that? ",
        " - isn't technology fun? "
      ],
      technical: [
        " (Error 404: Boring response not found!) ",
        " sudo make_it_awesome ",
        " *beep boop* Just kidding! ",
        " /execute order_fun.js "
      ],
      professional: [
        " (professionally speaking, of course!) ",
        " - as they say in the business! ",
        " - and that's not just corporate speak! "
      ]
    };

    this.patienceAdditions = [
      " Let me know if you'd like me to explain anything in more detail.",
      " I'm happy to break this down further if needed.",
      " Feel free to ask questions if anything isn't clear.",
      " We can take this step by step if you prefer.",
      " I can provide more examples if that would help."
    ];
  }

  adjustResponse(response, personalitySettings) {
    let adjustedResponse = response;
    const contextType = this.determineContext(response);

    // Apply personality adjustments based on threshold and context
    if (personalitySettings.Empathy > 70) {
      adjustedResponse = this.addEmpathy(adjustedResponse);
    }

    if (personalitySettings.Assertiveness > 70) {
      adjustedResponse = this.makeAssertive(adjustedResponse);
    }

    if (personalitySettings.Humour > 60) {
      adjustedResponse = this.addHumor(adjustedResponse, contextType);
    }

    if (personalitySettings.Patience > 75) {
      adjustedResponse = this.makePatient(adjustedResponse);
    }

    return adjustedResponse;
  }

  determineContext(text) {
    // Determine the context based on content analysis
    if (text.match(/code|function|api|error|bug|debug/i)) {
      return 'technical';
    } else if (text.match(/meeting|business|client|project|deadline/i)) {
      return 'professional';
    } else {
      return 'light';
    }
  }

  addEmpathy(text) {
    const randomPhrase = this.empathyPhrases[Math.floor(Math.random() * this.empathyPhrases.length)];
    
    // Avoid adding empathy phrases to error messages or technical instructions
    if (text.match(/error|exception|warning|fail/i)) {
      return text;
    }
    
    return randomPhrase + text;
  }

  makeAssertive(text) {
    return text
      .replace(/perhaps|maybe|might|possibly/gi, 'definitely')
      .replace(/I think|I believe|It seems/gi, 'I know')
      .replace(/could|would/gi, 'will')
      .replace(/try to/gi, '')
      .replace(/\?$/g, '.'); // Replace questions with statements
  }

  addHumor(text, context) {
    // Don't add humor to error messages or critical information
    if (text.match(/error|warning|critical|important|alert/i)) {
      return text;
    }

    const humorSet = this.humorPhrases[context] || this.humorPhrases.light;
    const randomHumor = humorSet[Math.floor(Math.random() * humorSet.length)];

    // Add humor at an appropriate point in the text
    const sentences = text.split('. ');
    if (sentences.length > 1) {
      // Add humor after a complete sentence
      const insertPoint = Math.floor(sentences.length / 2);
      sentences[insertPoint] = sentences[insertPoint] + randomHumor;
      return sentences.join('. ');
    }

    return text + randomHumor;
  }

  makePatient(text) {
    const randomPatience = this.patienceAdditions[Math.floor(Math.random() * this.patienceAdditions.length)];
    
    // Don't add patience phrases to short or simple responses
    if (text.length < 50 || text.split(' ').length < 10) {
      return text;
    }
    
    return text + randomPatience;
  }
}

// Create and export a single instance
const personalityService = new PersonalityService();
export default personalityService;