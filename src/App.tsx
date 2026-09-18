import React, { useState, useEffect, useRef, FormEvent } from "react";
import { 
  Play, 
  ExternalLink, 
  Send, 
  Loader2, 
  Brain, 
  PlusCircle, 
  Fan, 
  Crown, 
  Gift,
  ShieldCheck,
  Monitor,
  RotateCcw,
  Sparkles,
  LogOut,
  User as UserIcon
} from "lucide-react";
import PublishedViewer from "./components/PublishedViewer";
import PublishModal from "./components/PublishModal";
import SubscriptionModal from "./components/SubscriptionModal";
import AdminModal from "./components/AdminModal";
import BlankCanvasHero from "./components/BlankCanvasHero";
import AIChatWorkspace from "./components/AIChatWorkspace";
import { DEFAULT_DESERT_MARKET_GAME } from "./defaultDesertMarketGame";
import { 
  checkEmailIsApproved, 
  loginWithGoogle, 
  logoutUser, 
  auth, 
  onAuthStateChanged, 
  UserProfile, 
  getUserProfile, 
  ADMIN_EMAIL 
} from "./firebase";

const DAILY_LIMIT = 1;

const DEFAULT_GENERATION_STAGES = [
  "⏳ الروبوت يحلل الفكرة ويفهم متطلبات المشهد كاملاً...",
  "🧠 مرحلة التفكير الهندسي: تحديد زوايا الكاميرا، المجسمات، والتفاعل...",
  "🏛️ جاري بناء البيئة والمجسمات ثلاثية الأبعاد (Three.js Engine)...",
  "👥 دمج الشخصيات والعناصر التفاعلية وحركات الحركة والفيزياء...",
  "🚗 ضبط أجهزة الإدخال (الكيبورد/الماوس/البي سي) والإضاءة الناعمة...",
  "💥 توليد المؤثرات البصرية والأصوات الهندسية عبر Web Audio API..."
];

