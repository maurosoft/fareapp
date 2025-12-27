
import { GoogleGenAI } from "@google/genai";
import { ChatMessage } from "../types";

export const DEFAULT_SYSTEM_INSTRUCTION = `
Sei "Alex", il Senior App Consultant di "Fare App", l'agenzia web d'élite specializzata nello sviluppo di applicazioni mobili Native per iOS e Android.

IL TUO OBIETTIVO:
Guidare l'utente verso la richiesta di un preventivo o contatto, spiegando il valore aggiunto di avere un'App proprietaria.

TONO DI VOCE:
Professionale, tecnologico, sicuro di sé, ma empatico e chiaro. Non usare tecnicismi inutili, parla di vantaggi per il business.

PUNTI DI FORZA DA EVIDENZIARE (Usa questi argomenti):
1. **Sviluppo Nativo**: Non facciamo semplici "siti web in un'app". Usiamo tecnologie native per prestazioni massime e fluidità assoluta.
2. **Fidelizzazione**: Spiega come le Notifiche Push e le Fidelity Card digitali aumentano il ritorno dei clienti (Retention).
3. **M-Commerce**: Vendere direttamente dallo smartphone è il futuro.
4. **Chiavi in mano**: Ci occupiamo di tutto noi: Design UX/UI, Sviluppo, Test e Pubblicazione su Apple Store e Google Play.

GESTIONE PREZZI:
Non fornire mai prezzi fissi o stime numeriche specifiche in chat.
Rispondi così: "Ogni progetto è unico come la tua azienda. Per darti una stima precisa e senza impegno, ti invito a cliccare sul tasto 'Preventivo Gratuito' o a contattarci direttamente."

CHIUSURA:
Cerca sempre di chiudere la risposta con una domanda aperta per stimolare la conversazione (es. "Qual è il settore della tua attività?", "Hai già un'idea di come vorresti la tua app?").

Rispondi sempre in Italiano perfetto.
`;

export class GeminiService {
  private getSystemInstruction(): string {
    return localStorage.getItem('fareapp_chatbot_prompt') || DEFAULT_SYSTEM_INSTRUCTION;
  }

  async testConnection(): Promise<{ success: boolean; message: string }> {
    try {
      if (!process.env.API_KEY) {
        return { success: false, message: "Chiave API non configurata nel sistema." };
      }
      
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
      const response = await ai.models.generateContent({
        model: 'gemini-3-flash-preview',
        contents: 'Ping',
      });
      
      if (response.text) {
        return { success: true, message: "Connessione IA stabilita con successo!" };
      }
      return { success: false, message: "Risposta vuota dal server." };
    } catch (error: any) {
      console.error("Test Connection Error:", error);
      return { success: false, message: error.message || "Errore sconosciuto durante il test." };
    }
  }

  async getChatResponse(history: ChatMessage[], message: string): Promise<string> {
    try {
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
      
      const chat = ai.chats.create({
        model: 'gemini-3-flash-preview',
        config: {
          systemInstruction: this.getSystemInstruction(),
          temperature: 0.7,
        },
        history: history.map(m => ({
          role: m.role,
          parts: [{ text: m.text }]
        })),
      });

      const result = await chat.sendMessage({ message });
      return result.text || "Scusa, ho avuto un piccolo problema di connessione. Puoi ripetere la domanda?";
    } catch (error) {
      console.error("Gemini Error:", error);
      return "Attualmente i nostri sistemi sono molto trafficati. Per favore, riprova tra qualche istante o contattaci via email.";
    }
  }
}

export const geminiService = new GeminiService();
