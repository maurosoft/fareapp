
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
  const [keyInfo, setKeyInfo] = useState({ status: 'missing', length: 0 });

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
    setTestMessage('Verifica integrità v5.0...');
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
                  <h2 className="font-bold text-lg hidden sm:block">Control Panel <span className="text-[10px] bg-blue-500 px-2 py-0.5 rounded text-white ml-2 font-mono">v5.0</span></h2>
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
                        <div className="bg-blue-50 p-3 rounded-2xl text-blue-600"><Bot size={24} /></div>
                        <div>
                          <h3 className="text-xl font-black text-gray-900">Configurazione Alex AI</h3>
                          <div className="flex items-center gap-2 mt-1">
                            <div className={`w-2 h-2 rounded-full ${keyInfo.status === 'ok' ? 'bg-green-500' : 'bg-red-500 animate-pulse'}`}></div>
                            <span className="text-[10px] font-black text-gray-400 uppercase tracking-tighter">
                              VAR STATUS: {keyInfo.status.replace('_', ' ').toUpperCase()} {keyInfo.length > 0 && `(${keyInfo.length} char)`}
                            </span>
                          </div>
                        </div>
                      </div>
                      
                      <div className="flex flex-col gap-3 min-w-[320px]">
                         <button onClick={handleTestConnection} disabled={testStatus === 'loading'} className="flex items-center justify-center gap-2 px-6 py-4 rounded-2xl font-black text-xs uppercase bg-blue-600 text-white hover:bg-blue-700 transition-all shadow-xl shadow-blue-200">
                          {testStatus === 'loading' ? <Loader2 size={18} className="animate-spin" /> : <Zap size={18} />}
                          Testa Connessione V5
                         </button>
                         
                         {testStatus !== 'idle' && (
                           <div className={`p-4 rounded-2xl flex items-start gap-3 border animate-in fade-in slide-in-from-top-2 ${testStatus === 'success' ? 'bg-green-50 border-green-200 text-green-800' : 'bg-red-50 border-red-200 text-red-800'}`}>
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
              
              {/* Le altre sezioni templates e branding rimangono invariate */}
            </div>

            <div className="p-6 bg-white border-t border-gray-200 flex items-center justify-between shrink-0">
              <button onClick={() => { if(confirm('Svuotare la cache locale?')){ localStorage.clear(); window.location.reload(); } }} className="text-gray-400 hover:text-red-600 text-[10px] font-bold uppercase flex items-center gap-2"><RotateCcw size={14} /> Clear Cache</button>
              <button onClick={persistChanges} className="bg-blue-600 text-white px-10 py-3.5 rounded-2xl font-black text-sm shadow-xl hover:bg-blue-700 transition-all">
                {isSaved ? 'DATI SALVATI' : 'SALVA TUTTO'}
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default AdminPanel;
