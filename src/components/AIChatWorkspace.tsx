import React, { useState, useEffect, useRef } from "react";
import { 
  Send, 
  Sparkles, 
  Brain, 
  Bot, 
  User, 
  Play, 
  Maximize2, 
  ExternalLink, 
  Share2, 
  RotateCcw, 
  Volume2, 
  Monitor, 
  CheckCircle2, 
  Sliders, 
  Layers, 
  Eye, 
  Gamepad2, 
  Image as ImageIcon,
  Compass,
  Flame,
  ArrowRight,
  Shield,
  Car,
  Utensils,
  Rocket,
  MessageSquare,
  X
} from "lucide-react";
import VoiceRecorderButton from "./VoiceRecorderButton";

export interface ChatMessage {
  id: string;
  sender: "user" | "ai";
  text: string;
  timestamp: string;
  images?: string[];
  options?: {
    id: string;
    label: string;
    icon?: string;
  }[];
  selectedOption?: string;
  phase?: "analyzing" | "concept" | "options" | "building" | "ready";
}

interface AIChatWorkspaceProps {
  initialPrompt: string;
  htmlCode: string;
  appTitle: string;
  suggestedFeatures?: string[];
  isLoading: boolean;
  onSendMessage: (msg: string) => void;
  onPublishClick: () => void;
  onOpenFullscreen: () => void;
  onResetToBlank: () => void;
  previewKey: number;
}

// Visual conceptual assets to show the user before the final build
const CONCEPT_MOCKUPS = [
  {
    title: "مفهوم البيئة والإضاءة الواقعية PBR",
    desc: "محاكاة الإضاءة الشمسية وظلال ناعمة بدقة 2048 مع خامات احترافية",
    color: "from-amber-600 to-orange-700",
    icon: "☀️"
  },
  {
    title: "هيكل المجسمات والفيزياء الحركية",
    desc: "حسابات تصادمات واقعية وسلاسة 60 إطاراً في الثانية للكمبيوتر",
    color: "from-indigo-600 to-purple-700",
    icon: "🕹️"
  },
  {
    title: "منظور الكاميرا وتجربة اللاعب",
    desc: "دعم كامل للماوس PointerLock وأزرار لوحة المفاتيح W-A-S-D",
    color: "from-emerald-600 to-teal-700",
    icon: "🎮"
  }
];

