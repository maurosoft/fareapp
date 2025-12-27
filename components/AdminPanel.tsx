
import React, { useState, useEffect, useRef } from 'react';
import { Settings, Save, RotateCcw, X, ShieldCheck, Lock, ArrowLeft, CheckCircle2, Image as ImageIcon, Layout as LayoutIcon, Bot, Upload, Link as LinkIcon, Check, Loader2, Palette, Smartphone, AlignLeft, Apple, Pencil, Zap, Activity, AlertCircle } from 'lucide-react';
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
  const [view, setView] = useState<'login' | 'reset' | 'editor' | 'templates' | 'branding'>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loginError, setLoginError] = useState(false);
  const [resetSuccess, setResetSuccess] = useState(false);
  
  const [prompt, setPrompt] = useState('');
  const [templates, setTemplates] = useState<Template[]>([]);
  const [siteLogo, setSiteLogo] = useState<string>('');
  const [playStoreUrl, setPlayStoreUrl] = useState<string>('');
  const [appStoreUrl, setAppStoreUrl] = useState<string>('');
  
  const [isSaved, setIsSaved] = useState(false);
  const [savingId, setSavingId] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState<string | null>(null);

  const [testStatus, setTestStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [testMessage, setTestMessage] = useState('');
  
  const fileInputRefs = useRef<{ [key: string]: HTMLInputElement | null }>({});
  const logoInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isOpen) {
      const savedPrompt = localStorage.getItem('fareapp_chatbot_prompt') || DEFAULT_SYSTEM_INSTRUCTION;
      setPrompt(savedPrompt);
      
      const savedTemplates = localStorage.getItem('fareapp_templates');
      if (savedTemplates) {
        try {
          const parsed = JSON.parse(savedTemplates);
          // Migrazione dati per assicurare che tutti i nuovi campi esistano
          const migrated = parsed.map((t: any) => ({
            ...t,
            description: t.description || '',
            playStoreUrl: t.playStoreUrl || '',
            appStoreUrl: t.appStoreUrl || ''
          }));
          setTemplates(migrated);
        } catch (e) {
          setTemplates(DEFAULT_TEMPLATES);
        }
      } else {
        setTemplates(DEFAULT_TEMPLATES);
      }

      const savedLogo = localStorage.getItem('fareapp_site_logo') || '';
      setSiteLogo(savedLogo);

      const savedPlayStore = localStorage.getItem('fareapp_play_store_url') || '';
      const savedAppStore = localStorage.getItem('fareapp_app_store_url') || '';
      setPlayStoreUrl(savedPlayStore);
      setAppStoreUrl(savedAppStore);
      
      setView('login');
      setEmail('');
      setPassword('');
      setLoginError(false);
      setResetSuccess(false);
      setTestStatus('idle');
      setTestMessage('');
    }
  }, [isOpen]);

  const persistChanges = (currentTemplates: Template[], currentPrompt?: string, currentLogo?: string, currentPlayStore?: string, currentAppStore?: string) => {
    try {
      localStorage.setItem('fareapp_templates', JSON.stringify(currentTemplates));
      if (currentPrompt !== undefined) localStorage.setItem('fareapp_chatbot_prompt', currentPrompt);
      if (currentLogo !== undefined) localStorage.setItem('fareapp_site_logo', currentLogo);
      if (currentPlayStore !== undefined) localStorage.setItem('fareapp_play_store_url', currentPlayStore);
      if (currentAppStore !== undefined) localStorage.setItem('fareapp_app_store_url', currentAppStore);
      
      window.dispatchEvent(new Event('fareapp_data_updated'));
      
      setIsSaved(true);
      setTimeout(() => setIsSaved(false), 2000);
      return true;
    } catch (e) {
      alert("Errore: I dati sono troppo pesanti per il salvataggio locale.");
      return false;
    }
  };

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (email === DEFAULT_ADMIN.email && password === DEFAULT_ADMIN.password) {
      setView('editor');
    } else {
      setLoginError(true);
    }
  };

  const handleSaveAll = () => {
    persistChanges(templates, prompt, siteLogo, playStoreUrl, appStoreUrl);
  };

  const handleSaveItem = (id: string) => {
    setSavingId(id);
    persistChanges(templates, prompt, siteLogo, playStoreUrl, appStoreUrl);
    setTimeout(() => setSavingId(null), 1000);
  };

  const handleTestConnection = async () => {
    setTestStatus('loading');
    setTestMessage('Verifica in corso...');
    const result = await geminiService.testConnection();
    if (result.success) {
      setTestStatus('success');
    } else {
      setTestStatus('error');
    }
    setTestMessage(result.message);
  };

  const updateTemplateField = (id: string, field: keyof Template, value: string) => {
    setTemplates(prev => prev.map(t => t.id === id ? { ...t, [field]: value } : t));
  };

  const handleFileUpload = async (id: string, e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setIsProcessing(id);
      try {
        const reader = new FileReader();
        reader.onload = (event) => {
          const base64 = event.target?.result as string;
          updateTemplateField(id, 'image', base64);
          setIsProcessing(null);
        };
        reader.readAsDataURL(file);
      } catch (error) {
        setIsProcessing(null);
      }
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/70 backdrop-blur-md animate-in fade-in duration-300">
      <div className="bg-white w-full max-w-6xl rounded-[2.5rem] shadow-2xl overflow-hidden flex flex-col max-h-[95vh] border border-white/20">
        
        {(view === 'login' || view === 'reset') ? (
          <div className="max-w-md mx-auto w-full py-20 px-6">
            <div className="bg-gray-900 p-8 rounded-[2rem] text-white shadow-2xl">
              <div className="flex flex-col items-center gap-4 mb-8">
                <div className="bg-blue-600 p-4 rounded-2xl shadow-lg shadow-blue-500/20">
                  <Lock size={32} />
                </div>
                <div className="text-center">
                  <h2 className="font-black text-2xl tracking-tight">Admin Fare App</h2>
                  <p className="text-xs text-gray-400">Inserisci le credenziali per gestire il sito</p>
                </div>
              </div>
              <form onSubmit={handleLogin} className="space-y-4">
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full bg-white/5 border border-white/10 rounded-xl py-3 px-4 outline-none focus:ring-2 focus:ring-blue-500 transition-all"
                  placeholder="Email"
                  required
                />
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full bg-white/5 border border-white/10 rounded-xl py-3 px-4 outline-none focus:ring-2 focus:ring-blue-500 transition-all"
                  placeholder="Password"
                  required
                />
                {loginError && <p className="text-red-400 text-xs font-bold text-center">Credenziali errate</p>}
                <button type="submit" className="w-full bg-blue-600 text-white py-4 rounded-xl font-black shadow-xl hover:bg-blue-700 transition-all">Accedi</button>
              </form>
              <button onClick={onClose} className="w-full mt-4 text-gray-500 hover:text-white text-xs font-bold transition-colors">Torna al sito</button>
            </div>
          </div>
        ) : (
          <>
            {/* Header Fissato */}
            <div className="bg-gray-900 p-6 text-white flex justify-between items-center shrink-0">
              <div className="flex items-center gap-6">
                <div className="flex items-center gap-3">
                  <div className="bg-blue-600 p-2 rounded-xl"><Settings size={20} /></div>
                  <h2 className="font-bold text-lg hidden sm:block">Control Panel</h2>
                </div>
                <nav className="flex gap-1 sm:gap-2">
                  {[
                    { id: 'editor', icon: <Bot size={16} />, label: 'Chatbot' },
                    { id: 'templates', icon: <LayoutIcon size={16} />, label: 'Mockups' },
                    { id: 'branding', icon: <Palette size={16} />, label: 'Branding' }
                  ].map(tab => (
                    <button 
                      key={tab.id}
                      onClick={() => setView(tab.id as any)}
                      className={`px-3 sm:px-4 py-2 rounded-lg text-xs font-bold transition-colors flex items-center gap-2 ${view === tab.id ? 'bg-white/10 text-white' : 'text-gray-400 hover:text-white hover:bg-white/5'}`}
                    >
                      {tab.icon} <span className="hidden xs:inline">{tab.label}</span>
                    </button>
                  ))}
                </nav>
              </div>
              <button onClick={onClose} className="hover:bg-white/10 p-2 rounded-full transition-colors text-gray-400 hover:text-white">
                <X size={24} />
              </button>
            </div>

            {/* Area Contenuto Scrollabile */}
            <div className="flex-1 overflow-y-auto bg-gray-50 custom-scrollbar">
              <div className="p-4 sm:p-8 max-w-5xl mx-auto">
                
                {view === 'branding' && (
                  <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
                    <div className="bg-white p-8 rounded-[2rem] shadow-sm border border-gray-200">
                      <div className="flex items-center gap-4 mb-8">
                        <div className="bg-blue-50 p-3 rounded-2xl text-blue-600"><Palette size={24} /></div>
                        <div>
                          <h3 className="text-xl font-black text-gray-900">Branding & Store</h3>
                          <p className="text-sm text-gray-500">Configura il logo e i link predefiniti agli store.</p>
                        </div>
                      </div>
                      <div className="grid md:grid-cols-2 gap-10">
                        <div className="space-y-6">
                          <div className="space-y-2">
                            <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Logo URL</label>
                            <input type="text" value={siteLogo} onChange={(e) => setSiteLogo(e.target.value)} className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm" />
                          </div>
                          <div className="space-y-2">
                            <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest flex items-center gap-1"><Smartphone size={10} className="text-green-600"/> Global PlayStore</label>
                            <input type="url" value={playStoreUrl} onChange={(e) => setPlayStoreUrl(e.target.value)} className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm" placeholder="https://play.google.com/..." />
                          </div>
                          <div className="space-y-2">
                            <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest flex items-center gap-1"><Apple size={10} className="text-gray-900"/> Global AppStore</label>
                            <input type="url" value={appStoreUrl} onChange={(e) => setAppStoreUrl(e.target.value)} className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm" placeholder="https://apps.apple.com/..." />
                          </div>
                        </div>
                        <div className="bg-gray-50 border-2 border-dashed border-gray-200 rounded-[2rem] flex flex-col items-center justify-center p-8 gap-4">
                          {siteLogo ? <img src={siteLogo} alt="Logo" className="max-h-20 object-contain" /> : <ImageIcon size={48} className="text-gray-300" />}
                          <button onClick={() => logoInputRef.current?.click()} className="bg-blue-600 text-white px-6 py-3 rounded-xl font-bold text-sm shadow-lg">Carica Logo</button>
                          <input type="file" ref={logoInputRef} className="hidden" accept="image/*" onChange={async (e) => {
                            const file = e.target.files?.[0];
                            if (file) {
                              const reader = new FileReader();
                              reader.onload = (ev) => setSiteLogo(ev.target?.result as string);
                              reader.readAsDataURL(file);
                            }
                          }} />
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {view === 'editor' && (
                  <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
                    <div className="bg-white p-8 rounded-[2rem] shadow-sm border border-gray-200">
                      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-6">
                        <div className="flex items-center gap-4">
                          <div className="bg-indigo-50 p-3 rounded-2xl text-indigo-600"><Bot size={24} /></div>
                          <div>
                            <h3 className="text-xl font-black text-gray-900">Personalità AI</h3>
                            <p className="text-sm text-gray-500">Modifica il comportamento di Alex o testa il motore.</p>
                          </div>
                        </div>
                        
                        <div className="flex flex-col gap-3 min-w-[280px]">
                           <button 
                            onClick={handleTestConnection}
                            disabled={testStatus === 'loading'}
                            className={`flex items-center justify-center gap-2 px-6 py-3.5 rounded-2xl font-black text-xs uppercase tracking-widest transition-all shadow-lg shadow-blue-100 ${
                              testStatus === 'loading' ? 'bg-gray-100 text-gray-400' : 'bg-white border-2 border-blue-600 text-blue-600 hover:bg-blue-50'
                            }`}
                           >
                            {testStatus === 'loading' ? <Loader2 size={16} className="animate-spin" /> : <Zap size={16} />}
                            Test Connessione IA
                           </button>
                           
                           {testStatus !== 'idle' && (
                             <div className={`p-4 rounded-xl flex items-start gap-3 animate-in fade-in zoom-in-95 duration-300 border ${
                               testStatus === 'success' ? 'bg-green-50 border-green-100 text-green-700' : 'bg-red-50 border-red-100 text-red-700'
                             }`}>
                               {testStatus === 'success' ? <CheckCircle2 size={18} className="shrink-0 mt-0.5" /> : <AlertCircle size={18} className="shrink-0 mt-0.5" />}
                               <div>
                                 <p className="font-bold text-xs">{testStatus === 'success' ? 'Sistema Operativo' : 'Errore Sistema'}</p>
                                 <p className="text-[11px] leading-tight opacity-80">{testMessage}</p>
                               </div>
                             </div>
                           )}
                        </div>
                      </div>
                      
                      <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2 block">Istruzioni di Sistema (System Prompt)</label>
                      <textarea
                        value={prompt}
                        onChange={(e) => setPrompt(e.target.value)}
                        className="w-full h-[350px] p-6 bg-gray-50 border border-gray-200 rounded-2xl text-sm font-mono leading-relaxed focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                      />
                    </div>
                  </div>
                )}

                {view === 'templates' && (
                  <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500 pb-10">
                    <div className="flex justify-between items-center mb-4">
                       <h3 className="text-2xl font-black text-gray-900">Gestione Mockups ({templates.length})</h3>
                       <p className="text-xs text-gray-400 font-bold uppercase tracking-widest">Scorri per modificare tutti i progetti</p>
                    </div>
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                      {templates.map((template) => (
                        <div key={template.id} className="bg-white p-6 sm:p-8 rounded-[2.5rem] shadow-sm border border-gray-200 flex flex-col gap-6 relative group hover:border-blue-200 transition-all">
                          <div className="flex flex-col sm:flex-row gap-6">
                            {/* Anteprima Immagine */}
                            <div className="w-full sm:w-32 h-56 rounded-2xl overflow-hidden shrink-0 bg-gray-100 border border-gray-200 shadow-inner relative group-inner">
                              <img src={template.image} alt={template.name} className="w-full h-full object-cover transition-transform group-hover:scale-110 duration-700" />
                              <button 
                                onClick={() => fileInputRefs.current[template.id]?.click()}
                                className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 flex flex-col items-center justify-center text-white transition-opacity gap-2"
                              >
                                <Upload size={24} />
                                <span className="text-[10px] font-black uppercase">Cambia</span>
                              </button>
                              <input 
                                type="file"
                                ref={el => { fileInputRefs.current[template.id] = el; }}
                                className="hidden"
                                accept="image/*"
                                onChange={(e) => handleFileUpload(template.id, e)}
                              />
                            </div>

                            {/* Campi Testuali Principali */}
                            <div className="flex-1 space-y-4">
                              <div className="space-y-1.5">
                                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest flex items-center gap-1">
                                  <Pencil size={10} /> Nome Applicazione
                                </label>
                                <input 
                                  type="text" 
                                  value={template.name}
                                  onChange={(e) => updateTemplateField(template.id, 'name', e.target.value)}
                                  className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm font-black outline-none focus:ring-2 focus:ring-blue-500 transition-all"
                                />
                              </div>
                              
                              <div className="space-y-1.5">
                                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest flex items-center gap-1">
                                  <AlignLeft size={10} /> Descrizione Live (fumetto)
                                </label>
                                <textarea 
                                  value={template.description || ''}
                                  onChange={(e) => updateTemplateField(template.id, 'description', e.target.value)}
                                  className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-xs font-medium outline-none focus:ring-2 focus:ring-blue-500 h-24 resize-none transition-all"
                                  placeholder="Inserisci una breve descrizione per l'utente..."
                                />
                              </div>
                            </div>
                          </div>

                          {/* Link Specifici Store */}
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-4 border-t border-gray-100">
                            <div className="space-y-1.5">
                              <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest flex items-center gap-1">
                                <Smartphone size={10} className="text-green-600" /> PlayStore Link (Android)
                              </label>
                              <input 
                                type="url" 
                                value={template.playStoreUrl || ''}
                                onChange={(e) => updateTemplateField(template.id, 'playStoreUrl', e.target.value)}
                                className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl text-[11px] font-medium outline-none focus:ring-2 focus:ring-blue-500"
                                placeholder="Link specifico Android..."
                              />
                            </div>
                            <div className="space-y-1.5">
                              <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest flex items-center gap-1">
                                <Apple size={10} className="text-gray-900" /> AppStore Link (iOS)
                              </label>
                              <input 
                                type="url" 
                                value={template.appStoreUrl || ''}
                                onChange={(e) => updateTemplateField(template.id, 'appStoreUrl', e.target.value)}
                                className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl text-[11px] font-medium outline-none focus:ring-2 focus:ring-blue-500"
                                placeholder="Link specifico iOS..."
                              />
                            </div>
                          </div>

                          {/* Pulsante di salvataggio rapido per il singolo item */}
                          <button 
                            onClick={() => handleSaveItem(template.id)}
                            className={`flex items-center justify-center gap-2 py-3 rounded-2xl font-black text-xs transition-all shadow-md ${
                              savingId === template.id 
                              ? 'bg-green-500 text-white' 
                              : 'bg-gray-900 text-white hover:bg-black'
                            }`}
                          >
                            {savingId === template.id ? <Check size={16} /> : <Save size={16} />}
                            {savingId === template.id ? 'Salvato!' : 'Salva questo mockup'}
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

              </div>
            </div>

            {/* Footer Fissato con Pulsanti di Azione */}
            <div className="p-6 bg-white border-t border-gray-200 flex flex-col sm:flex-row items-center justify-between gap-4 shrink-0">
              <button 
                onClick={() => {
                  if(confirm('Ripristinare tutti i dati predefiniti?')){
                    localStorage.clear();
                    window.location.reload();
                  }
                }}
                className="flex items-center gap-2 text-gray-400 hover:text-red-600 text-[10px] font-bold uppercase transition-colors"
              >
                <RotateCcw size={14} /> Reset di fabbrica
              </button>
              
              <div className="flex gap-3 w-full sm:w-auto">
                <button onClick={onClose} className="flex-1 sm:flex-none px-8 py-3.5 border border-gray-200 text-gray-600 rounded-2xl font-black text-sm hover:bg-gray-50 transition-colors">Chiudi</button>
                <button 
                  onClick={handleSaveAll}
                  className="flex-1 sm:flex-none flex items-center justify-center gap-2 bg-blue-600 text-white px-10 py-3.5 rounded-2xl font-black text-sm shadow-xl shadow-blue-200 hover:bg-blue-700 active:scale-95 transition-all"
                >
                  <Save size={18} />
                  {isSaved ? 'Dati Aggiornati!' : 'Salva Tutte le Modifiche'}
                </button>
              </div>
            </div>
          </>
        )}
      </div>
      <style>{`
        .custom-scrollbar::-webkit-scrollbar { width: 6px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: #e2e8f0; border-radius: 10px; }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover { background: #cbd5e1; }
      `}</style>
    </div>
  );
};

export default AdminPanel;
