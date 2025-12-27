
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

  // Verifica approfondita dello stato della chiave nel browser
  getKeyStatus(): { status: 'ok' | 'missing' | 'undefined_string' | 'empty' | 'malformed', length: number, env: string } {
    try {
      // @ts-ignore - Tentativo di accesso sicuro alla variabile iniettata dal bundler
      const key = process.env.API_KEY;
      
      if (key === undefined) return { status: 'missing', length: 0, env: 'process.env is undefined' };
      if (key === "undefined") return { status: 'undefined_string', length: 0, env: 'string literal undefined' };
      if (typeof key !== 'string') return { status: 'malformed', length: 0, env: typeof key };
      if (key.trim() === "") return { status: 'empty', length: 0, env: 'empty string' };
      
      return { status: 'ok', length: key.length, env: 'valid string' };
    } catch (e) {
      return { status: 'missing', length: 0, env: 'exception during access' };
    }
  }

  async testConnection(): Promise<{ success: boolean; message: string }> {
    console.log("[DIAGNOSTICA V9] Controllo variabili di ambiente...");
    try {
      const { status, length } = this.getKeyStatus();
      const apiKey = process.env.API_KEY;
      
      if (status !== 'ok') {
        return { 
          success: false, 
          message: `[v9.0] ERRORE: Chiave ${status.toUpperCase()}. 
          Il codice non ha ricevuto la chiave. 
          SOLUZIONE: Vai su Vercel -> Deployments -> Clicca 'Redeploy' sull'ultima versione. 
          Le variabili d'ambiente richiedono una nuova compilazione per essere attivate.` 
        };
      }
      
      const ai = new GoogleGenAI({ apiKey: apiKey! });
      const response = await ai.models.generateContent({
        model: 'gemini-3-flash-preview',
        contents: 'Test tecnico v9. Rispondi brevemente.',
      });
      
      if (response && response.text) {
        return { 
          success: true, 
          message: `[v9.0] CONNESSIONE RIUSCITA! L'AI sta rispondendo correttamente.` 
        };
      }
      return { success: false, message: "[v9.0] Errore: Nessun testo ricevuto dall'AI." };
    } catch (error: any) {
      return { 
        success: false, 
        message: `[v9.0] ERRORE API GOOGLE: ${error.message}. Verifica che la chiave sia valida su AI Studio.` 
      };
    }
  }

  async getChatResponse(history: ChatMessage[], message: string): Promise<string> {
    try {
      const apiKey = process.env.API_KEY;
      if (!apiKey || apiKey === "undefined") return "Assistente temporaneamente offline. Contattaci a info@fareapp.it";

      const ai = new GoogleGenAI({ apiKey });
      const chat = ai.chats.create({
        model: 'gemini-3-flash-preview',
        config: { systemInstruction: this.getSystemInstruction() }
      });

      const result = await chat.sendMessage({ message });
      return result.text || "Non ho ricevuto risposta, riprova.";
    } catch (error) {
      return "Errore di comunicazione con l'AI.";
    }
  }
}

export const geminiService = new GeminiService();
