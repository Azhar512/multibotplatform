import twilio from "twilio";
import generateCallInsights from "./aiCallService.js";
import CallLog from "../models/Call.js";
import PersonalityProcessor from "../utils/personalityProcessor.js";

class TwilioService {
  constructor() {
    this.client = null;
    this.isInitialized = false;
  }

  generateAccessToken(identity) {
    const AccessToken = twilio.jwt.AccessToken;
    const VoiceGrant = AccessToken.VoiceGrant;

    const safeIdentity = String(identity).trim();

    const voiceGrant = new VoiceGrant({
      outgoingApplicationSid: process.env.TWILIO_APP_SID,
      incomingAllow: true,
    });

    const token = new AccessToken(
      process.env.TWILIO_ACCOUNT_SID,
      process.env.TWILIO_API_KEY,
      process.env.TWILIO_API_SECRET,
      { identity: safeIdentity },
    );

    token.addGrant(voiceGrant);

    console.log(`Generated token for identity: ${safeIdentity}`);

    return token.toJwt();
  }

  async initialize() {
    try {
      console.log("Initializing TwilioService...");

      console.log("TWILIO_ACCOUNT_SID exists:", !!process.env.TWILIO_ACCOUNT_SID);
      console.log("TWILIO_AUTH_TOKEN exists:", !!process.env.TWILIO_AUTH_TOKEN);

      if (!process.env.TWILIO_ACCOUNT_SID || !process.env.TWILIO_AUTH_TOKEN) {
        console.warn("Twilio credentials not configured. Twilio features will be disabled.");
        return false;
      }

      try {
        console.log("Creating new Twilio client...");
        this.client = twilio(
          String(process.env.TWILIO_ACCOUNT_SID).trim(),
          String(process.env.TWILIO_AUTH_TOKEN).trim(),
        );

        if (!this.client) {
          this.client = twilio({
            username: String(process.env.TWILIO_ACCOUNT_SID).trim(),
            password: String(process.env.TWILIO_AUTH_TOKEN).trim(),
          });
        }
      } catch (clientError) {
        console.error("Failed to create Twilio client:", clientError);
        return false;
      }

      if (!this.client) {
        console.error("Failed to initialize Twilio client");
        return false;
      }  

      console.log("Testing Twilio connection...");
      await this.client.api.accounts(process.env.TWILIO_ACCOUNT_SID).fetch();

      this.isInitialized = true;
      console.log("TwilioService initialized successfully");
      return true;
    } catch (error) {
      console.error("Failed to initialize TwilioService:", error);
      console.error("Error details:", JSON.stringify(error, null, 2));
      return false;
    }
  }

  async initiateCall(phoneNumber, personalitySettings, aiModel, voiceType) {
    try {
      if (!this.isInitialized || !this.client) {
        await this.initialize();
        if (!this.isInitialized) {
          throw new Error("TwilioService not initialized.");
        }
      }

      const toNumber = phoneNumber.startsWith("+") ? phoneNumber : `+${phoneNumber}`;
      const fromNumber = process.env.TWILIO_PHONE_NUMBER.startsWith("+")
        ? process.env.TWILIO_PHONE_NUMBER
        : `+${process.env.TWILIO_PHONE_NUMBER}`;

      console.log(`Initiating call from ${fromNumber} to ${toNumber}`);

      const call = await this.client.calls.create({
        to: toNumber,
        from: fromNumber,
        url: `${process.env.BACKEND_URL}/api/twilio/handle-call`,
      });

      console.log(`Call initiated with SID: ${call.sid}, status: ${call.status}`);

      return {
        callSid: call.sid,
        status: call.status,
      };
    } catch (error) {
      console.error("Call Initiation Error:", error);
      throw new Error(`Failed to initiate call: ${error.message}`);
    }
  }

  generateTwiML(personalitySettings) {
    try {
      const VoiceResponse = twilio.twiml.VoiceResponse;
      const response = new VoiceResponse();

      const traits = personalitySettings ? PersonalityProcessor.processPersonalityTraits(personalitySettings) : {};

      response.say(
        {
          voice: "alice",
          language: "en-US",
        },
        "Hello, this is your AI assistant calling. How can I help you today?",
      );

      response.pause({ length: 1 });

      const gather = response.gather({
        input: "speech",
        timeout: 5,
        action: `${process.env.BACKEND_URL}/api/twilio/collect-input`,
        method: "POST",
      });

      gather.say("Please tell me how I can assist you.");

      response.say("I didn't hear anything. Please call back when you're ready to chat.");

      response.hangup();

      return response.toString();
    } catch (error) {
      console.error("Error generating TwiML:", error);

      const VoiceResponse = twilio.twiml.VoiceResponse;
      const response = new VoiceResponse();
      response.say("Sorry, there was an error processing your call. Please try again later.");
      response.hangup();

      return response.toString();
    }
  }

  async processCallRecording(recordingUrl, callSid) {
    try {
      if (!this.isInitialized || !this.client) {
        throw new Error("TwilioService not initialized. Please initialize before processing recordings.");
      }

      const insights = await generateCallInsights(recordingUrl);

      await CallLog.findOneAndUpdate(
        { callSid },
        {
          endTime: new Date(),
          insights,
          status: "completed",
        },
      );

      return insights;
    } catch (error) {
      console.error("Call Recording Processing Error:", error);
      throw new Error(`Failed to process call recording: ${error.message}`);
    }
  }
}

export default new TwilioService();