
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

  // Verifica se la chiave è presente (ritorna 'presente', 'mancante' o 'undefined')
  getKeyStatus(): 'ok' | 'missing' | 'undefined_string' {
    const key = process.env.API_KEY;
    if (!key) return 'missing';
    if (key === "undefined") return 'undefined_string';
    if (key.length < 5) return 'missing';
    return 'ok';
  }

  async testConnection(): Promise<{ success: boolean; message: string }> {
    console.log("[DIAGNOSTICA V4] Controllo variabili d'ambiente...");
    try {
      const apiKey = process.env.API_KEY;
      const status = this.getKeyStatus();
      
      if (status !== 'ok') {
        return { 
          success: false, 
          message: `[BUILD_PRO_V4] LA CHIAVE MANCA ANCORA. Stato attuale: ${status.toUpperCase()}. 
          Questo significa che Vercel non ha ancora propagato la variabile API_KEY. 
          AZIONE RICHIESTA: Vai su Vercel -> Settings -> Environment Variables, assicurati che la chiave si chiami API_KEY, poi vai in 'Deployments' e clicca 'Redeploy' sull'ultimo tentativo.` 
        };
      }
      
      const ai = new GoogleGenAI({ apiKey: apiKey! });
      const response = await ai.models.generateContent({
        model: 'gemini-3-flash-preview',
        contents: 'Test: rispondi solo con la parola "CONNESSO"',
      });
      
      if (response && response.text) {
        return { 
          success: true, 
          message: `ECCELLENTE! [BUILD_PRO_V4] Connessione stabilita con successo. Alex è ora alimentato dalla tua API Key Gemini.` 
        };
      }
      return { success: false, message: "[BUILD_PRO_V4] Risposta vuota da Google. Riprova tra pochi secondi." };
    } catch (error: any) {
      console.error("Gemini V4 Error:", error);
      const msg = error.message || "";
      if (msg.includes("API key not valid")) {
        return { success: false, message: "[BUILD_PRO_V4] CHIAVE NON VALIDA: Google ha rifiutato la chiave. Assicurati di averla copiata correttamente senza spazi." };
      }
      return { success: false, message: `[BUILD_PRO_V4] ERRORE GOOGLE: ${msg}` };
    }
  }

  async getChatResponse(history: ChatMessage[], message: string): Promise<string> {
    try {
      const apiKey = process.env.API_KEY;
      if (!apiKey || apiKey === "undefined") return "Alex è attualmente in manutenzione tecnica. Contattaci a info@fareapp.it per assistenza immediata.";

      const ai = new GoogleGenAI({ apiKey });
      const chat = ai.chats.create({
        model: 'gemini-3-flash-preview',
        config: {
          systemInstruction: this.getSystemInstruction(),
          temperature: 0.7,
        }
      });

      const result = await chat.sendMessage({ message });
      return result.text || "Scusa, ho avuto un momento di distrazione. Puoi ripetere?";
    } catch (error) {
      console.error("Chat Error:", error);
      return "Siamo spiacenti, c'è stato un errore nella comunicazione con l'assistente. Riprova tra un istante.";
    }
  }
}

export const geminiService = new GeminiService();
