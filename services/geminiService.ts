
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

  // Debug profondo per capire cosa vede il browser
  getKeyStatus() {
    console.group("%c [v11.0] AI DIAGNOSTICS ", "background: #2563eb; color: white; font-weight: bold; padding: 2px 5px;");
    
    // @ts-ignore
    const apiKey = process.env.API_KEY;
    
    console.log("Variabile process.env.API_KEY:", apiKey);
    console.log("Tipo rilevato:", typeof apiKey);
    
    let status: 'ok' | 'missing' | 'undefined_string' | 'empty' = 'ok';
    let envMsg = 'Rilevata correttamente';

    if (apiKey === undefined) {
      status = 'missing';
      envMsg = 'Mancante (Undefined)';
    } else if (apiKey === "undefined" || apiKey === "") {
      status = 'empty';
      envMsg = 'Vuota o Stringa "undefined"';
    }

    console.log("Stato Finale:", status);
    console.groupEnd();

    return { status, length: apiKey?.length || 0, env: envMsg };
  }

  async testConnection(): Promise<{ success: boolean; message: string }> {
    try {
      const { status } = this.getKeyStatus();
      // @ts-ignore
      const apiKey = process.env.API_KEY;
      
      if (status !== 'ok') {
        return { 
          success: false, 
          message: `[v11.0] ERRORE: Chiave non iniettata. Vercel non ha passato la chiave al sito durante la build. Esegui un 'Redeploy' senza cache.` 
        };
      }
      
      const ai = new GoogleGenAI({ apiKey: apiKey! });
      const response = await ai.models.generateContent({
        model: 'gemini-3-flash-preview',
        contents: 'Test tecnico v11. Conferma ricezione.',
      });
      
      if (response && response.text) {
        return { success: true, message: `[v11.0] PERFETTO! Alex AI è ora online e funzionante.` };
      }
      return { success: false, message: "[v11.0] Risposta vuota dal server." };
    } catch (error: any) {
      return { success: false, message: `[v11.0] ERRORE GOOGLE: ${error.message}` };
    }
  }

  async getChatResponse(history: ChatMessage[], message: string): Promise<string> {
    try {
      // @ts-ignore
      const apiKey = process.env.API_KEY;
      if (!apiKey || apiKey === "undefined") return "Alex è in manutenzione. Contattaci a info@fareapp.it";

      const ai = new GoogleGenAI({ apiKey });
      const chat = ai.chats.create({
        model: 'gemini-3-flash-preview',
        config: { systemInstruction: this.getSystemInstruction() }
      });

      const result = await chat.sendMessage({ message });
      return result.text || "Non ho capito bene, puoi ripetere?";
    } catch (error) {
      return "Problema di rete con l'AI.";
    }
  }
}

export const geminiService = new GeminiService();
