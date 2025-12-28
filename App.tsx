import React, { useState, useEffect, useRef } from 'react';
import { Message, Sender, BuilderStep, WebsiteConfig, Language } from './types';
import ChatMessage from './components/ChatMessage';
import { generateDesignManifesto } from './services/geminiService';
import { Feather, Send, Palette } from 'lucide-react';

const App: React.FC = () => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [currentStep, setCurrentStep] = useState<BuilderStep>(BuilderStep.Language);
  const [websiteConfig, setWebsiteConfig] = useState<WebsiteConfig>({});
  const [inputValue, setInputValue] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Initial Greeting - Language Selection
  useEffect(() => {
    const initialMessage: Message = {
      id: 'init-1',
      sender: Sender.Bot,
      text: "Please select your language / Lütfen dilinizi seçin:\n\n[ 🇬🇧 English ]   [ 🇹🇷 Türkçe ]",
      type: 'text',
      timestamp: Date.now(),
    };
    setMessages([initialMessage]);
  }, []);

  // Auto-scroll to bottom
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, isProcessing]);

  // Focus input
  useEffect(() => {
    if (!isProcessing && currentStep !== BuilderStep.Completed) {
      inputRef.current?.focus();
    }
  }, [messages, isProcessing, currentStep]);

  const handleSendMessage = async (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!inputValue.trim() || isProcessing) return;

    const userText = inputValue.trim();
    setInputValue('');

    // 1. Add User Message
    const userMsg: Message = {
      id: Date.now().toString(),
      sender: Sender.User,
      text: userText,
      type: 'text',
      timestamp: Date.now(),
    };
    setMessages(prev => [...prev, userMsg]);

    // 2. Process based on current step
    processStep(userText);
  };

  const processStep = async (userInput: string) => {
    setIsProcessing(true);
    await new Promise(r => setTimeout(r, 800)); // Delay for "thinking" feel

    let nextBotMessageText = "";
    let nextStep = currentStep;
    let nextConfig = { ...websiteConfig };
    
    // Helpers for localization
    const isTr = (lang: Language | undefined) => lang === 'tr';

    switch (currentStep) {
      case BuilderStep.Language:
        const lowerInput = userInput.toLowerCase();
        let selectedLang: Language = 'en';
        
        if (lowerInput.includes('tr') || lowerInput.includes('türk') || lowerInput.includes('turk')) {
          selectedLang = 'tr';
        }
        
        nextConfig.language = selectedLang;
        nextStep = BuilderStep.ProjectName;
        
        if (selectedLang === 'tr') {
          nextBotMessageText = "Mükemmel seçim. Dijital kimliğinizi oluşturmaya başlayalım.\n\n**Proje Adı** nedir?";
        } else {
          nextBotMessageText = "Excellent choice. Let's begin crafting your digital identity.\n\nWhat is the **Project Name**?";
        }
        break;

      case BuilderStep.ProjectName:
        nextConfig.name = userInput;
        nextStep = BuilderStep.Category;
        
        const lang = nextConfig.language || 'en';
        if (isTr(lang)) {
          nextBotMessageText = `Güçlü bir isim. Şimdi yapıyı belirleyelim. Bir düzen seçin:\n\n` +
            "1. 🏢 **Kurumsal & Ekip** (Hero Bölümü + Hizmetler + Kurucu/Ekip Profil Kartları)\n" +
            "2. 🖌️ **Yaratıcı Vitrin** (Masonry Grid Galeri + Sanatçı Biyografisi)\n" +
            "3. 🚀 **SaaS/Teknoloji Ürünü** (Özellik Listesi + Fiyatlandırma + CTA)\n\n" +
            "Lütfen numarasını yazın.";
        } else {
          nextBotMessageText = `A strong name. Now, let's define the structure. Choose a layout:\n\n` +
            "1. 🏢 **Corporate & Team** (Hero Section + Services + Founder/Team Profile Cards)\n" +
            "2. 🖌️ **Creative Showcase** (Masonry Grid Gallery + Artist Bio)\n" +
            "3. 🚀 **SaaS/Tech Product** (Feature List + Pricing + CTA)\n\n" +
            "Please enter the number.";
        }
        break;

      case BuilderStep.Category:
        // Parse category
        let category = "Corporate & Team";
        if (userInput.includes('1')) category = "Corporate & Team";
        else if (userInput.includes('2')) category = "Creative Showcase";
        else if (userInput.includes('3')) category = "SaaS/Tech Product";
        else category = userInput; // Custom fallback

        nextConfig.category = category;
        nextStep = BuilderStep.ArtDirection;

        if (isTr(nextConfig.language)) {
          nextBotMessageText = `Şimdi projenin ruhuna inelim. Lütfen şu ikisini birlikte cevaplayın:\n\n` +
            "1. **Renk Paleti:** Markanızı hangi renkler temsil ediyor? (örn. Lacivert & Altın, Pastel Şeftali)\n" +
            "2. **Duygusal Hava:** Ziyaretçi ne **HİSSETMELİ**? (örn. Güven, Heyecan, Lüks)";
        } else {
          nextBotMessageText = `Now for the soul of the project. Please answer these two together:\n\n` +
            "1. **Color Palette:** Which colors represent your brand? (e.g., Navy & Gold, Pastel Peach)\n" +
            "2. **Emotional Vibe:** How should a visitor **FEEL**? (e.g., Trust, Excitement, Luxury)";
        }
        break;

      case BuilderStep.ArtDirection:
        // We assume the user provided both as requested.
        nextConfig.colorPalette = userInput; // Simplified storage
        nextConfig.emotionalVibe = userInput; // Simplified storage - we pass full string to AI anyway
        
        nextStep = BuilderStep.Completed;
        if (isTr(nextConfig.language)) {
          nextBotMessageText = "Konsepti görselleştiriyorum... 👁️";
        } else {
          nextBotMessageText = "I am visualizing the concept... 👁️";
        }
        break;
    }

    setWebsiteConfig(nextConfig);
    setCurrentStep(nextStep);
    setIsProcessing(false);

    // Send the transition message
    const botMsg: Message = {
      id: 'bot-' + Date.now(),
      sender: Sender.Bot,
      text: nextBotMessageText,
      type: 'text',
      timestamp: Date.now(),
    };
    setMessages(prev => [...prev, botMsg]);

    // If we finished gathering info, trigger the Vision & Generation
    if (nextStep === BuilderStep.Completed) {
       triggerDesignManifesto(nextConfig);
    }
  };

  const triggerDesignManifesto = async (config: WebsiteConfig) => {
    setIsProcessing(true);
    const result = await generateDesignManifesto(config);
    const isTr = config.language === 'tr';
    
    // 1. The Vision Message
    const visionMsg: Message = {
      id: 'vision-' + Date.now(),
      sender: Sender.Bot,
      text: result.vision,
      type: 'text',
      timestamp: Date.now(),
    };
    setMessages(prev => [...prev, visionMsg]);

    // Small delay between vision and code for dramatic effect
    await new Promise(r => setTimeout(r, 1500));

    // 2. The Artifact (Code)
    const codeMsg: Message = {
      id: 'code-' + Date.now(),
      sender: Sender.Bot,
      text: isTr 
        ? "Bu kodu kopyalayın, `index.html` olarak kaydedin ve dijital kimliğinize tanık olun."
        : "Copy this code, save it as `index.html`, and open it to witness your digital identity.",
      type: 'code',
      codeContent: result.htmlCode,
      timestamp: Date.now() + 100,
    };
    setMessages(prev => [...prev, codeMsg]);
    
    setIsProcessing(false);
  };

  return (
    <div className="flex flex-col h-full bg-stone-50 font-sans text-stone-800">
      {/* Header */}
      <header className="flex-none bg-white border-b border-stone-200 px-6 py-5 shadow-sm z-10 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="bg-stone-900 p-2 rounded-lg text-white">
             <Feather className="w-5 h-5" />
          </div>
          <div>
            <h1 className="text-lg font-bold tracking-tight text-stone-900 leading-tight">Art Director AI</h1>
            <p className="text-[10px] uppercase tracking-widest text-stone-500 font-medium">UX Visionary</p>
          </div>
        </div>
        <div className="flex items-center gap-2 text-xs font-medium text-stone-400">
          <Palette className="w-4 h-4" />
          <span>Aesthetics Engine v3.0</span>
        </div>
      </header>

      {/* Chat Area */}
      <main className="flex-1 overflow-y-auto p-4 md:p-8 space-y-6">
        <div className="max-w-3xl mx-auto w-full">
          {messages.map((msg) => (
            <ChatMessage 
              key={msg.id} 
              message={msg} 
            />
          ))}
          
          {isProcessing && (
             <div className="flex items-center gap-2 text-stone-400 text-sm ml-12 animate-pulse font-serif italic">
               <span className="w-1.5 h-1.5 bg-stone-400 rounded-full"></span>
               <span className="w-1.5 h-1.5 bg-stone-400 rounded-full"></span>
               <span className="w-1.5 h-1.5 bg-stone-400 rounded-full"></span>
             </div>
          )}
          <div ref={scrollRef} />
        </div>
      </main>

      {/* Input Area */}
      <footer className="flex-none bg-white border-t border-stone-200 p-6">
        <div className="max-w-3xl mx-auto w-full relative">
           <form onSubmit={handleSendMessage} className="relative group">
             <input 
               ref={inputRef}
               type="text" 
               value={inputValue}
               onChange={(e) => setInputValue(e.target.value)}
               disabled={isProcessing || currentStep === BuilderStep.Completed}
               placeholder={
                 currentStep === BuilderStep.Completed 
                   ? "Session closed." 
                   : "Type your response..."
               }
               className="w-full pl-6 pr-14 py-4 bg-stone-50 border border-stone-200 rounded-xl focus:outline-none focus:ring-1 focus:ring-stone-400 focus:bg-white text-stone-800 placeholder:text-stone-400 disabled:opacity-50 disabled:cursor-not-allowed transition-all font-medium"
             />
             <button 
               type="submit"
               disabled={!inputValue.trim() || isProcessing || currentStep === BuilderStep.Completed}
               className="absolute right-3 top-1/2 -translate-y-1/2 p-2 bg-stone-900 text-white rounded-lg hover:bg-stone-700 disabled:bg-stone-200 disabled:text-stone-400 transition-all shadow-sm"
             >
               <Send size={18} />
             </button>
           </form>
        </div>
      </footer>
    </div>
  );
};

export default App;