
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
    console.log("[v10.0 DEBUG] Controllo stato API_KEY...");
    try {
      // @ts-ignore
      const key = process.env.API_KEY;
      
      if (key === undefined) {
        console.warn("[v10.0] process.env.API_KEY is undefined");
        return { status: 'missing', length: 0, env: 'Variabile non iniettata dal bundler' };
      }
      if (key === "undefined") {
        return { status: 'undefined_string', length: 0, env: 'Stringa letterale "undefined"' };
      }
      if (typeof key !== 'string') {
        return { status: 'malformed', length: 0, env: `Tipo errato: ${typeof key}` };
      }
      if (key.trim() === "") {
        return { status: 'empty', length: 0, env: 'Stringa vuota' };
      }
      
      console.log("[v10.0] API_KEY rilevata con successo.");
      return { status: 'ok', length: key.length, env: 'Valida' };
    } catch (e) {
      console.error("[v10.0] Errore critico accesso process.env:", e);
      return { status: 'missing', length: 0, env: 'Eccezione durante accesso' };
    }
  }

  async testConnection(): Promise<{ success: boolean; message: string }> {
    try {
      const { status } = this.getKeyStatus();
      const apiKey = process.env.API_KEY;
      
      if (status !== 'ok') {
        return { 
          success: false, 
          message: `[v10.0] CHIAVE MANCANTE: La variabile non è stata compilata nel sito. 
          Vercel ha bisogno di un REDEPLOY PULITO (senza build cache) per inserire la chiave nel codice.` 
        };
      }
      
      const ai = new GoogleGenAI({ apiKey: apiKey! });
      const response = await ai.models.generateContent({
        model: 'gemini-3-flash-preview',
        contents: 'Test v10. Rispondi: SISTEMA ONLINE',
      });
      
      if (response && response.text) {
        return { success: true, message: `[v10.0] TEST SUPERATO! Alex AI è ora connesso.` };
      }
      return { success: false, message: "[v10.0] Errore: Nessun dato dai server Google." };
    } catch (error: any) {
      return { success: false, message: `[v10.0] ERRORE API: ${error.message}` };
    }
  }

  async getChatResponse(history: ChatMessage[], message: string): Promise<string> {
    try {
      const apiKey = process.env.API_KEY;
      if (!apiKey || apiKey === "undefined") return "Alex è in pausa tecnica per configurazione API. Scrivici a info@fareapp.it";

      const ai = new GoogleGenAI({ apiKey });
      const chat = ai.chats.create({
        model: 'gemini-3-flash-preview',
        config: { systemInstruction: this.getSystemInstruction() }
      });

      const result = await chat.sendMessage({ message });
      return result.text || "Puoi ripetere? Non ho ricevuto dati.";
    } catch (error) {
      return "Spiacente, Alex ha problemi di connessione.";
    }
  }
}

export const geminiService = new GeminiService();
