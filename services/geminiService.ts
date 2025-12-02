import { GoogleGenAI, Chat } from "@google/genai";

class GeminiService {
  private chat: Chat | null = null;
  private ai: GoogleGenAI;

  constructor() {
    // API Key is guaranteed to be available in process.env.API_KEY
    this.ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  }

  reset() {
    this.chat = null;
  }

  async analyzeRoom(base64Image: string, mimeType: string): Promise<string> {
    try {
      // Initialize a new chat session for this analysis
      // We use gemini-3-pro-preview as requested for high quality image reasoning
      this.chat = this.ai.chats.create({
        model: 'gemini-3-pro-preview',
        config: {
          systemInstruction: `You are ZenSpace, a world-class professional home organizer, minimalist designer, and decluttering expert. 
          Your goal is to help users transform their chaotic spaces into calm, functional sanctuaries.
          
          When analyzing a room image:
          1. Be kind but direct about the clutter.
          2. Break down advice into: "Quick Wins" (5 min tasks), "Storage Solutions" (products/methods), and "Aesthetic Upgrades".
          3. Use bullet points and bold text for readability.
          4. Maintain an encouraging, non-judgmental tone.`,
        }
      });

      // Send the image and the initial prompt
      // @google/genai Chat.sendMessage supports passing an array of parts in the message field
      const response = await this.chat.sendMessage({
        message: [
          { inlineData: { data: base64Image, mimeType: mimeType } },
          { text: "Please analyze this room. Identify the main sources of clutter and provide a step-by-step guide to organizing it effectively." }
        ]
      });

      return response.text || "I couldn't generate an analysis. Please try again.";
    } catch (error) {
      console.error("Gemini Analysis Error:", error);
      throw error;
    }
  }

  async sendChatMessage(text: string): Promise<string> {
    if (!this.chat) {
      throw new Error("No active analysis session. Please upload an image first.");
    }

    try {
      const response = await this.chat.sendMessage({ message: text });
      return response.text || "I didn't catch that. Could you rephrase?";
    } catch (error) {
      console.error("Gemini Chat Error:", error);
      throw error;
    }
  }
}

export const geminiService = new GeminiService();
