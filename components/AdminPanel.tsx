
import React, { useState, useEffect } from 'react';
import { Settings, RotateCcw, X, Lock, CheckCircle2, Image as ImageIcon, Bot, Link as LinkIcon, Loader2, Pencil, Zap, AlertCircle, Smartphone, ExternalLink, Trash2, Plus, LayoutGrid, Info } from 'lucide-react';
import { DEFAULT_SYSTEM_INSTRUCTION, geminiService } from '../services/geminiService';
import { TEMPLATES as DEFAULT_TEMPLATES } from '../constants';
import { Template } from '../types';

interface AdminPanelProps {
  isOpen: boolean;
  onClose: () => void;
}

const DEFAULT_ADMIN = {
  email: 'info@fareapp.it',
  password: '123456'
};

const AdminPanel: React.FC<AdminPanelProps> = ({ isOpen, onClose }) => {
  const [view, setView] = useState<'login' | 'editor' | 'templates' | 'branding'>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loginError, setLoginError] = useState(false);
  
  const [prompt, setPrompt] = useState('');
  const [templates, setTemplates] = useState<Template[]>([]);
  const [siteLogo, setSiteLogo] = useState<string>('');
  const [playStoreUrl, setPlayStoreUrl] = useState<string>('');
  const [appStoreUrl, setAppStoreUrl] = useState<string>('');
  
  const [isSaved, setIsSaved] = useState(false);
  const [testStatus, setTestStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [testMessage, setTestMessage] = useState('');
  const [keyInfo, setKeyInfo] = useState({ status: 'missing', length: 0, type: 'unknown' });

  useEffect(() => {
    if (isOpen) {
      const savedPrompt = localStorage.getItem('fareapp_chatbot_prompt') || DEFAULT_SYSTEM_INSTRUCTION;
      setPrompt(savedPrompt);
      
      const savedTemplates = localStorage.getItem('fareapp_templates');
      setTemplates(savedTemplates ? JSON.parse(savedTemplates) : DEFAULT_TEMPLATES);

      setSiteLogo(localStorage.getItem('fareapp_site_logo') || '');
      setPlayStoreUrl(localStorage.getItem('fareapp_play_store_url') || '');
      setAppStoreUrl(localStorage.getItem('fareapp_app_store_url') || '');
      
      setView('login');
      setTestStatus('idle');
      setTestMessage('');
      setKeyInfo(geminiService.getKeyStatus());
    }
  }, [isOpen]);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (email === DEFAULT_ADMIN.email && password === DEFAULT_ADMIN.password) {
      setView('editor');
    } else {
      setLoginError(true);
    }
  };

  const handleTestConnection = async () => {
    setTestStatus('loading');
    setTestMessage('Analisi build v8.0...');
    const result = await geminiService.testConnection();
    setTestStatus(result.success ? 'success' : 'error');
    setTestMessage(result.message);
    setKeyInfo(geminiService.getKeyStatus());
  };

  const persistChanges = () => {
    localStorage.setItem('fareapp_templates', JSON.stringify(templates));
    localStorage.setItem('fareapp_chatbot_prompt', prompt);
    localStorage.setItem('fareapp_site_logo', siteLogo);
    localStorage.setItem('fareapp_play_store_url', playStoreUrl);
    localStorage.setItem('fareapp_app_store_url', appStoreUrl);
    window.dispatchEvent(new Event('fareapp_data_updated'));
    setIsSaved(true);
    setTimeout(() => setIsSaved(false), 2000);
  };

  const updateTemplateField = (id: string, field: keyof Template, value: string) => {
    setTemplates(prev => prev.map(t => t.id === id ? { ...t, [field]: value } : t));
  };

  const addNewTemplate = () => {
    const newTemplate: Template = {
      id: Date.now().toString(),
      name: 'Nuova App',
      category: 'Categoria',
      image: 'https://images.unsplash.com/photo-1551650975-87deedd944c3?auto=format&fit=crop&q=80&w=800',
      description: 'Descrizione della nuova applicazione...',
      playStoreUrl: '',
      appStoreUrl: ''
    };
    setTemplates(prev => [...prev, newTemplate]);
  };

  const removeTemplate = (id: string) => {
    const templateToDelete = templates.find(t => t.id === id);
    const confirmMsg = `ATTENZIONE: Sei sicuro di voler eliminare definitivamente il mockup di "${templateToDelete?.name || 'questa App'}"?\n\nL'operazione sarà effettiva solo dopo aver cliccato "SALVA TUTTE LE MODIFICHE".`;
    
    if (window.confirm(confirmMsg)) {
      setTemplates(prev => prev.filter(t => t.id !== id));
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-300">
      <div className="bg-white w-full max-w-6xl rounded-[2.5rem] shadow-2xl overflow-hidden flex flex-col max-h-[92vh] border border-white/20">
        
        {view === 'login' ? (
          <div className="max-w-md mx-auto w-full py-24 px-6">
            <div className="bg-gray-950 p-10 rounded-[2.5rem] text-white shadow-2xl border border-white/5">
              <div className="flex flex-col items-center gap-6 mb-10">
                <div className="bg-blue-600 p-5 rounded-2xl shadow-xl shadow-blue-500/20">
                  <Lock size={36} />
                </div>
                <div className="text-center">
                  <h2 className="font-black text-3xl tracking-tight mb-1">Fare App Admin</h2>
                  <p className="text-gray-500 text-xs font-bold uppercase tracking-widest">Accesso Riservato v8.0</p>
                </div>
              </div>
              <form onSubmit={handleLogin} className="space-y-4">
                <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} className="w-full bg-white/5 border border-white/10 rounded-xl py-4 px-5 outline-none focus:ring-2 focus:ring-blue-500 text-sm transition-all" placeholder="Email aziendale" required />
                <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} className="w-full bg-white/5 border border-white/10 rounded-xl py-4 px-5 outline-none focus:ring-2 focus:ring-blue-500 text-sm transition-all" placeholder="Password" required />
                {loginError && <p className="text-red-400 text-xs font-bold text-center animate-bounce">Credenziali non valide</p>}
                <button type="submit" className="w-full bg-blue-600 text-white py-4 rounded-xl font-black text-lg shadow-xl hover:bg-blue-700 transition-all hover:scale-[1.02] active:scale-[0.98]">Accedi al Pannello</button>
              </form>
              <button onClick={onClose} className="w-full mt-6 text-gray-500 hover:text-white text-xs font-bold transition-colors text-center block">Chiudi e torna al sito</button>
            </div>
          </div>
        ) : (
          <>
            {/* Header Pannello */}
            <div className="bg-gray-950 p-6 text-white flex justify-between items-center shrink-0 border-b border-white/10">
              <div className="flex items-center gap-8">
                <div className="flex items-center gap-3">
                  <div className="bg-blue-600 p-2.5 rounded-xl shadow-lg shadow-blue-500/20"><Settings size={22} /></div>
                  <div>
                    <h2 className="font-black text-xl leading-tight">Control Center</h2>
                    <p className="text-[10px] text-blue-400 font-mono">BUILD VERSION 8.0_STABLE</p>
                  </div>
                </div>
                <nav className="flex bg-white/5 p-1 rounded-xl border border-white/5">
                  <button onClick={() => setView('editor')} className={`px-5 py-2.5 rounded-lg text-xs font-black transition-all ${view === 'editor' ? 'bg-blue-600 text-white shadow-lg' : 'text-gray-400 hover:text-white'}`}>ALEX AI</button>
                  <button onClick={() => setView('templates')} className={`px-5 py-2.5 rounded-lg text-xs font-black transition-all ${view === 'templates' ? 'bg-blue-600 text-white shadow-lg' : 'text-gray-400 hover:text-white'}`}>MOCKUPS APP</button>
                  <button onClick={() => setView('branding')} className={`px-5 py-2.5 rounded-lg text-xs font-black transition-all ${view === 'branding' ? 'bg-blue-600 text-white shadow-lg' : 'text-gray-400 hover:text-white'}`}>BRANDING</button>
                </nav>
              </div>
              <button onClick={onClose} className="hover:bg-white/10 p-2 rounded-full transition-colors text-gray-400 hover:text-white">
                <X size={28} />
              </button>
            </div>

            {/* Area Contenuto */}
            <div className="flex-1 overflow-y-auto bg-gray-50 p-6 sm:p-10">
              
              {/* VISTA ALEX AI */}
              {view === 'editor' && (
                <div className="max-w-4xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4">
                  <div className="bg-white p-10 rounded-[2.5rem] shadow-xl border border-gray-100 relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-64 h-64 bg-blue-50 rounded-full -mr-32 -mt-32 opacity-50"></div>
                    
                    <div className="flex flex-col md:flex-row justify-between gap-8 mb-10 relative z-10">
                      <div className="flex items-center gap-5">
                        <div className="bg-blue-600 p-4 rounded-2xl text-white shadow-xl shadow-blue-200"><Bot size={32} /></div>
                        <div>
                          <h3 className="text-2xl font-black text-gray-900">Configurazione Alex AI</h3>
                          <div className="flex items-center gap-3 mt-2">
                            <div className={`flex items-center gap-1.5 px-2 py-0.5 rounded-full border ${keyInfo.status === 'ok' ? 'bg-green-50 border-green-200 text-green-700' : 'bg-red-50 border-red-200 text-red-700'}`}>
                              <div className={`w-1.5 h-1.5 rounded-full ${keyInfo.status === 'ok' ? 'bg-green-500' : 'bg-red-500 animate-pulse'}`}></div>
                              <span className="text-[10px] font-black uppercase tracking-tighter">API_KEY: {keyInfo.status}</span>
                            </div>
                            <span className="text-[9px] font-bold text-gray-400 uppercase tracking-widest">Build Environment: {keyInfo.type}</span>
                          </div>
                        </div>
                      </div>
                      
                      <div className="flex flex-col gap-3 min-w-[340px]">
                         <button onClick={handleTestConnection} disabled={testStatus === 'loading'} className="group flex items-center justify-center gap-2 px-8 py-4 rounded-2xl font-black text-xs uppercase bg-gray-900 text-white hover:bg-blue-600 transition-all shadow-xl active:scale-95">
                          {testStatus === 'loading' ? <Loader2 size={18} className="animate-spin" /> : <Zap size={18} className="group-hover:text-yellow-400" />}
                          Esegui Test Diagnostico v8.0
                         </button>
                         
                         {testStatus !== 'idle' && (
                           <div className={`p-5 rounded-2xl flex items-start gap-3 border animate-in zoom-in-95 duration-300 ${testStatus === 'success' ? 'bg-green-50 border-green-200 text-green-800' : 'bg-red-50 border-red-200 text-red-800'}`}>
                             {testStatus === 'success' ? <CheckCircle2 size={20} className="shrink-0" /> : <AlertCircle size={20} className="shrink-0" />}
                             <div className="space-y-1">
                               <p className="text-[11px] leading-relaxed font-black uppercase tracking-tighter">Risultato Test:</p>
                               <p className="text-[11px] leading-relaxed font-medium">{testMessage}</p>
                             </div>
                           </div>
                         )}
                      </div>
                    </div>
                    
                    <div className="space-y-4 relative z-10">
                      <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest flex items-center gap-2"><Pencil size={12}/> Prompt Istruzioni Alex (System Prompt)</label>
                      <textarea value={prompt} onChange={(e) => setPrompt(e.target.value)} className="w-full h-[320px] p-8 bg-gray-50 border border-gray-100 rounded-[2rem] text-sm font-mono focus:ring-2 focus:ring-blue-500 outline-none shadow-inner leading-relaxed" placeholder="Scrivi qui come Alex deve comportarsi..." />
                    </div>
                  </div>
                </div>
              )}
              
              {/* VISTA MOCKUPS APP */}
              {view === 'templates' && (
                <div className="max-w-6xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4">
                  <div className="flex justify-between items-center bg-white p-6 rounded-[2rem] shadow-sm border border-gray-100">
                    <div>
                      <h3 className="text-2xl font-black text-gray-900 flex items-center gap-3"><LayoutGrid size={28} className="text-blue-600"/> Galleria Mockups iPhone</h3>
                      <p className="text-xs text-gray-400 font-bold mt-1 uppercase tracking-wider">Configura le App mostrate nel portfolio dinamico</p>
                    </div>
                    <button onClick={addNewTemplate} className="flex items-center gap-2 bg-blue-600 text-white px-6 py-3 rounded-xl font-black text-xs uppercase hover:bg-blue-700 transition-all shadow-lg shadow-blue-100">
                      <Plus size={18} /> Aggiungi Nuova App
                    </button>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    {templates.map((t) => (
                      <div key={t.id} className="bg-white p-8 rounded-[2.5rem] border border-gray-100 shadow-xl flex flex-col sm:flex-row gap-8 relative group overflow-visible">
                        {/* PULSANTE ELIMINA FISSO E POTENZIATO */}
                        <button 
                          onClick={() => removeTemplate(t.id)} 
                          title="Elimina Mockup"
                          className="absolute -top-3 -right-3 z-[70] p-3 bg-red-500 text-white rounded-full shadow-lg hover:bg-red-600 hover:scale-110 active:scale-95 transition-all flex items-center justify-center border-4 border-white"
                        >
                          <Trash2 size={20} />
                        </button>
                        
                        <div className="w-full sm:w-40 aspect-[9/18.5] bg-gray-50 rounded-[2rem] overflow-hidden border border-gray-200 shadow-inner flex-shrink-0">
                          <img src={t.image} className="w-full h-full object-cover" alt="" />
                        </div>

                        <div className="flex-1 space-y-5">
                          <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-1.5">
                              <label className="text-[10px] font-black text-gray-400 uppercase tracking-tighter">Nome Applicazione</label>
                              <input value={t.name} onChange={(e) => updateTemplateField(t.id, 'name', e.target.value)} className="w-full p-3 bg-gray-50 border-none rounded-xl text-sm font-black focus:ring-2 focus:ring-blue-500" />
                            </div>
                            <div className="space-y-1.5">
                              <label className="text-[10px] font-black text-gray-400 uppercase tracking-tighter">Settore / Categoria</label>
                              <input value={t.category} onChange={(e) => updateTemplateField(t.id, 'category', e.target.value)} className="w-full p-3 bg-blue-50 text-blue-700 border-none rounded-xl text-sm font-black" />
                            </div>
                          </div>
                          
                          <div className="space-y-1.5">
                            <label className="text-[10px] font-black text-gray-400 uppercase tracking-tighter">URL Immagine (Display Screen)</label>
                            <input value={t.image} onChange={(e) => updateTemplateField(t.id, 'image', e.target.value)} className="w-full p-3 bg-gray-50 border-none rounded-xl text-[10px] font-mono text-gray-500" />
                          </div>

                          <div className="space-y-1.5">
                            <label className="text-[10px] font-black text-gray-400 uppercase tracking-tighter">Descrizione Marketing</label>
                            <textarea value={t.description || ''} onChange={(e) => updateTemplateField(t.id, 'description', e.target.value)} className="w-full p-3 bg-gray-50 border-none rounded-xl text-[11px] h-20 resize-none leading-relaxed" placeholder="Descrivi i vantaggi dell'app..." />
                          </div>

                          <div className="grid grid-cols-2 gap-4 pt-2">
                            <div className="space-y-1.5">
                              <label className="text-[10px] font-black text-gray-400 uppercase tracking-tighter flex items-center gap-1.5 text-green-600"><Smartphone size={10}/> Play Store</label>
                              <input value={t.playStoreUrl || ''} onChange={(e) => updateTemplateField(t.id, 'playStoreUrl', e.target.value)} className="w-full p-2.5 bg-gray-50 border-none rounded-lg text-[10px]" placeholder="Link Android..." />
                            </div>
                            <div className="space-y-1.5">
                              <label className="text-[10px] font-black text-gray-400 uppercase tracking-tighter flex items-center gap-1.5 text-blue-600"><Smartphone size={10}/> App Store</label>
                              <input value={t.appStoreUrl || ''} onChange={(e) => updateTemplateField(t.id, 'appStoreUrl', e.target.value)} className="w-full p-2.5 bg-gray-50 border-none rounded-lg text-[10px]" placeholder="Link iOS..." />
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* VISTA BRANDING */}
              {view === 'branding' && (
                <div className="max-w-3xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4">
                  <div className="bg-white p-12 rounded-[3rem] shadow-xl border border-gray-100 space-y-10">
                    <div>
                      <h3 className="text-2xl font-black text-gray-900 mb-8 flex items-center gap-3"><ImageIcon size={30} className="text-blue-600"/> Identità del Sito</h3>
                      <div className="space-y-4">
                        <label className="text-[10px] font-black text-gray-400 mb-2 block uppercase tracking-widest">Logo Principale (URL PNG/SVG)</label>
                        <div className="flex items-center gap-6 p-6 bg-gray-50 rounded-[2rem] border border-gray-100 shadow-inner">
                          <input value={siteLogo} onChange={(e) => setSiteLogo(e.target.value)} className="flex-1 p-4 bg-white border-none rounded-xl text-sm outline-none shadow-sm focus:ring-2 focus:ring-blue-500" placeholder="Esempio: https://fareapp.it/logo.png" />
                          <div className="w-24 h-24 rounded-2xl border-2 border-dashed border-gray-200 flex items-center justify-center bg-white p-3 shrink-0">
                            {siteLogo ? <img src={siteLogo} className="max-w-full max-h-full object-contain" alt="Preview Logo" /> : <ImageIcon size={32} className="text-gray-200" />}
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="pt-10 border-t border-gray-100">
                      <h3 className="text-2xl font-black text-gray-900 mb-8 flex items-center gap-3"><LinkIcon size={30} className="text-blue-600"/> Link Globali agli Store</h3>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-8">
                        <div className="space-y-3">
                          <label className="text-[10px] font-black text-gray-500 mb-2 block uppercase tracking-widest">Google Play Store (Default)</label>
                          <input value={playStoreUrl} onChange={(e) => setPlayStoreUrl(e.target.value)} className="w-full p-5 bg-gray-50 border border-gray-100 rounded-2xl text-sm outline-none focus:ring-2 focus:ring-blue-500" placeholder="https://play.google.com/..." />
                        </div>
                        <div className="space-y-3">
                          <label className="text-[10px] font-black text-gray-500 mb-2 block uppercase tracking-widest">Apple App Store (Default)</label>
                          <input value={appStoreUrl} onChange={(e) => setAppStoreUrl(e.target.value)} className="w-full p-5 bg-gray-50 border border-gray-100 rounded-2xl text-sm outline-none focus:ring-2 focus:ring-blue-500" placeholder="https://apps.apple.com/..." />
                        </div>
                      </div>
                      <div className="mt-8 p-6 bg-blue-50 rounded-2xl border border-blue-100 flex gap-4 items-start">
                        <Info size={24} className="text-blue-600 shrink-0 mt-1" />
                        <p className="text-[11px] text-blue-800 leading-relaxed font-medium">Questi link verranno utilizzati automaticamente per tutte le App che non hanno un link specifico configurato nella sezione Mockups.</p>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Footer Pannello Azioni */}
            <div className="p-8 bg-white border-t border-gray-100 flex items-center justify-between shrink-0 shadow-[0_-10px_40px_rgba(0,0,0,0.02)]">
              <button 
                onClick={() => { if(window.confirm('Attenzione: questo pulirà la memoria locale ripristinando i valori di default del sito. Procedere?')){ localStorage.clear(); window.location.reload(); } }} 
                className="group text-gray-400 hover:text-red-600 text-[10px] font-black uppercase flex items-center gap-2 px-5 py-3 hover:bg-red-50 rounded-xl transition-all tracking-tighter"
              >
                <RotateCcw size={16} className="group-hover:rotate-[-45deg] transition-transform" /> Reset & Reset Cache
              </button>
              
              <div className="flex items-center gap-4">
                <button onClick={onClose} className="px-8 py-4 text-gray-400 font-black text-xs uppercase hover:text-gray-900 transition-colors">Annulla</button>
                <button onClick={persistChanges} className="bg-blue-600 text-white px-14 py-4 rounded-2xl font-black text-sm shadow-2xl shadow-blue-200 hover:bg-blue-700 transition-all hover:scale-105 active:scale-95 flex items-center gap-2">
                  {isSaved ? <><CheckCircle2 size={18} /> DATI SALVATI ✓</> : 'SALVA TUTTE LE MODIFICHE'}
                </button>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default AdminPanel;
