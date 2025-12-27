
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
    console.log("[DIAGNOSTICA V5] Controllo profondo in corso...");
    try {
      const { status, length } = this.getKeyStatus();
      const apiKey = process.env.API_KEY;
      
      if (status !== 'ok') {
        return { 
          success: false, 
          message: `[BUILD_PRO_V5] ATTENZIONE: La variabile API_KEY è ${status.toUpperCase()}. 
          Nonostante tu l'abbia aggiunta su Vercel, il sito corrente NON la vede. 
          RISOLUZIONE: Devi andare nella tab 'Deployments' di Vercel e fare 'REDEPLOY' sull'ultimo deploy per forzare l'aggiornamento.` 
        };
      }
      
      // Se arriviamo qui, la chiave esiste fisicamente nel codice
      const ai = new GoogleGenAI({ apiKey: apiKey! });
      const response = await ai.models.generateContent({
        model: 'gemini-3-flash-preview',
        contents: 'Test di sistema. Rispondi solo: "SISTEMA_OPERATIVO"',
      });
      
      if (response && response.text) {
        return { 
          success: true, 
          message: `URRÀ! [BUILD_PRO_V5] Connessione riuscita. La chiave (lunghezza: ${length} char) è attiva e funzionante.` 
        };
      }
      return { success: false, message: "[BUILD_PRO_V5] Errore: Risposta vuota da Google. La chiave potrebbe essere limitata." };
    } catch (error: any) {
      console.error("Gemini V5 Error:", error);
      const msg = error.message || "";
      return { success: false, message: `[BUILD_PRO_V5] ERRORE API: ${msg}` };
    }
  }

  async getChatResponse(history: ChatMessage[], message: string): Promise<string> {
    try {
      const apiKey = process.env.API_KEY;
      if (!apiKey || apiKey === "undefined") return "Alex è temporaneamente offline per aggiornamento chiavi. Contattaci su info@fareapp.it";

      const ai = new GoogleGenAI({ apiKey });
      const chat = ai.chats.create({
        model: 'gemini-3-flash-preview',
        config: {
          systemInstruction: this.getSystemInstruction(),
        }
      });

      const result = await chat.sendMessage({ message });
      return result.text || "Puoi ripetere? Mi sono perso un attimo.";
    } catch (error) {
      return "C'è un piccolo problema tecnico. Alex tornerà tra un istante!";
    }
  }
}

export const geminiService = new GeminiService();
