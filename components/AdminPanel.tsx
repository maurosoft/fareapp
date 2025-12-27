
import React, { useState, useEffect } from 'react';
import { Settings, RotateCcw, X, Lock, CheckCircle2, Image as ImageIcon, Bot, Link as LinkIcon, Loader2, Pencil, Zap, AlertCircle, Smartphone, ExternalLink, Trash2, Plus, LayoutGrid, Info, HelpCircle } from 'lucide-react';
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
  const [keyInfo, setKeyInfo] = useState({ status: 'missing', length: 0, env: 'unknown' });

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
    const t = templates.find(item => item.id === id);
    if (window.confirm(`STAI ELIMINANDO: "${t?.name || 'questa App'}"\n\nL'eliminazione sarà definitiva solo dopo aver premuto il tasto blu "SALVA TUTTE LE MODIFICHE" in basso.\n\nProcedere?`)) {
      setTemplates(prev => prev.filter(item => item.id !== id));
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
                  <p className="text-gray-500 text-xs font-bold uppercase tracking-widest">BUILD V10.0 STABLE</p>
                </div>
              </div>
              <form onSubmit={handleLogin} className="space-y-4">
                <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} className="w-full bg-white/5 border border-white/10 rounded-xl py-4 px-5 outline-none focus:ring-2 focus:ring-blue-500 text-sm" placeholder="Email" required />
                <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} className="w-full bg-white/5 border border-white/10 rounded-xl py-4 px-5 outline-none focus:ring-2 focus:ring-blue-500 text-sm" placeholder="Password" required />
                {loginError && <p className="text-red-400 text-xs font-bold text-center">Credenziali Errate</p>}
                <button type="submit" className="w-full bg-blue-600 text-white py-4 rounded-xl font-black text-lg shadow-xl hover:bg-blue-700 transition-all">Accedi</button>
              </form>
              <button onClick={onClose} className="w-full mt-6 text-gray-500 hover:text-white text-xs font-bold text-center block">Torna al sito</button>
            </div>
          </div>
        ) : (
          <>
            <div className="bg-gray-950 p-6 text-white flex justify-between items-center shrink-0 border-b border-white/10">
              <div className="flex items-center gap-8">
                <div className="flex items-center gap-3">
                  <div className="bg-blue-600 p-2.5 rounded-xl shadow-lg shadow-blue-500/20"><Settings size={22} /></div>
                  <div>
                    <h2 className="font-black text-xl leading-tight">Control Center</h2>
                    <p className="text-[10px] text-blue-400 font-mono uppercase">Version 10.0_STABLE</p>
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

            <div className="flex-1 overflow-y-auto bg-gray-50 p-6 sm:p-10">
              
              {view === 'editor' && (
                <div className="max-w-5xl mx-auto grid grid-cols-1 lg:grid-cols-3 gap-8 animate-in fade-in slide-in-from-bottom-4">
                  <div className="lg:col-span-2 space-y-6">
                    <div className="bg-white p-8 rounded-[2rem] shadow-xl border border-gray-100">
                      <div className="flex flex-col md:flex-row justify-between gap-6 mb-8">
                        <div className="flex items-center gap-4">
                          <div className="bg-blue-600 p-4 rounded-2xl text-white shadow-xl shadow-blue-200"><Bot size={32} /></div>
                          <div>
                            <h3 className="text-xl font-black text-gray-900">Configurazione Alex</h3>
                            <div className="flex items-center gap-2 mt-1">
                              <div className={`w-2 h-2 rounded-full ${keyInfo.status === 'ok' ? 'bg-green-500' : 'bg-red-500 animate-pulse'}`}></div>
                              <span className="text-[10px] font-black uppercase tracking-tighter text-gray-400">Status API: {keyInfo.status}</span>
                            </div>
                          </div>
                        </div>
                        <button onClick={handleTestConnection} disabled={testStatus === 'loading'} className="flex items-center justify-center gap-2 px-6 py-4 rounded-xl font-black text-[10px] uppercase bg-gray-900 text-white hover:bg-blue-600 transition-all shadow-xl">
                          {testStatus === 'loading' ? <Loader2 size={16} className="animate-spin" /> : <Zap size={16} />}
                          TEST DIAGNOSTICO v10
                        </button>
                      </div>

                      {testStatus !== 'idle' && (
                         <div className={`mb-8 p-6 rounded-2xl flex items-start gap-4 border ${testStatus === 'success' ? 'bg-green-50 border-green-200 text-green-800' : 'bg-red-50 border-red-200 text-red-800'}`}>
                           {testStatus === 'success' ? <CheckCircle2 size={24} className="shrink-0" /> : <AlertCircle size={24} className="shrink-0" />}
                           <div className="space-y-1">
                             <p className="text-xs font-black uppercase tracking-widest">Risultato Analisi:</p>
                             <p className="text-sm font-medium leading-relaxed">{testMessage}</p>
                           </div>
                         </div>
                      )}

                      <div className="space-y-3">
                        <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest flex items-center gap-2"><Pencil size={12}/> Prompt Istruzioni (Alex Persona)</label>
                        <textarea value={prompt} onChange={(e) => setPrompt(e.target.value)} className="w-full h-[300px] p-6 bg-gray-50 border border-gray-100 rounded-[1.5rem] text-sm font-mono focus:ring-2 focus:ring-blue-500 outline-none shadow-inner" />
                      </div>
                    </div>
                  </div>

                  <div className="space-y-6">
                    <div className="bg-blue-600 p-8 rounded-[2rem] text-white shadow-2xl shadow-blue-200">
                      <h4 className="font-black text-lg mb-4 flex items-center gap-2"><HelpCircle size={22}/> Supporto Tecnico</h4>
                      <p className="text-blue-100 text-xs leading-relaxed mb-6 font-medium">Se la chiave appare "MISSING" nonostante sia su Vercel, segui questi passi:</p>
                      <ul className="space-y-4 text-[11px]">
                        <li className="flex gap-3">
                          <span className="bg-white/20 w-5 h-5 rounded-full flex items-center justify-center shrink-0 font-bold">1</span>
                          <span>Vai su <b>Vercel Dashboard</b> -> Il tuo Progetto.</span>
                        </li>
                        <li className="flex gap-3">
                          <span className="bg-white/20 w-5 h-5 rounded-full flex items-center justify-center shrink-0 font-bold">2</span>
                          <span>Vai nella scheda <b>Deployments</b>.</span>
                        </li>
                        <li className="flex gap-3">
                          <span className="bg-white/20 w-5 h-5 rounded-full flex items-center justify-center shrink-0 font-bold">3</span>
                          <span>Clicca sui <b>tre puntini (...)</b> dell'ultimo deploy.</span>
                        </li>
                        <li className="flex gap-3">
                          <span className="bg-white/20 w-5 h-5 rounded-full flex items-center justify-center shrink-0 font-bold">4</span>
                          <span>Seleziona <b>REDEPLOY</b> e disabilita "Use build cache".</span>
                        </li>
                      </ul>
                      <div className="mt-8 pt-6 border-t border-white/10">
                        <p className="text-[10px] font-bold text-blue-200">Nota: Le variabili d'ambiente funzionano solo dopo una nuova compilazione.</p>
                      </div>
                    </div>
                  </div>
                </div>
              )}
              
              {view === 'templates' && (
                <div className="max-w-6xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4">
                  <div className="flex justify-between items-center bg-white p-6 rounded-[2rem] shadow-sm border border-gray-100">
                    <div>
                      <h3 className="text-2xl font-black text-gray-900 flex items-center gap-3"><LayoutGrid size={28} className="text-blue-600"/> Portfolio Mockups</h3>
                      <p className="text-xs text-gray-400 font-bold uppercase tracking-wider">Configura le App mostrate nel sito</p>
                    </div>
                    <button onClick={addNewTemplate} className="flex items-center gap-2 bg-blue-600 text-white px-8 py-4 rounded-xl font-black text-xs uppercase hover:bg-blue-700 transition-all shadow-xl shadow-blue-100">
                      <Plus size={20} /> Aggiungi Nuova App
                    </button>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                    {templates.map((t) => (
                      <div key={t.id} className="bg-white p-8 rounded-[3rem] border border-gray-100 shadow-xl flex flex-col sm:flex-row gap-8 relative overflow-visible group">
                        
                        {/* TASTO ELIMINA v10 - MASSIMA VISIBILITÀ E INTERAZIONE */}
                        <button 
                          type="button"
                          onClick={(e) => { e.preventDefault(); removeTemplate(t.id); }} 
                          className="absolute -top-4 -right-4 z-[99] p-4 bg-red-600 text-white rounded-full shadow-2xl hover:bg-red-700 hover:scale-110 active:scale-90 transition-all flex items-center justify-center border-4 border-white cursor-pointer group/del"
                        >
                          <Trash2 size={24} strokeWidth={3} className="group-hover/del:animate-pulse" />
                        </button>
                        
                        <div className="w-full sm:w-44 aspect-[9/18.5] bg-gray-50 rounded-[2.5rem] overflow-hidden border border-gray-200 shadow-inner flex-shrink-0">
                          <img src={t.image} className="w-full h-full object-cover" alt="" />
                        </div>

                        <div className="flex-1 space-y-5">
                          <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-1.5">
                              <label className="text-[10px] font-black text-gray-400 uppercase">Nome Applicazione</label>
                              <input value={t.name} onChange={(e) => updateTemplateField(t.id, 'name', e.target.value)} className="w-full p-3 bg-gray-50 border-none rounded-xl text-sm font-black focus:ring-2 focus:ring-blue-500" />
                            </div>
                            <div className="space-y-1.5">
                              <label className="text-[10px] font-black text-gray-400 uppercase">Settore</label>
                              <input value={t.category} onChange={(e) => updateTemplateField(t.id, 'category', e.target.value)} className="w-full p-3 bg-blue-50 text-blue-700 border-none rounded-xl text-sm font-black" />
                            </div>
                          </div>
                          
                          <div className="space-y-1.5">
                            <label className="text-[10px] font-black text-gray-400 uppercase">Immagine (URL Unsplash o Diretta)</label>
                            <input value={t.image} onChange={(e) => updateTemplateField(t.id, 'image', e.target.value)} className="w-full p-3 bg-gray-50 border-none rounded-xl text-[10px] font-mono text-gray-500" />
                          </div>

                          <div className="space-y-1.5">
                            <label className="text-[10px] font-black text-gray-400 uppercase">Descrizione Marketing</label>
                            <textarea value={t.description || ''} onChange={(e) => updateTemplateField(t.id, 'description', e.target.value)} className="w-full p-3 bg-gray-50 border-none rounded-xl text-[11px] h-20 resize-none leading-relaxed" />
                          </div>

                          <div className="grid grid-cols-2 gap-4 pt-2">
                            <div className="space-y-1.5">
                              <label className="text-[10px] font-black text-gray-500 flex items-center gap-1"><Smartphone size={10}/> Play Store Link</label>
                              <input value={t.playStoreUrl || ''} onChange={(e) => updateTemplateField(t.id, 'playStoreUrl', e.target.value)} className="w-full p-2.5 bg-gray-100 border-none rounded-lg text-[10px]" />
                            </div>
                            <div className="space-y-1.5">
                              <label className="text-[10px] font-black text-gray-500 flex items-center gap-1"><Smartphone size={10}/> App Store Link</label>
                              <input value={t.appStoreUrl || ''} onChange={(e) => updateTemplateField(t.id, 'appStoreUrl', e.target.value)} className="w-full p-2.5 bg-gray-100 border-none rounded-lg text-[10px]" />
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {view === 'branding' && (
                <div className="max-w-3xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4">
                  <div className="bg-white p-12 rounded-[3.5rem] shadow-xl border border-gray-100 space-y-12">
                    <div className="space-y-8">
                      <h3 className="text-2xl font-black text-gray-900 flex items-center gap-3"><ImageIcon size={30} className="text-blue-600"/> Identità Visiva</h3>
                      <div className="space-y-4">
                        <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Logo Principale (URL)</label>
                        <div className="flex items-center gap-8 p-8 bg-gray-50 rounded-[2.5rem] border border-gray-100">
                          <input value={siteLogo} onChange={(e) => setSiteLogo(e.target.value)} className="flex-1 p-5 bg-white border-none rounded-2xl text-sm shadow-sm focus:ring-2 focus:ring-blue-500" placeholder="https://..." />
                          <div className="w-28 h-28 rounded-3xl border-4 border-dashed border-gray-200 flex items-center justify-center bg-white p-4 shrink-0 shadow-inner">
                            {siteLogo ? <img src={siteLogo} className="max-w-full max-h-full object-contain" alt="Logo Preview" /> : <ImageIcon size={40} className="text-gray-200" />}
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="pt-12 border-t border-gray-100">
                      <h3 className="text-2xl font-black text-gray-900 mb-8 flex items-center gap-3"><LinkIcon size={30} className="text-blue-600"/> Link Globali Store</h3>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-8">
                        <div className="space-y-3">
                          <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest">Google Play Store</label>
                          <input value={playStoreUrl} onChange={(e) => setPlayStoreUrl(e.target.value)} className="w-full p-5 bg-gray-50 border border-gray-100 rounded-2xl text-sm outline-none focus:ring-2 focus:ring-blue-500" />
                        </div>
                        <div className="space-y-3">
                          <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest">Apple App Store</label>
                          <input value={appStoreUrl} onChange={(e) => setAppStoreUrl(e.target.value)} className="w-full p-5 bg-gray-50 border border-gray-100 rounded-2xl text-sm outline-none focus:ring-2 focus:ring-blue-500" />
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>

            <div className="p-10 bg-white border-t border-gray-100 flex items-center justify-between shrink-0 shadow-2xl z-[80]">
              <button 
                onClick={() => { if(window.confirm('RIPRISTINO ORIGINALE\n\nVuoi cancellare tutte le modifiche e tornare ai dati di fabbrica?')){ localStorage.clear(); window.location.reload(); } }} 
                className="text-gray-400 hover:text-red-600 text-[10px] font-black uppercase flex items-center gap-2 px-6 py-4 hover:bg-red-50 rounded-xl transition-all"
              >
                <RotateCcw size={18} /> Reset Totale Database
              </button>
              
              <div className="flex items-center gap-6">
                <button onClick={onClose} className="px-8 py-4 text-gray-500 font-black text-xs uppercase hover:text-gray-900">Chiudi</button>
                <button onClick={persistChanges} className="bg-blue-600 text-white px-16 py-5 rounded-[1.5rem] font-black text-base shadow-2xl shadow-blue-200 hover:bg-blue-700 transition-all hover:scale-105 active:scale-95 flex items-center gap-3">
                  {isSaved ? <><CheckCircle2 size={22} /> MODIFICHE SALVATE!</> : 'SALVA TUTTE LE MODIFICHE'}
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
