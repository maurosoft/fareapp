
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

  // Analisi profonda dello stato della chiave nel contesto di runtime
  getKeyStatus(): { status: 'ok' | 'missing' | 'undefined_string' | 'empty' | 'malformed', length: number, type: string } {
    try {
      const key = process.env.API_KEY;
      const type = typeof key;
      
      if (key === undefined) return { status: 'missing', length: 0, type };
      if (key === "undefined") return { status: 'undefined_string', length: 0, type };
      if (typeof key !== 'string') return { status: 'malformed', length: 0, type };
      if (key.trim() === "") return { status: 'empty', length: 0, type };
      
      return { status: 'ok', length: key.length, type };
    } catch (e) {
      return { status: 'missing', length: 0, type: 'error' };
    }
  }

  async testConnection(): Promise<{ success: boolean; message: string }> {
    console.log("[DIAGNOSTICA V8] Avvio test ambientale...");
    try {
      const { status, length } = this.getKeyStatus();
      const apiKey = process.env.API_KEY;
      
      if (status !== 'ok') {
        return { 
          success: false, 
          message: `[v8.0] ERRORE: La chiave è ${status.toUpperCase()}. 
          Vercel richiede un REDEPLOY dopo l'aggiunta delle variabili d'ambiente.` 
        };
      }
      
      const ai = new GoogleGenAI({ apiKey: apiKey! });
      const response = await ai.models.generateContent({
        model: 'gemini-3-flash-preview',
        contents: 'Test. Rispondi: OK',
      });
      
      if (response && response.text) {
        return { 
          success: true, 
          message: `[v8.0] CONNESSIONE ATTIVA. Alex AI è pronto.` 
        };
      }
      return { success: false, message: "[v8.0] Risposta vuota." };
    } catch (error: any) {
      return { success: false, message: `[v8.0] ERRORE API: ${error.message}` };
    }
  }

  async getChatResponse(history: ChatMessage[], message: string): Promise<string> {
    try {
      const apiKey = process.env.API_KEY;
      if (!apiKey || apiKey === "undefined") return "Alex è in manutenzione. Contattaci a info@fareapp.it";

      const ai = new GoogleGenAI({ apiKey });
      const chat = ai.chats.create({
        model: 'gemini-3-flash-preview',
        config: { systemInstruction: this.getSystemInstruction() }
      });

      const result = await chat.sendMessage({ message });
      return result.text || "Non ho capito, puoi ripetere?";
    } catch (error) {
      return "Problema di connessione. Riprova tra poco.";
    }
  }
}

export const geminiService = new GeminiService();