export default function AIChatWorkspace({
  initialPrompt,
  htmlCode,
  appTitle,
  suggestedFeatures,
  isLoading,
  onSendMessage,
  onPublishClick,
  onOpenFullscreen,
  onResetToBlank,
  previewKey
}: AIChatWorkspaceProps) {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [chatInput, setChatInput] = useState("");
  const [isChatOpen, setIsChatOpen] = useState(true);
  const [activeCameraView, setActiveCameraView] = useState("منظور أول FPS");
  const [activeWeather, setActiveWeather] = useState("نهاري واقعي");
  const [buildPhase, setBuildPhase] = useState<"consulting" | "building" | "ready">(
    htmlCode ? "ready" : "consulting"
  );

  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Initialize conversation stream when user starts
  useEffect(() => {
    if (messages.length === 0 && initialPrompt) {
      const initMessages: ChatMessage[] = [
        {
          id: "msg_user_1",
          sender: "user",
          text: initialPrompt,
          timestamp: new Date().toLocaleTimeString("ar-EG", { hour: "2-digit", minute: "2-digit" }),
        },
        {
          id: "msg_ai_1",
          sender: "ai",
          text: `أهلاً بك يا بطل! استلمت فكرتك: "${initialPrompt}".\n\nأنا مهندس الذكاء الاصطناعي في منصة بريتكس 360. جاري الآن تحليل الفكرة وتجهيز عالم المشهد والفيزياء المتقدمة المخصصة للـ PC.`,
          timestamp: new Date().toLocaleTimeString("ar-EG", { hour: "2-digit", minute: "2-digit" }),
          phase: "analyzing"
        },
        {
          id: "msg_ai_2",
          sender: "ai",
          text: "قبل أن أبدأ بتركيب المجسمات والفيزياء، اختر أسلوب الكاميرا وطريقة اللعب المفضلة لديك:",
          timestamp: new Date().toLocaleTimeString("ar-EG", { hour: "2-digit", minute: "2-digit" }),
          phase: "options",
          options: [
            { id: "fps", label: "منظور أول (FPS) - تحكم بالماوس والسلاح" },
            { id: "tps", label: "منظور ثالث (TPS) - رؤية الشخصية بالكامل" },
            { id: "orbit", label: "كاميرا سينمائية حرة للدوران والتقريب" }
          ]
        }
      ];
      setMessages(initMessages);
    }
  }, [initialPrompt]);

  // Push suggested features questions when app is ready
  useEffect(() => {
    if (suggestedFeatures && suggestedFeatures.length > 0 && htmlCode) {
      setMessages((prev) => {
        const hasSameFeatures = prev.some((m) => m.id.startsWith("ai_sugg_"));
        if (hasSameFeatures) return prev;

        const featureMsg: ChatMessage = {
          id: "ai_sugg_" + Date.now(),
          sender: "ai",
          text: "لقد تم تشغيل وتجهيز التطبيق بنجاح! 🎮\n\nهل تريد إضافة أي من التطويرات والمميزات التالية؟",
          timestamp: new Date().toLocaleTimeString("ar-EG", { hour: "2-digit", minute: "2-digit" }),
          phase: "options",
          options: suggestedFeatures.map((feat, idx) => ({
            id: `feat_${idx}`,
            label: feat,
          }))
        };
        return [...prev, featureMsg];
      });
    }
  }, [suggestedFeatures, htmlCode]);

  // When htmlCode changes to ready
  useEffect(() => {
    if (htmlCode) {
      setBuildPhase("ready");
    }
  }, [htmlCode]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isLoading]);

  const handleSend = (e: React.FormEvent) => {
    e.preventDefault();
    if (!chatInput.trim() || isLoading) return;

    const userText = chatInput.trim();
    setChatInput("");

    const newMsg: ChatMessage = {
      id: "usr_" + Date.now(),
      sender: "user",
      text: userText,
      timestamp: new Date().toLocaleTimeString("ar-EG", { hour: "2-digit", minute: "2-digit" })
    };

    setMessages((prev) => [...prev, newMsg]);

    // Send to parent generator
    onSendMessage(userText);

    // AI response acknowledging
    setTimeout(() => {
      const aiReply: ChatMessage = {
        id: "ai_" + Date.now(),
        sender: "ai",
        text: `تم استلام توجيهك: "${userText}". جاري تعديل المشهد وإعادة ضبط الإضاءة والمجسمات في عالم 3D...`,
        timestamp: new Date().toLocaleTimeString("ar-EG", { hour: "2-digit", minute: "2-digit" }),
        phase: "building"
      };
      setMessages((prev) => [...prev, aiReply]);
    }, 600);
  };

  const handleOptionClick = (optionLabel: string) => {
    setActiveCameraView(optionLabel);

    const userMsg: ChatMessage = {
      id: "usr_opt_" + Date.now(),
      sender: "user",
      text: `أفضل اختيار: ${optionLabel}`,
      timestamp: new Date().toLocaleTimeString("ar-EG", { hour: "2-digit", minute: "2-digit" })
    };

    const aiMsg: ChatMessage = {
      id: "ai_opt_" + Date.now(),
      sender: "ai",
      text: `اختيار ممتاز! تم تثبيت أسلوب (${optionLabel}) وتفعيل حساسات الماوس والفيزياء. جاري الآن تركيب عالم اللعبة بالكامل!`,
      timestamp: new Date().toLocaleTimeString("ar-EG", { hour: "2-digit", minute: "2-digit" }),
      phase: "building"
    };

    setMessages((prev) => [...prev, userMsg, aiMsg]);
    onSendMessage(`تطبيق أسلوب: ${optionLabel} وإكمال بناء اللعبة`);
  };

  return (
    <div className="w-full h-full flex flex-col lg:flex-row bg-slate-900 text-slate-100 overflow-hidden" dir="rtl">
      
      {/* RIGHT/CENTER: Main 3D Canvas / Game Stage (Desktop Optimized) */}
      <div className="flex-1 flex flex-col h-full border-b lg:border-b-0 lg:border-l border-slate-800 bg-slate-950 relative min-w-0">
        
        {/* Stage Header */}
        <div className="p-3.5 sm:p-4 bg-slate-900/90 border-b border-slate-800 flex items-center justify-between gap-3 shrink-0">
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-9 h-9 rounded-xl bg-indigo-600/20 border border-indigo-500/30 text-indigo-400 flex items-center justify-center shrink-0">
              <Gamepad2 className="w-5 h-5" />
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <h2 className="text-xs sm:text-sm font-black text-white truncate max-w-[200px] sm:max-w-md">
                  {appTitle || "عالم ثلاثي الأبعاد قيد التجهيز"}
                </h2>
                <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold shrink-0 ${
                  htmlCode ? "bg-emerald-500/20 text-emerald-300 border border-emerald-500/30" : "bg-amber-500/20 text-amber-300 border border-amber-500/30"
                }`}>
                  {htmlCode ? "جاهز للعب الفوري" : "مرحلة التجهيز والتشاور"}
                </span>
              </div>
              <div className="text-[11px] text-slate-400 hidden sm:flex items-center gap-2">
                <span className="flex items-center gap-1">
                  <Monitor className="w-3 h-3 text-indigo-400" />
                  <span>محسن للكمبيوتر والبي سي (PC)</span>
                </span>
                <span>•</span>
                <span>تحكم: W-A-S-D والماوس</span>
              </div>
            </div>
          </div>

          {/* Action Controls */}
          <div className="flex items-center gap-2 shrink-0">
            {htmlCode && (
              <button
                type="button"
                onClick={onOpenFullscreen}
                className="flex items-center gap-1 px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold transition border border-slate-700 cursor-pointer"
                title="تكبير شاشة كاملة"
              >
                <Maximize2 className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">شاشة كاملة</span>
              </button>
            )}

            {/* Permanent Publish Button */}
            <button
              id="chat-workspace-publish-btn"
              type="button"
              onClick={onPublishClick}
              className="flex items-center gap-1.5 px-4 py-1.5 rounded-xl bg-gradient-to-r from-indigo-600 to-indigo-700 hover:from-indigo-500 hover:to-indigo-600 text-white font-black text-xs sm:text-sm shadow-md shadow-indigo-600/30 active:scale-95 transition cursor-pointer"
              title="نشر اللعبة وتوليد رابط حقيقي ومشاركتها مع الجميع"
            >
              <Share2 className="w-3.5 h-3.5" />
              <span>نشر (رابط اللعبة)</span>
            </button>
          </div>
        </div>

        {/* Stage Content: Visual Blueprint during preparation OR Interactive 3D Canvas */}
        <div className="flex-1 relative w-full h-full bg-slate-950 overflow-hidden">
          {htmlCode ? (
            /* Live Three.js Game / App Canvas */
            <iframe
              key={`preview-chat-${previewKey}`}
              id="active-game-iframe"
              srcDoc={htmlCode}
              title="3D Game Play Stage"
              className="w-full h-full border-none bg-black"
              sandbox="allow-scripts allow-same-origin allow-pointer-lock allow-forms"
            />
          ) : (
            /* Preparation & Visual Blueprint Stage */
            <div className="w-full h-full flex flex-col items-center justify-center p-6 text-center space-y-6 bg-radial from-slate-900 to-slate-950">
              <div className="relative">
                <div className="w-20 h-20 rounded-3xl bg-indigo-600/20 border border-indigo-500/40 text-indigo-400 flex items-center justify-center mx-auto shadow-2xl animate-pulse">
                  <Brain className="w-10 h-10" />
                </div>
                <div className="absolute -bottom-2 -right-2 p-1.5 rounded-xl bg-amber-500 text-slate-950">
                  <Sparkles className="w-4 h-4 animate-spin" />
                </div>
              </div>

              <div className="space-y-2 max-w-lg">
                <h3 className="text-lg sm:text-xl font-black text-white">
                  الذكاء الاصطناعي يجهز عالمك ثلاثي الأبعاد...
                </h3>
                <p className="text-xs sm:text-sm text-slate-400 leading-relaxed">
                  أنا الآن أهندس المجسمات وزوايا الإضاءة والفيزياء. يمكنك التحدث معي في الشات الجانبي واختيار التفضيلات لضبط كل تفصيلة كما تحب!
                </p>
              </div>

              {/* 3 Conceptual Preview Cards */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 w-full max-w-2xl text-right">
                {CONCEPT_MOCKUPS.map((mock, idx) => (
                  <div key={idx} className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-2">
                    <div className="text-2xl">{mock.icon}</div>
                    <h4 className="text-xs font-bold text-white">{mock.title}</h4>
                    <p className="text-[11px] text-slate-400 leading-relaxed">{mock.desc}</p>
                  </div>
                ))}
              </div>

              {/* PC Instructions Badge */}
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-slate-900 border border-slate-800 text-slate-300 text-xs font-mono">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping" />
                <span>تحكم البي سي: اضغط على الشاشة لقفل الماوس واستخدم W-A-S-D للحركة</span>
              </div>
            </div>
          )}
        </div>

        {/* Bottom PC Helper Strip */}
        <div className="p-2.5 bg-slate-900/70 border-t border-slate-800 flex items-center justify-between text-[11px] text-slate-400 px-4">
          <div className="flex items-center gap-3">
            <span className="flex items-center gap-1 font-mono">
              <kbd className="px-1.5 py-0.5 rounded bg-slate-800 border border-slate-700 text-slate-300">W</kbd>
              <kbd className="px-1.5 py-0.5 rounded bg-slate-800 border border-slate-700 text-slate-300">A</kbd>
              <kbd className="px-1.5 py-0.5 rounded bg-slate-800 border border-slate-700 text-slate-300">S</kbd>
              <kbd className="px-1.5 py-0.5 rounded bg-slate-800 border border-slate-700 text-slate-300">D</kbd>
              <span className="mr-1">للحركة</span>
            </span>
            <span className="hidden sm:inline">•</span>
            <span className="hidden sm:inline font-mono">
              <kbd className="px-1.5 py-0.5 rounded bg-slate-800 border border-slate-700 text-slate-300">Space</kbd> للقفز
            </span>
          </div>

          <div className="flex items-center gap-2">
            {!isChatOpen && (
              <button
                type="button"
                onClick={() => setIsChatOpen(true)}
                className="px-2.5 py-1 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg text-xs font-bold flex items-center gap-1 cursor-pointer transition shadow-sm"
              >
                <MessageSquare className="w-3.5 h-3.5" />
                <span>فتح الشات</span>
              </button>
            )}
            <button
              type="button"
              onClick={onResetToBlank}
              className="text-slate-400 hover:text-white transition flex items-center gap-1 cursor-pointer"
            >
              <RotateCcw className="w-3 h-3" />
              <span>فكرة جديدة</span>
            </button>
          </div>
        </div>

      </div>

      {/* LEFT: AI Interactive Chat Panel (The Studio Dialogue) */}
      {isChatOpen ? (
        <div className="w-full lg:w-[420px] xl:w-[460px] flex flex-col h-[50vh] lg:h-full bg-slate-900 border-t lg:border-t-0 shrink-0">
          
          {/* Chat Panel Header */}
          <div className="p-3.5 sm:p-4 bg-slate-900 border-b border-slate-800 flex items-center justify-between shrink-0">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-indigo-500 to-purple-600 text-white flex items-center justify-center shadow-sm">
                <Bot className="w-4 h-4" />
              </div>
              <div>
                <h3 className="text-xs sm:text-sm font-bold text-white flex items-center gap-1.5">
                  <span>شات الذكاء الاصطناعي والمصمم</span>
                  <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                </h3>
                <p className="text-[11px] text-slate-400">
                  تشاور وتجهيز الأفكار والخيارات ثلاثية الأبعاد
                </p>
              </div>
            </div>

            {/* Minimize chat button */}
            <button
              type="button"
              onClick={() => setIsChatOpen(false)}
              className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition text-xs flex items-center gap-1 cursor-pointer"
              title="تصغير نافذة الشات للتركيز على اللعبة"
            >
              <span>تصغير</span>
              <X className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Chat Messages Stream */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {messages.map((msg) => {
              const isAI = msg.sender === "ai";

              return (
                <div
                  key={msg.id}
                  className={`flex flex-col ${isAI ? "items-start" : "items-end"} space-y-1`}
                >
                  <div className="flex items-center gap-1.5 text-[10px] text-slate-400 px-1">
                    <span>{isAI ? "مهندس بريتكس 360 AI" : "أنت"}</span>
                    <span>•</span>
                    <span>{msg.timestamp}</span>
                  </div>

                  <div
                    className={`p-3.5 rounded-2xl max-w-[92%] text-xs sm:text-sm leading-relaxed ${
                      isAI
                        ? "bg-slate-800/90 text-slate-100 border border-slate-700/80 rounded-tr-none shadow-sm"
                        : "bg-indigo-600 text-white rounded-tl-none shadow-md shadow-indigo-600/20"
                    }`}
                  >
                    <p className="whitespace-pre-wrap">{msg.text}</p>

                    {/* Interactive Options Cards sent by AI */}
                    {msg.options && msg.options.length > 0 && (
                      <div className="mt-3 pt-2.5 border-t border-slate-700/80 space-y-1.5">
                        <div className="text-[11px] font-bold text-indigo-300 mb-1">
                          اختر أحد الخيارات للبدء أو الترقية:
                        </div>
                        <div className="flex flex-col gap-1.5">
                          {msg.options.map((opt) => (
                            <button
                              key={opt.id}
                              type="button"
                              onClick={() => handleOptionClick(opt.label)}
                              className="text-right p-2 rounded-xl bg-slate-900/90 hover:bg-indigo-950/80 border border-slate-700 hover:border-indigo-500 text-slate-200 hover:text-white transition font-bold text-[11px] flex items-center justify-between group cursor-pointer"
                            >
                              <span>{opt.label}</span>
                              <span className="text-indigo-400 group-hover:translate-x-[-2px] transition-transform">←</span>
                            </button>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}

            {/* Typing / Thinking Indicator */}
            {isLoading && (
              <div className="flex flex-col items-start space-y-1">
                <div className="flex items-center gap-1.5 text-[10px] text-slate-400 px-1">
                  <span>مهندس بريتكس 360 AI</span>
                </div>
                <div className="p-3 rounded-2xl bg-slate-800 text-slate-200 border border-slate-700 flex items-center gap-2 text-xs">
                  <Brain className="w-4 h-4 text-indigo-400 animate-spin" />
                  <span>جاري بناء وتحديث العالم ثلاثي الأبعاد...</span>
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

        {/* Chat Input Bar */}
        <div className="p-3 bg-slate-900 border-t border-slate-800 shrink-0">
          <form onSubmit={handleSend} className="flex items-center gap-2">
            <div className="relative flex-1">
              <input
                type="text"
                value={chatInput}
                onChange={(e) => setChatInput(e.target.value)}
                placeholder="اطلب أي تعديل (مثال: ضيف سيارات، كبّر المدينة، غير لون السماء)..."
                disabled={isLoading}
                className="w-full pl-10 pr-3.5 py-2.5 rounded-xl bg-slate-800/90 border border-slate-700 text-xs sm:text-sm text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
              <div className="absolute left-2 top-2">
                <VoiceRecorderButton
                  onTranscription={(text) => setChatInput((prev) => (prev ? prev + " " + text : text))}
                  disabled={isLoading}
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={!chatInput.trim() || isLoading}
              className="p-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 disabled:opacity-40 text-white transition shadow-sm cursor-pointer shrink-0"
              title="إرسال"
            >
              <Send className="w-4 h-4" />
            </button>
          </form>
          <div className="text-[10px] text-slate-500 text-center mt-1.5">
            تحدث بحرية بالصوت أو النص لتعديل وتطوير لعبتك في أي لحظة
          </div>
        </div>

      </div>
      ) : null}

    </div>
  );
}