export default function App() {
  // Shared app check from URL
  const [sharedAppId, setSharedAppId] = useState<string | null>(() => {
    return new URLSearchParams(window.location.search).get("app");
  });

  // State: whether user is in the blank hero view or in the AI Chat Studio Workspace
  const [hasStarted, setHasStarted] = useState(false);
  const [initialPrompt, setInitialPrompt] = useState("");

  // Main Active 3D App/Game State
  const [htmlCode, setHtmlCode] = useState<string>("");
  const [appTitle, setAppTitle] = useState<string>("مشروع ثلاثي أبعاد جديد");
  const [previewKey, setPreviewKey] = useState(0);

  // Daily Quota & Subscription System: 1 free app, 2nd requires 20$ subscription
  const [dailyCount, setDailyCount] = useState<number>(() => {
    try {
      const today = new Date().toISOString().slice(0, 10);
      const savedDate = localStorage.getItem("rony_daily_date");
      if (savedDate !== today) {
        localStorage.setItem("rony_daily_date", today);
        localStorage.setItem("rony_daily_count", "0");
        return 0;
      }
      const savedCount = localStorage.getItem("rony_daily_count");
      return savedCount ? parseInt(savedCount, 10) || 0 : 0;
    } catch (e) {
      return 0;
    }
  });

  const [isSubscribed, setIsSubscribed] = useState<boolean>(() => {
    try {
      return localStorage.getItem("rony_is_vip_subscribed") === "true";
    } catch (e) {
      return false;
    }
  });

  const [userEmail, setUserEmail] = useState<string>(() => {
    try {
      return localStorage.getItem("rony_user_email") || "";
    } catch (e) {
      return "";
    }
  });

  // Real Firebase User & Google Auth State
  const [currentUser, setCurrentUser] = useState<UserProfile | null>(null);
  const [isSigningIn, setIsSigningIn] = useState(false);

  // Suggested features from AI to ask questions in chat
  const [suggestedFeatures, setSuggestedFeatures] = useState<string[]>([]);

  // Input states in hero
  const [heroPrompt, setHeroPrompt] = useState("");
  const [uploadedImage, setUploadedImage] = useState<string | null>(null);

  // Modals
  const [isSubscriptionModalOpen, setIsSubscriptionModalOpen] = useState(false);
  const [isAdminModalOpen, setIsAdminModalOpen] = useState(false);
  const [isPublishModalOpen, setIsPublishModalOpen] = useState(false);

  // Generation status
  const [isLoading, setIsLoading] = useState(false);
  const [isThinking, setIsThinking] = useState(false);
  const [currentStageIdx, setCurrentStageIdx] = useState(0);
  const [elapsedSeconds, setElapsedSeconds] = useState(0);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [activeThoughtSteps, setActiveThoughtSteps] = useState<string[]>([]);

  // Listen to Firebase Auth state
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (fbUser) => {
      if (fbUser) {
        const email = fbUser.email || "";
        setUserEmail(email);
        try {
          localStorage.setItem("rony_user_email", email);
        } catch (e) {}

        try {
          const profile = await getUserProfile(fbUser.uid);
          if (profile) {
            setCurrentUser(profile);
          }
          const approved = await checkEmailIsApproved(email);
          if (approved) {
            setIsSubscribed(true);
            try {
              localStorage.setItem("rony_is_vip_subscribed", "true");
            } catch (e) {}
          }
        } catch (e) {
          console.error("Error fetching user profile:", e);
        }
      } else {
        setCurrentUser(null);
      }
    });

    return () => unsubscribe();
  }, []);

  // Real-time Firestore sync on mount: check if user is in approved_emails
  useEffect(() => {
    const checkUserStatus = async () => {
      const email = userEmail || localStorage.getItem("rony_user_email");
      if (email) {
        try {
          const approved = await checkEmailIsApproved(email);
          if (approved) {
            setIsSubscribed(true);
            localStorage.setItem("rony_is_vip_subscribed", "true");
          }
        } catch (e) {
          console.error("Error verifying subscription:", e);
        }
      }
    };
    checkUserStatus();
  }, [userEmail]);

  const handleGoogleSignIn = async () => {
    setIsSigningIn(true);
    setErrorMessage(null);
    try {
      const profile = await loginWithGoogle();
      setCurrentUser(profile);
      setUserEmail(profile.email);
      try {
        localStorage.setItem("rony_user_email", profile.email);
      } catch (e) {}

      const approved = await checkEmailIsApproved(profile.email);
      if (approved) {
        setIsSubscribed(true);
        try {
          localStorage.setItem("rony_is_vip_subscribed", "true");
        } catch (e) {}
      }
    } catch (err: any) {
      console.error("Google sign in failed:", err);
      setErrorMessage("حدث خطأ أثناء تسجيل الدخول بحساب Google: " + (err.message || err));
    } finally {
      setIsSigningIn(false);
    }
  };

  const handleLogout = async () => {
    try {
      await logoutUser();
      setCurrentUser(null);
      setUserEmail("");
      setIsSubscribed(false);
      localStorage.removeItem("rony_user_email");
      localStorage.removeItem("rony_is_vip_subscribed");
    } catch (e) {}
  };

  // Loading animation timer
  useEffect(() => {
    let timerInterval: any = null;
    let stageInterval: any = null;

    if (isLoading || isThinking) {
      setElapsedSeconds(0);
      timerInterval = setInterval(() => {
        setElapsedSeconds((s) => s + 1);
      }, 1000);

      stageInterval = setInterval(() => {
        setCurrentStageIdx((prev) => (prev + 1) % DEFAULT_GENERATION_STAGES.length);
      }, 3000);
    } else {
      setElapsedSeconds(0);
      setCurrentStageIdx(0);
    }

    return () => {
      clearInterval(timerInterval);
      clearInterval(stageInterval);
    };
  }, [isLoading, isThinking]);

  // Execute Generation
  const executeGeneration = async (promptText: string) => {
    // 1. Quota Check: 1 free app, then requires VIP subscription ($20)
    if (!isSubscribed && dailyCount >= DAILY_LIMIT) {
      setErrorMessage("استنفدت تطبيقك المجاني لليوم (1 تطبيق يومياً). اشترك في باقة VIP للمتابعة دون حدود!");
      setIsSubscriptionModalOpen(true);
      return;
    }

    setHasStarted(true);
    setInitialPrompt(promptText);
    setIsThinking(true);
    setErrorMessage(null);
    setActiveThoughtSteps([
      `استلام الفكرة: "${promptText.slice(0, 60)}..."`,
      "تجهيز بيئة 3D ومحرك Three.js المخصص للكمبيوتر (PC)",
      "هندسة زوايا الكاميرا والإضاءة والفيزياء والتصادمات",
      "دمج الصوت والمؤثرات وتحكم الماوس ولوحة المفاتيح"
    ]);

    try {
      setIsThinking(false);
      setIsLoading(true);

      const response = await fetch("/api/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          prompt: promptText,
          currentCode: htmlCode || undefined,
          uploadedImage: uploadedImage || undefined,
          engine: "threejs",
        }),
      });

      const data = await response.json().catch(() => ({}));

      if (!response.ok) {
        throw new Error(data.error || "فشل الاتصال بالخادم. يرجى المحاولة مرة أخرى.");
      }

      if (data.html) {
        if (data.title) setAppTitle(data.title);
        setHtmlCode(data.html);
        setPreviewKey((k) => k + 1);

        if (data.suggestedFeatures && Array.isArray(data.suggestedFeatures)) {
          setSuggestedFeatures(data.suggestedFeatures);
        }

        // Increment daily count if not subscribed
        if (!isSubscribed) {
          setDailyCount((prev) => {
            const updated = prev + 1;
            try {
              localStorage.setItem("rony_daily_count", updated.toString());
              localStorage.setItem("rony_daily_date", new Date().toISOString().slice(0, 10));
            } catch (e) {}
            return updated;
          });
        }
      }
    } catch (err: any) {
      setErrorMessage(err.message || "حدث خطأ أثناء معالجة وبرمجة التطبيق.");
    } finally {
      setIsLoading(false);
      setIsThinking(false);
    }
  };

  const handleHeroSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!heroPrompt.trim() && !uploadedImage) {
      setErrorMessage("يرجى كتابة فكرة أو التحدث بالصوت أو اختيار أحد النماذج بالأسفل.");
      return;
    }
    executeGeneration(heroPrompt);
  };

  const handleOpenFullscreen = () => {
    if (!htmlCode) return;
    const blob = new Blob([htmlCode], { type: "text/html;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    window.open(url, "_blank");
  };

  const handleResetToBlank = () => {
    if (htmlCode && !confirm("هل تريد إفراغ المساحة والعودة للوحة الأفكار الرئيسية؟")) return;
    setHtmlCode("");
    setHasStarted(false);
    setHeroPrompt("");
    setInitialPrompt("");
    setUploadedImage(null);
  };

  // If viewing a shared published app directly
  if (sharedAppId) {
    return <PublishedViewer appId={sharedAppId} onOpenEditor={() => setSharedAppId(null)} />;
  }

  return (
    <div className="flex flex-col h-screen w-screen bg-slate-950 text-slate-100 font-sans overflow-hidden select-none" dir="rtl">
      
      {/* Top Header Bar */}
      <header className="h-14 border-b border-slate-800 bg-slate-900/90 backdrop-blur px-4 flex items-center justify-between shrink-0 z-20 shadow-md">
        
        {/* Brand & App Info */}
        <div className="flex items-center gap-3">
          <button 
            type="button" 
            onClick={handleResetToBlank}
            className="p-2 bg-indigo-600/20 text-indigo-400 rounded-xl border border-indigo-500/30 flex items-center justify-center shadow-xs cursor-pointer hover:bg-indigo-600/30 transition"
            title="الرئيسية"
          >
            <Fan className="w-5 h-5 animate-spin text-indigo-400" style={{ animationDuration: "4s" }} />
          </button>

          <div>
            <h1 className="text-xs sm:text-sm font-black text-white flex items-center gap-2">
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-purple-400 font-extrabold text-base tracking-tight">
                بريتكس 360
              </span>
              <span className="text-slate-700 font-light hidden sm:inline">|</span>
              <span className="font-bold text-slate-300 max-w-[140px] sm:max-w-[240px] truncate">
                {hasStarted ? appTitle : "منصة التطبيقات والألعاب بالذكاء الاصطناعي"}
              </span>
              {hasStarted && htmlCode && (
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 shrink-0">
                  مباشر للعب
                </span>
              )}
            </h1>
            <p className="text-[11px] text-slate-400 hidden lg:flex items-center gap-1.5">
              <Monitor className="w-3 h-3 text-indigo-400" />
              <span>مخصص للبي سي (PC) • 1 تطبيق مجاني يومياً • اشتراك VIP $20</span>
            </p>
          </div>
        </div>

        {/* Center: Quota Indicator & Google Login & Admin Portal Trigger */}
        <div className="flex items-center gap-2">
          
          {/* Subscription / Quota Button */}
          <button
            type="button"
            onClick={() => setIsSubscriptionModalOpen(true)}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl border text-xs font-bold transition shadow-xs cursor-pointer ${
              isSubscribed
                ? "bg-amber-500/10 hover:bg-amber-500/20 border-amber-500/30 text-amber-300"
                : dailyCount >= DAILY_LIMIT
                  ? "bg-rose-500/10 hover:bg-rose-500/20 border-rose-500/30 text-rose-300"
                  : "bg-emerald-500/10 hover:bg-emerald-500/20 border-emerald-500/30 text-emerald-300"
            }`}
            title="الاشتراكات والحصة اليومية"
          >
            {isSubscribed ? (
              <>
                <Crown className="w-3.5 h-3.5 text-amber-400" />
                <span className="hidden sm:inline">VIP مفعّل (غير محدود)</span>
                <span className="sm:hidden">VIP</span>
              </>
            ) : dailyCount >= DAILY_LIMIT ? (
              <>
                <Crown className="w-3.5 h-3.5 text-rose-400" />
                <span>0/1 متبقي (اشترك بـ 20$)</span>
              </>
            ) : (
              <>
                <Gift className="w-3.5 h-3.5 text-emerald-400" />
                <span>1/1 متاح اليوم مجاناً</span>
              </>
            )}
          </button>

          {/* Google Sign In / User Status */}
          {currentUser ? (
            <div className="flex items-center gap-2 bg-slate-800/90 px-2.5 py-1 rounded-xl border border-slate-700 shadow-xs">
              {currentUser.photoURL ? (
                <img src={currentUser.photoURL} alt="avatar" className="w-5 h-5 rounded-full" />
              ) : (
                <div className="w-5 h-5 rounded-full bg-indigo-600 text-white flex items-center justify-center text-[10px] font-bold">
                  {currentUser.displayName?.charAt(0) || "U"}
                </div>
              )}
              <span className="text-xs text-slate-200 font-bold hidden md:inline truncate max-w-[110px]">
                {currentUser.displayName || currentUser.email}
              </span>
              <button
                type="button"
                onClick={handleLogout}
                title="تسجيل الخروج"
                className="text-slate-400 hover:text-rose-400 transition cursor-pointer p-0.5"
              >
                <LogOut className="w-3.5 h-3.5" />
              </button>
            </div>
          ) : (
            <button
              type="button"
              onClick={handleGoogleSignIn}
              disabled={isSigningIn}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white hover:bg-slate-100 text-slate-900 font-bold text-xs shadow-xs transition cursor-pointer disabled:opacity-60"
              title="تسجيل الدخول بحساب Google"
            >
              <svg className="w-3.5 h-3.5 shrink-0" viewBox="0 0 24 24">
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"/>
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"/>
              </svg>
              <span className="hidden sm:inline">{isSigningIn ? "جاري الدخول..." : "دخول Google"}</span>
            </button>
          )}

          {/* Admin Dashboard Entry Button - RESTRICTED ONLY TO al6332047@gmail.com */}
          {userEmail?.toLowerCase() === "al6332047@gmail.com" && (
            <button
              type="button"
              onClick={() => setIsAdminModalOpen(true)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 border border-amber-500/40 text-xs font-black transition cursor-pointer shadow-sm"
              title="لوحة تحكم الأدمن (قبول الطلبات والتحويلات)"
            >
              <ShieldCheck className="w-3.5 h-3.5 text-amber-400" />
              <span>لوحة الأدمن</span>
            </button>
          )}

        </div>

        {/* Right Action Tools: Fullscreen, Reset & Permanent Real Publish Button */}
        <div className="flex items-center gap-2">
          
          {hasStarted && (
            <button
              type="button"
              onClick={handleResetToBlank}
              title="فكرة جديدة"
              className="flex items-center gap-1 px-2.5 sm:px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-300 text-xs font-medium transition cursor-pointer"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">فكرة جديدة</span>
            </button>
          )}

          {hasStarted && htmlCode && (
            <button
              type="button"
              onClick={handleOpenFullscreen}
              title="فتح في شاشة كاملة"
              className="flex items-center gap-1 px-2.5 sm:px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-300 text-xs font-medium transition cursor-pointer"
            >
              <ExternalLink className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">شاشة كاملة</span>
            </button>
          )}

          {/* Permanent Real Publish Button (Kept as requested) */}
          <button
            id="publish-btn-main"
            type="button"
            onClick={() => {
              if (!htmlCode) {
                setHtmlCode(DEFAULT_DESERT_MARKET_GAME);
                setAppTitle("معركة السوق الصحراوي التكتيكية 3D (ماكس جودة)");
              }
              setIsPublishModalOpen(true);
            }}
            className="flex items-center gap-1.5 px-3.5 sm:px-4 py-1.5 rounded-xl bg-gradient-to-r from-indigo-600 to-indigo-700 hover:from-indigo-500 hover:to-indigo-600 active:scale-95 text-white font-black text-xs sm:text-sm shadow-md shadow-indigo-600/30 transition cursor-pointer shrink-0"
            title="نشر اللعبة وتوليد رابط مباشر حقيقي للمشاركة واللعب الفوري"
          >
            <Send className="w-3.5 h-3.5" />
            <span>نشر (رابط اللعبة)</span>
          </button>

        </div>
      </header>

      {/* Main Container: Blank Hero View OR Interactive AI Chat Studio */}
      <main className="flex-1 w-full h-full overflow-hidden relative">
        {!hasStarted ? (
          /* Landing Screen: Centered Input Box + Symmetrical Boxes Down Below */
          <BlankCanvasHero
            inputPrompt={heroPrompt}
            setInputPrompt={setHeroPrompt}
            uploadedImage={uploadedImage}
            setUploadedImage={setUploadedImage}
            onSubmit={handleHeroSubmit}
            onSelectPrompt={(p) => {
              setHeroPrompt(p);
              executeGeneration(p);
            }}
            dailyCount={dailyCount}
            dailyLimit={DAILY_LIMIT}
            isSubscribed={isSubscribed}
            onOpenSubscriptionModal={() => setIsSubscriptionModalOpen(true)}
          />
        ) : (
          /* Interactive Studio: Chat Stream with AI + Live 3D Game Stage (No code tab) */
          <AIChatWorkspace
            initialPrompt={initialPrompt || heroPrompt}
            htmlCode={htmlCode}
            appTitle={appTitle}
            suggestedFeatures={suggestedFeatures}
            isLoading={isLoading || isThinking}
            onSendMessage={(msg) => executeGeneration(msg)}
            onPublishClick={() => setIsPublishModalOpen(true)}
            onOpenFullscreen={handleOpenFullscreen}
            onResetToBlank={handleResetToBlank}
            previewKey={previewKey}
          />
        )}
      </main>

      {/* Error Toast Notification if any */}
      {errorMessage && (
        <div className="px-4 py-2.5 bg-rose-950 border-t border-rose-800 text-rose-200 text-xs flex items-center justify-between shrink-0 z-30">
          <span>{errorMessage}</span>
          <button 
            onClick={() => setErrorMessage(null)} 
            className="text-rose-300 hover:text-white font-bold cursor-pointer"
          >
            إغلاق
          </button>
        </div>
      )}

      {/* Real Publish Modal */}
      {isPublishModalOpen && (
        <PublishModal
          title={appTitle}
          htmlCode={htmlCode || DEFAULT_DESERT_MARKET_GAME}
          prompt={initialPrompt || heroPrompt || "تطبيق / لعبة ثلاثية الأبعاد"}
          engine="Three.js 3D Engine"
          currentUser={currentUser}
          onRequireLogin={handleGoogleSignIn}
          onClose={() => setIsPublishModalOpen(false)}
        />
      )}

      {/* Subscription & Payment Modal ($20 with Cash & WhatsApp) */}
      <SubscriptionModal
        isOpen={isSubscriptionModalOpen}
        onClose={() => setIsSubscriptionModalOpen(false)}
        isSubscribed={isSubscribed}
        dailyCount={dailyCount}
        dailyLimit={DAILY_LIMIT}
        userEmail={userEmail}
        onUpgradeToVip={() => {
          setIsSubscribed(true);
          try {
            localStorage.setItem("rony_is_vip_subscribed", "true");
          } catch (e) {}
          setIsSubscriptionModalOpen(false);
        }}
        onResetDailyCount={() => {
          setDailyCount(0);
          try {
            localStorage.setItem("rony_daily_count", "0");
          } catch (e) {}
        }}
      />

      {/* Admin Management Dashboard Modal */}
      <AdminModal
        isOpen={isAdminModalOpen}
        onClose={() => setIsAdminModalOpen(false)}
        currentUserEmail={userEmail}
        onSubscriptionApprovedLocally={(approvedMail) => {
          if (userEmail && userEmail.toLowerCase() === approvedMail.toLowerCase()) {
            setIsSubscribed(true);
            try {
              localStorage.setItem("rony_is_vip_subscribed", "true");
            } catch (e) {}
          }
        }}
      />

    </div>
  );
}
