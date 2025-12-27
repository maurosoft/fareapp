
import { GoogleGenAI } from "@google/genai";
import { ChatMessage } from "../types";

export const DEFAULT_SYSTEM_INSTRUCTION = `
Sei "Alex", il Senior App Consultant di "Fare App", l'agenzia web d'élite specializzata nello sviluppo di applicazioni mobili Native per iOS e Android.

IL TUO OBIETTIVO:
Guidare l'utente verso la richiesta di un preventivo o contatto, spiegando il valore aggiunto di avere un'App proprietaria.

TONO DI VOCE:
Professionale, tecnologico, sicuro di sé, ma empatico e chiaro. Non usare tecnicismi inutili, parla di vantaggi per il business.

PUNTI DI FORZA DA EVIDENZIARE:
1. **Sviluppo Nativo**: Prestazioni massime e fluidità assoluta.
2. **Fidelizzazione**: Notifiche Push e Fidelity Card digitali.
3. **M-Commerce**: Vendita diretta da smartphone.
4. **Chiavi in mano**: Design UX/UI, Sviluppo, Test e Pubblicazione.

GESTIONE PREZZI:
Non fornire mai prezzi fissi. Invita sempre al "Preventivo Gratuito".

Rispondi sempre in Italiano perfetto.
`;

export class GeminiService {
  private getSystemInstruction(): string {
    return localStorage.getItem('fareapp_chatbot_prompt') || DEFAULT_SYSTEM_INSTRUCTION;
  }

  async testConnection(): Promise<{ success: boolean; message: string }> {
    try {
      // Nota: process.env.API_KEY viene iniettato da Vercel durante il build
      const apiKey = process.env.API_KEY;
      
      if (!apiKey || apiKey === "undefined" || apiKey.length < 10) {
        return { 
          success: false, 
          message: "ERRORE: La chiave API non è configurata o non è stata ancora propagata. Hai cliccato su 'Redeploy' in Vercel dopo aver aggiunto la variabile API_KEY?" 
        };
      }
      
      const ai = new GoogleGenAI({ apiKey });
      const response = await ai.models.generateContent({
        model: 'gemini-3-flash-preview',
        contents: 'Ping: rispondi solo "OK"',
      });
      
      if (response && response.text) {
        return { 
          success: true, 
          message: "OTTIMO! La connessione è attiva. Alex (Gemini 3 Flash) è pronto a lavorare per Fare App." 
        };
      }
      return { success: false, message: "Risposta vuota dai server Google. Riprova tra pochi istanti." };
    } catch (error: any) {
      console.error("Detailed Test Error:", error);
      const msg = error.message || "";
      
      if (msg.includes("API key not valid")) {
        return { success: false, message: "ERRORE GOOGLE: La chiave API inserita su Vercel non è valida. Controlla di averla copiata correttamente da Google AI Studio." };
      }
      if (msg.includes("model not found") || msg.includes("404")) {
        return { success: false, message: "ERRORE MODELLO: Il modello selezionato non è disponibile per questa chiave API." };
      }
      
      return { success: false, message: `ERRORE SISTEMA: ${msg || "Impossibile contattare l'IA. Verifica la tua connessione."}` };
    }
  }

  async getChatResponse(history: ChatMessage[], message: string): Promise<string> {
    try {
      const apiKey = process.env.API_KEY;
      if (!apiKey) return "Il sistema è in manutenzione. Torneremo online a breve.";

      const ai = new GoogleGenAI({ apiKey });
      const chat = ai.chats.create({
        model: 'gemini-3-flash-preview',
        config: {
          systemInstruction: this.getSystemInstruction(),
          temperature: 0.7,
        }
      });

      const result = await chat.sendMessage({ message });
      return result.text || "Non ho capito, puoi ripetere?";
    } catch (error) {
      console.error("Chat Error:", error);
      return "Siamo spiacenti, Alex ha troppe richieste in questo momento. Riprova tra poco!";
    }
  }
}

export const geminiService = new GeminiService();
