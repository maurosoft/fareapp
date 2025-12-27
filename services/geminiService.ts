
import { GoogleGenAI } from "@google/genai";
import { ChatMessage } from "../types";

export const DEFAULT_SYSTEM_INSTRUCTION = `
Sei "Alex", il Senior App Consultant di "Fare App", l'agenzia web d'élite specializzata nello sviluppo di applicazioni mobili Native per iOS e Android.
Rispondi sempre in Italiano.
`;

export class GeminiService {
  private getApiKey(): string | undefined {
    try {
      // @ts-ignore
      return process.env.API_KEY;
    } catch {
      return undefined;
    }
  }

  private getSystemInstruction(): string {
    return localStorage.getItem('fareapp_chatbot_prompt') || DEFAULT_SYSTEM_INSTRUCTION;
  }

  getKeyStatus() {
    const key = this.getApiKey();
    console.group("AI Diagnostics v12");
    console.log("Key present:", !!key);
    console.groupEnd();

    if (!key || key === "undefined" || key === "") {
      return { status: 'missing' as const, length: 0, env: 'Variabile non rilevata' };
    }
    return { status: 'ok' as const, length: key.length, env: 'Configurata' };
  }

  async testConnection(): Promise<{ success: boolean; message: string }> {
    try {
      const apiKey = this.getApiKey();
      
      if (!apiKey || apiKey === "undefined") {
        return { 
          success: false, 
          message: "[v12.0] ERRORE: Chiave non trovata nel sistema. Controlla Vercel Env Vars e fai un Redeploy." 
        };
      }
      
      const ai = new GoogleGenAI({ apiKey });
      const response = await ai.models.generateContent({
        model: 'gemini-3-flash-preview',
        contents: 'Test connessione v12. Rispondi OK.',
      });
      
      if (response && response.text) {
        return { success: true, message: "[v12.0] CONNESSIONE RIUSCITA! Alex è online." };
      }
      return { success: false, message: "[v12.0] Errore risposta." };
    } catch (error: any) {
      return { success: false, message: `[v12.0] ERRORE: ${error.message}` };
    }
  }

  async getChatResponse(history: ChatMessage[], message: string): Promise<string> {
    try {
      const apiKey = this.getApiKey();
      if (!apiKey || apiKey === "undefined") return "Assistente offline. Scrivici a info@fareapp.it";

      const ai = new GoogleGenAI({ apiKey });
      const chat = ai.chats.create({
        model: 'gemini-3-flash-preview',
        config: { systemInstruction: this.getSystemInstruction() }
      });

      const result = await chat.sendMessage({ message });
      return result.text || "Non ho ricevuto risposta.";
    } catch (error) {
      return "Spiacente, errore di comunicazione.";
    }
  }
}

export const geminiService = new GeminiService();
