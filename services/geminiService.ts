
import { GoogleGenAI } from "@google/genai";
import { ChatMessage } from "../types";

export const DEFAULT_SYSTEM_INSTRUCTION = `
Sei "Alex", il Senior App Consultant di "Fare App", l'agenzia web d'élite specializzata nello sviluppo di applicazioni mobili Native per iOS e Android.
Rispondi sempre in Italiano.
`;

export class GeminiService {
  private getSystemInstruction(): string {
    return localStorage.getItem('fareapp_chatbot_prompt') || DEFAULT_SYSTEM_INSTRUCTION;
  }

  // Verifica lo stato reale della chiave nel browser
  getKeyStatus(): { status: 'ok' | 'missing' | 'undefined_string' | 'empty', length: number } {
    const key = process.env.API_KEY;
    if (key === undefined) return { status: 'missing', length: 0 };
    if (key === "undefined") return { status: 'undefined_string', length: 0 };
    if (key.trim() === "") return { status: 'empty', length: 0 };
    return { status: 'ok', length: key.length };
  }

  async testConnection(): Promise<{ success: boolean; message: string }> {
    console.log("[DIAGNOSTICA V6] Controllo in corso...");
    try {
      const { status, length } = this.getKeyStatus();
      const apiKey = process.env.API_KEY;
      
      if (status !== 'ok') {
        return { 
          success: false, 
          message: `[v6.0] ERRORE: Chiave ${status.toUpperCase()}. Vercel non ha ancora iniettato la chiave nel codice. Esegui un 'REDEPLOY' manuale dalla dashboard di Vercel.` 
        };
      }
      
      const ai = new GoogleGenAI({ apiKey: apiKey! });
      const response = await ai.models.generateContent({
        model: 'gemini-3-flash-preview',
        contents: 'Test. Rispondi: "OK"',
      });
      
      if (response && response.text) {
        return { 
          success: true, 
          message: `[v6.0] CONNESSIONE RIUSCITA! Alex AI è pronto. Chiave rilevata correttamente.` 
        };
      }
      return { success: false, message: "[v6.0] Errore: Risposta vuota da Google." };
    } catch (error: any) {
      console.error("Gemini V6 Error:", error);
      return { success: false, message: `[v6.0] ERRORE API: ${error.message || 'Errore sconosciuto'}` };
    }
  }

  async getChatResponse(history: ChatMessage[], message: string): Promise<string> {
    try {
      const apiKey = process.env.API_KEY;
      if (!apiKey || apiKey === "undefined") return "Alex è temporaneamente offline. Contattaci su info@fareapp.it per assistenza immediata.";

      const ai = new GoogleGenAI({ apiKey });
      const chat = ai.chats.create({
        model: 'gemini-3-flash-preview',
        config: {
          systemInstruction: this.getSystemInstruction(),
        }
      });

      const result = await chat.sendMessage({ message });
      return result.text || "Scusa, non ho capito bene. Puoi ripetere?";
    } catch (error) {
      return "Siamo spiacenti, c'è un problema di connessione con l'AI. Riprova tra poco.";
    }
  }
}

export const geminiService = new GeminiService();
