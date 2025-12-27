
import React, { useState, useEffect, useRef } from 'react';
import { Settings, Save, RotateCcw, X, ShieldCheck, Lock, ArrowLeft, CheckCircle2, Image as ImageIcon, Layout as LayoutIcon, Bot, Upload, Link as LinkIcon, Check, Loader2, Palette, Smartphone, AlignLeft, Apple, Pencil, Zap, Activity, AlertCircle, Info } from 'lucide-react';
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
  
  const [prompt, setPrompt] = useState('');
  const [templates, setTemplates] = useState<Template[]>([]);
  const [siteLogo, setSiteLogo] = useState<string>('');
  const [playStoreUrl, setPlayStoreUrl] = useState<string>('');
  const [appStoreUrl, setAppStoreUrl] = useState<string>('');
  
  const [isSaved, setIsSaved] = useState(false);
  const [testStatus, setTestStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [testMessage, setTestMessage] = useState('');
  const [keyStatus, setKeyStatus] = useState<'ok' | 'missing' | 'undefined_string'>('missing');

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
      setKeyStatus(geminiService.getKeyStatus());
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
    setTestMessage('Interrogazione server Google...');
    const result = await geminiService.testConnection();
    setTestStatus(result.success ? 'success' : 'error');
    setTestMessage(result.message);
    setKeyStatus(geminiService.getKeyStatus());
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

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/70 backdrop-blur-md animate-in fade-in duration-300">
      <div className="bg-white w-full max-w-6xl rounded-[2.5rem] shadow-2xl overflow-hidden flex flex-col max-h-[95vh] border border-white/20">
        
        {view === 'login' ? (
          <div className="max-w-md mx-auto w-full py-20 px-6">
            <div className="bg-gray-900 p-8 rounded-[2rem] text-white shadow-2xl">
              <div className="flex flex-col items-center gap-4 mb-8">
                <div className="bg-blue-600 p-4 rounded-2xl shadow-lg shadow-blue-500/20">
                  <Lock size={32} />
                </div>
                <h2 className="font-black text-2xl tracking-tight">Admin Fare App</h2>
              </div>
              <form onSubmit={handleLogin} className="space-y-4">
                <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} className="w-full bg-white/5 border border-white/10 rounded-xl py-3 px-4 outline-none focus:ring-2 focus:ring-blue-500 text-sm" placeholder="Email" required />
                <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} className="w-full bg-white/5 border border-white/10 rounded-xl py-3 px-4 outline-none focus:ring-2 focus:ring-blue-500 text-sm" placeholder="Password" required />
                {loginError && <p className="text-red-400 text-xs font-bold text-center">Credenziali errate</p>}
                <button type="submit" className="w-full bg-blue-600 text-white py-4 rounded-xl font-black shadow-xl hover:bg-blue-700 transition-all">Accedi</button>
              </form>
              <button onClick={onClose} className="w-full mt-4 text-gray-500 hover:text-white text-xs font-bold transition-colors text-center block">Torna al sito</button>
            </div>
          </div>
        ) : (
          <>
            <div className="bg-gray-900 p-6 text-white flex justify-between items-center shrink-0">
              <div className="flex items-center gap-6">
                <div className="flex items-center gap-3">
                  <div className="bg-blue-600 p-2 rounded-xl"><Settings size={20} /></div>
                  <h2 className="font-bold text-lg hidden sm:block">Control Panel <span className="text-[10px] bg-white/20 px-2 py-0.5 rounded text-blue-200 ml-2 font-mono">v4.0</span></h2>
                </div>
                <nav className="flex gap-2">
                  <button onClick={() => setView('editor')} className={`px-4 py-2 rounded-lg text-xs font-bold transition-colors ${view === 'editor' ? 'bg-white/10 text-white' : 'text-gray-400 hover:text-white'}`}>Chatbot</button>
                  <button onClick={() => setView('templates')} className={`px-4 py-2 rounded-lg text-xs font-bold transition-colors ${view === 'templates' ? 'bg-white/10 text-white' : 'text-gray-400 hover:text-white'}`}>Mockups</button>
                  <button onClick={() => setView('branding')} className={`px-4 py-2 rounded-lg text-xs font-bold transition-colors ${view === 'branding' ? 'bg-white/10 text-white' : 'text-gray-400 hover:text-white'}`}>Branding</button>
                </nav>
              </div>
              <button onClick={onClose} className="hover:bg-white/10 p-2 rounded-full transition-colors text-gray-400 hover:text-white">
                <X size={24} />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto bg-gray-50 p-4 sm:p-8">
              {view === 'editor' && (
                <div className="max-w-4xl mx-auto space-y-8">
                  <div className="bg-white p-8 rounded-[2rem] shadow-sm border border-gray-200">
                    <div className="flex flex-col md:flex-row justify-between gap-6 mb-8">
                      <div className="flex items-center gap-4">
                        <div className="bg-indigo-50 p-3 rounded-2xl text-indigo-600"><Bot size={24} /></div>
                        <div>
                          <h3 className="text-xl font-black text-gray-900">Alex (Gemini AI)</h3>
                          <div className="flex items-center gap-2 mt-1">
                            <div className={`w-2 h-2 rounded-full ${keyStatus === 'ok' ? 'bg-green-500' : 'bg-red-500 animate-pulse'}`}></div>
                            <span className="text-[10px] font-black text-gray-400 uppercase tracking-tighter">
                              VAR: {keyStatus === 'ok' ? 'DISPONIBILE' : keyStatus === 'undefined_string' ? 'UNDEFINED (ERRORE BUILD)' : 'MANCANTE'}
                            </span>
                          </div>
                        </div>
                      </div>
                      
                      <div className="flex flex-col gap-3 min-w-[320px]">
                         <button onClick={handleTestConnection} disabled={testStatus === 'loading'} className="flex items-center justify-center gap-2 px-6 py-4 rounded-2xl font-black text-xs uppercase bg-white border-2 border-blue-600 text-blue-600 hover:bg-blue-50 transition-all shadow-lg">
                          {testStatus === 'loading' ? <Loader2 size={18} className="animate-spin" /> : <Zap size={18} />}
                          Esegui Test Connessione V4
                         </button>
                         
                         {testStatus !== 'idle' && (
                           <div className={`p-4 rounded-2xl flex items-start gap-3 border animate-in fade-in slide-in-from-top-2 ${testStatus === 'success' ? 'bg-green-50 border-green-100 text-green-700' : 'bg-red-50 border-red-100 text-red-700'}`}>
                             {testStatus === 'success' ? <CheckCircle2 size={18} className="shrink-0" /> : <AlertCircle size={18} className="shrink-0" />}
                             <p className="text-[11px] leading-relaxed font-bold">{testMessage}</p>
                           </div>
                         )}
                      </div>
                    </div>
                    
                    <div className="space-y-3">
                      <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest flex items-center gap-2"><Pencil size={12}/> Prompt Istruzioni Alex</label>
                      <textarea value={prompt} onChange={(e) => setPrompt(e.target.value)} className="w-full h-[300px] p-6 bg-gray-50 border border-gray-200 rounded-2xl text-sm font-mono focus:ring-2 focus:ring-blue-500 outline-none shadow-inner" />
                    </div>
                  </div>
                </div>
              )}
              
              {view === 'templates' && (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {templates.map((t, idx) => (
                    <div key={t.id} className="bg-white p-6 rounded-3xl border border-gray-200 shadow-sm hover:shadow-md transition-shadow">
                      <div className="aspect-video bg-gray-100 rounded-2xl mb-4 overflow-hidden relative group">
                        <img src={t.image} className="w-full h-full object-cover" alt="" />
                        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                          <button className="bg-white text-gray-900 p-3 rounded-full"><ImageIcon size={20}/></button>
                        </div>
                      </div>
                      <input value={t.name} onChange={(e) => {
                        const newT = [...templates];
                        newT[idx].name = e.target.value;
                        setTemplates(newT);
                      }} className="w-full font-bold text-gray-900 mb-2 p-2 rounded-lg bg-gray-50 border-none outline-none focus:ring-2 focus:ring-blue-500" />
                      <div className="flex gap-2">
                        <input value={t.category} onChange={(e) => {
                          const newT = [...templates];
                          newT[idx].category = e.target.value;
                          setTemplates(newT);
                        }} className="flex-1 text-xs font-bold text-blue-600 bg-blue-50 p-2 rounded-lg border-none" />
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {view === 'branding' && (
                <div className="max-w-2xl mx-auto space-y-6">
                  <div className="bg-white p-8 rounded-3xl border border-gray-200 space-y-6">
                    <div>
                      <label className="text-xs font-bold text-gray-500 mb-2 block uppercase">Logo Sito (URL)</label>
                      <div className="flex gap-4">
                        <input value={siteLogo} onChange={(e) => setSiteLogo(e.target.value)} className="flex-1 p-4 bg-gray-50 border border-gray-100 rounded-2xl text-sm outline-none focus:ring-2 focus:ring-blue-500" placeholder="https://..." />
                        {siteLogo && <div className="w-14 h-14 rounded-2xl border border-gray-100 p-2 flex items-center justify-center bg-white"><img src={siteLogo} className="max-w-full max-h-full" alt="" /></div>}
                      </div>
                    </div>
                    <div>
                      <label className="text-xs font-bold text-gray-500 mb-2 block uppercase">Google Play Store (URL Globale)</label>
                      <input value={playStoreUrl} onChange={(e) => setPlayStoreUrl(e.target.value)} className="w-full p-4 bg-gray-50 border border-gray-100 rounded-2xl text-sm outline-none focus:ring-2 focus:ring-blue-500" placeholder="https://play.google.com/..." />
                    </div>
                    <div>
                      <label className="text-xs font-bold text-gray-500 mb-2 block uppercase">Apple App Store (URL Globale)</label>
                      <input value={appStoreUrl} onChange={(e) => setAppStoreUrl(e.target.value)} className="w-full p-4 bg-gray-50 border border-gray-100 rounded-2xl text-sm outline-none focus:ring-2 focus:ring-blue-500" placeholder="https://apps.apple.com/..." />
                    </div>
                  </div>
                </div>
              )}
            </div>

            <div className="p-6 bg-white border-t border-gray-200 flex items-center justify-between shrink-0">
              <button onClick={() => { if(confirm('Ripristinare tutto?')){ localStorage.clear(); window.location.reload(); } }} className="text-gray-400 hover:text-red-600 text-[10px] font-bold uppercase flex items-center gap-2"><RotateCcw size={14} /> Reset Cache Locale</button>
              <button onClick={persistChanges} className="bg-blue-600 text-white px-10 py-3.5 rounded-2xl font-black text-sm shadow-xl hover:bg-blue-700 transition-all active:scale-95">
                {isSaved ? 'MODIFICHE APPLICATE' : 'SALVA MODIFICHE'}
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default AdminPanel;
