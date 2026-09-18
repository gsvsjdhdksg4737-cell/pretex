import React, { useState } from "react";
import { 
  Sparkles, 
  Brain, 
  Car, 
  Utensils, 
  Building2, 
  Shield, 
  ShoppingBag,
  Rocket,
  Skull,
  Crown,
  Gift,
  Monitor,
  Send,
  Upload,
  ArrowDown,
  X
} from "lucide-react";
import VoiceRecorderButton from "./VoiceRecorderButton";

interface IdeaPrompt {
  id: string;
  title: string;
  tag: string;
  category: string;
  prompt: string;
  icon: React.ComponentType<{ className?: string }>;
  accentColor: string;
  badgeBg: string;
}

const SYMMETRICAL_GRID_ITEMS: IdeaPrompt[] = [
  {
    id: "tactical-war",
    title: "معركة السوق الصحراوي التكتيكية 3D",
    tag: "ماكس جودة",
    category: "لعبة إثارة ورماية",
    prompt: "لعبة معركة تكتيكية 3D واقعية في سوق صحراوي بمجسمات جنود قوات خاصة حقيقيين، خوذ وأسلحة M4A1، فيزياء رماية وارتداد ومؤثرات صوتية حقيقية.",
    icon: Shield,
    accentColor: "text-amber-600 bg-amber-50 border-amber-200 group-hover:border-amber-300",
    badgeBg: "bg-amber-100 text-amber-800",
  },
  {
    id: "car-drift",
    title: "سباق سيارات سوبركار وانجراف Drift",
    tag: "محاكاة واقعية",
    category: "ألعاب سيارات",
    prompt: "لعبة محاكاة سباق سيارة رياضية خارقة واقعية 3D: فيزياء قيادة وانجراف Drift، دخان إطارات، عداد سرعة وأصوات محرك تفاعلية مع تحكم كامل.",
    icon: Car,
    accentColor: "text-blue-600 bg-blue-50 border-blue-200 group-hover:border-blue-300",
    badgeBg: "bg-blue-100 text-blue-800",
  },
  {
    id: "street-cafe",
    title: "مقهى ومطعم شوارع حيوي 3D",
    tag: "بيئة وعالم مفتوح",
    category: "تطبيق تفاعلي",
    prompt: "مشهد تفاعلي 3D لشارع حيوي مع مطعم راقي وكافيه في الهواء الطلق: طاولات طعام، كراسي، مظلات، لافتة نيون مشعة، وإضاءات شوارع واقعية وأصوات محيطية.",
    icon: Utensils,
    accentColor: "text-emerald-600 bg-emerald-50 border-emerald-200 group-hover:border-emerald-300",
    badgeBg: "bg-emerald-100 text-emerald-800",
  },
  {
    id: "space-explore",
    title: "استكشاف الفضاء ومطاردة الكويكبات",
    tag: "مغامرة فضائية",
    category: "ألعاب فضاء 3D",
    prompt: "لعبة استكشاف فضاء 3D تفاعلية تقود فيها سفينة فضائية في حزام كويكبات وكواكب عملاقة، مع إطلاق ليزر وجمع بلورات الطاقة الكونية.",
    icon: Rocket,
    accentColor: "text-purple-600 bg-purple-50 border-purple-200 group-hover:border-purple-300",
    badgeBg: "bg-purple-100 text-purple-800",
  },
  {
    id: "zombie-survival",
    title: "مغامرة البقاء ومكافحة الزومبي 3D",
    tag: "بقاء ورعب",
    category: "لعبة أكشن",
    prompt: "لعبة نجاة وبقاء 3D تدافع فيها عن قاعدتك ضد موجات الزومبي في مدينة مهجورة ليلاً، مع كشاف إضاءة وأسلحة وعداد صحة تفاعلي.",
    icon: Skull,
    accentColor: "text-rose-600 bg-rose-50 border-rose-200 group-hover:border-rose-300",
    badgeBg: "bg-rose-100 text-rose-800",
  },
  {
    id: "product-showroom",
    title: "معرض ومتجر منتجات فاخر 3D",
    tag: "تطبيق تجاري",
    category: "تطبيقات أعمال",
    prompt: "تطبيق صالة عرض ومتجر ثلاثي الأبعاد 3D: منصات عرض دائرية مضيئة للمنتجات، كاميرا تفاعلية حرة للدوران والتقريب، ونافذة تفاصيل وسعر تفاعلية.",
    icon: ShoppingBag,
    accentColor: "text-indigo-600 bg-indigo-50 border-indigo-200 group-hover:border-indigo-300",
    badgeBg: "bg-indigo-100 text-indigo-800",
  },
];

interface BlankCanvasHeroProps {
  onSelectPrompt: (promptText: string) => void;
  dailyCount: number;
  dailyLimit: number;
  isSubscribed: boolean;
  onOpenSubscriptionModal: () => void;
  inputPrompt: string;
  setInputPrompt: (val: string) => void;
  uploadedImage: string | null;
  setUploadedImage: (val: string | null) => void;
  onSubmit: (e: React.FormEvent) => void;
}

export default function BlankCanvasHero({ 
  onSelectPrompt,
  dailyCount,
  dailyLimit,
  isSubscribed,
  onOpenSubscriptionModal,
  inputPrompt,
  setInputPrompt,
  uploadedImage,
  setUploadedImage,
  onSubmit
}: BlankCanvasHeroProps) {
  const remaining = Math.max(0, dailyLimit - dailyCount);

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (ev) => {
        setUploadedImage(ev.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <div className="w-full h-full flex flex-col items-center justify-start bg-slate-950 text-slate-100 overflow-y-auto" dir="rtl">
      
      {/* SECTION 1: HERO CENTERED PROMPT BOX (Centered in the viewport) */}
      <div className="w-full min-h-[75vh] flex flex-col items-center justify-center p-6 sm:p-10 relative">
        
        {/* Ambient background glows */}
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-indigo-600/15 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute top-1/3 left-1/3 w-80 h-80 bg-purple-600/10 rounded-full blur-3xl pointer-events-none" />

        <div className="max-w-3xl w-full flex flex-col items-center text-center space-y-6 relative z-10">
          
          {/* PC Platform Badge */}
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-slate-900/90 border border-slate-800 text-slate-300 text-xs font-mono shadow-md">
            <Monitor className="w-3.5 h-3.5 text-indigo-400" />
            <span>منصة بريتكس 360 (Pretex 360) • لكافة التطبيقات والألعاب التفاعلية للـ PC</span>
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
          </div>

          {/* Big Hero Title */}
          <div className="space-y-3">
            <h1 className="text-3xl sm:text-4xl md:text-5xl font-black text-white tracking-tight leading-tight">
              اكتب فكرتك وسيقوم الذكاء الاصطناعي <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 via-purple-300 to-amber-300">
                ببنائها وتشغيلها أمامك مباشرة
              </span>
            </h1>
            <p className="text-xs sm:text-sm text-slate-400 max-w-lg mx-auto leading-relaxed">
              تطبيقك الأول مجاناً بالكامل. ابنِ أي تطبيق أو لعبة تخطر ببالك، وتحدث مع الذكاء الاصطناعي لاختيار الإضافات والمميزات وسيبدأ فورا!
            </p>
          </div>

          {/* HERO CENTERED INPUT BOX (مربع الكتابة في النص تماماً) */}
          <div className="w-full max-w-2xl bg-slate-900/95 border-2 border-indigo-500/40 hover:border-indigo-500/70 rounded-3xl p-3 sm:p-4 shadow-2xl shadow-indigo-950/50 backdrop-blur-xl transition">
            
            <form onSubmit={onSubmit} className="space-y-3">
              <div className="relative">
                <textarea
                  value={inputPrompt}
                  onChange={(e) => setInputPrompt(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" && !e.shiftKey) {
                      e.preventDefault();
                      onSubmit(e);
                    }
                  }}
                  rows={3}
                  placeholder="اكتب فكرة تطبيقك أو لعبتك هنا... (مثال: لعبة قتال تكتيكية بالأسلحة، سباق وانجراف سيارات، متجر إلكتروني تفاعلي، لوحة تحكم وإحصائيات)..."
                  className="w-full bg-transparent border-none text-white text-sm sm:text-base placeholder-slate-500 focus:outline-none resize-none leading-relaxed"
                />
              </div>

              {/* Uploaded Image Preview if any */}
              {uploadedImage && (
                <div className="relative inline-block bg-slate-800 p-1 rounded-xl border border-slate-700">
                  <img src={uploadedImage} alt="User reference" className="w-16 h-16 object-cover rounded-lg" />
                  <button
                    type="button"
                    onClick={() => setUploadedImage(null)}
                    className="absolute -top-1.5 -right-1.5 bg-rose-600 text-white rounded-full p-0.5"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </div>
              )}

              {/* Input Action Controls Bar */}
              <div className="flex items-center justify-between pt-2 border-t border-slate-800">
                
                {/* Voice & Image upload buttons */}
                <div className="flex items-center gap-2">
                  <div className="flex items-center gap-1 bg-slate-800/80 px-2.5 py-1.5 rounded-xl border border-slate-700">
                    <VoiceRecorderButton
                      onTranscription={(text) => setInputPrompt(inputPrompt ? inputPrompt + " " + text : text)}
                    />
                    <span className="text-[11px] text-slate-400 hidden sm:inline">تسجيل بالصوت</span>
                  </div>

                  <label className="flex items-center gap-1 bg-slate-800/80 hover:bg-slate-700/80 text-slate-300 px-2.5 py-1.5 rounded-xl border border-slate-700 text-[11px] transition cursor-pointer">
                    <Upload className="w-3.5 h-3.5 text-indigo-400" />
                    <span className="hidden sm:inline">إرفاق صورة</span>
                    <input type="file" accept="image/*" onChange={handleImageUpload} className="hidden" />
                  </label>
                </div>

                {/* Submit Launch Button */}
                <button
                  type="submit"
                  disabled={!inputPrompt.trim() && !uploadedImage}
                  className="px-6 py-2.5 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 disabled:opacity-40 text-white font-black text-xs sm:text-sm rounded-2xl shadow-lg shadow-indigo-600/30 active:scale-95 transition flex items-center gap-2 cursor-pointer"
                >
                  <Brain className="w-4 h-4 text-amber-300" />
                  <span>انطلق وصمم اللعبة</span>
                  <Send className="w-3.5 h-3.5 mr-1" />
                </button>

              </div>
            </form>

          </div>

          {/* Daily Quota / VIP Pill Status */}
          <div className="flex items-center gap-3 text-xs">
            <button
              type="button"
              onClick={onOpenSubscriptionModal}
              className={`flex items-center gap-2 px-4 py-1.5 rounded-full border transition cursor-pointer ${
                isSubscribed 
                  ? "bg-amber-500/10 border-amber-500/30 text-amber-300 hover:bg-amber-500/20" 
                  : remaining > 0 
                    ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-300 hover:bg-emerald-500/20" 
                    : "bg-rose-500/10 border-rose-500/30 text-rose-300 hover:bg-rose-500/20"
              }`}
            >
              {isSubscribed ? <Crown className="w-3.5 h-3.5 text-amber-400" /> : <Gift className="w-3.5 h-3.5" />}
              <span>
                {isSubscribed 
                  ? "اشتراك VIP فعال (توليد غير محدود)" 
                  : remaining > 0 
                    ? "التطبيق الأول مجاناً (1/1 متاح اليوم)" 
                    : "استنفدت التطبيق المجاني (اشترك بـ 20$ للمزيد)"}
              </span>
            </button>
          </div>

          {/* Scroll Down Indicator */}
          <div className="pt-6 text-slate-500 text-xs flex items-center gap-1 animate-bounce">
            <ArrowDown className="w-3.5 h-3.5" />
            <span>انزل للأسفل للاطلاع على نماذج الألعاب الجاهزة ومميزات المنصة</span>
          </div>

        </div>
      </div>

      {/* SECTION 2: THE SYMMETRICAL BOXES (المربعات تحت خالص في الموقع كما طلب المستخدم) */}
      <div className="w-full max-w-5xl px-6 py-12 space-y-12 border-t border-slate-900 bg-slate-950">
        
        {/* Section Header */}
        <div className="text-center space-y-2">
          <div className="inline-flex items-center gap-2 text-indigo-400 text-xs font-bold uppercase tracking-wider">
            <Sparkles className="w-3.5 h-3.5" />
            <span>نماذج وأفكار جاهزة للانطلاق الفوري</span>
          </div>
          <h3 className="text-xl sm:text-2xl font-black text-white">
            اضغط على أي مربع ليبدأ الذكاء الاصطناعي في بنائه فوراً
          </h3>
          <p className="text-xs text-slate-400">
            يمكنك تجربة أحد هذه العوالم ثلاثية الأبعاد أو تخصيصها عبر شات الذكاء الاصطناعي
          </p>
        </div>

        {/* 6 Symmetrical Boxes */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 w-full">
          {SYMMETRICAL_GRID_ITEMS.map((item) => {
            const Icon = item.icon;
            return (
              <button
                key={item.id}
                type="button"
                onClick={() => onSelectPrompt(item.prompt)}
                className="flex flex-col justify-between p-5 rounded-2xl bg-slate-900/90 hover:bg-slate-800/90 border border-slate-800 hover:border-indigo-500/50 transition text-right shadow-lg group cursor-pointer h-full min-h-[160px]"
              >
                <div>
                  <div className="flex items-center justify-between gap-2 mb-3">
                    <div className="p-2.5 rounded-xl bg-slate-800 border border-slate-700 text-indigo-400 group-hover:text-amber-400 transition">
                      <Icon className="w-5 h-5" />
                    </div>
                    <div className="flex items-center gap-1.5">
                      <span className="text-[10px] px-2 py-0.5 rounded-md bg-slate-800 text-slate-300 font-medium">
                        {item.category}
                      </span>
                      <span className="text-[10px] px-2 py-0.5 rounded-md font-bold bg-indigo-950 text-indigo-300 border border-indigo-800/50">
                        {item.tag}
                      </span>
                    </div>
                  </div>

                  <h4 className="text-sm font-bold text-white group-hover:text-indigo-300 transition mb-1.5">
                    {item.title}
                  </h4>

                  <p className="text-xs text-slate-400 leading-relaxed line-clamp-2">
                    {item.prompt}
                  </p>
                </div>

                <div className="pt-3 mt-3 border-t border-slate-800/80 flex items-center justify-between text-xs text-indigo-400 font-bold group-hover:text-indigo-300">
                  <span>انقر للانطلاق والتشاور</span>
                  <span className="group-hover:-translate-x-1 transition-transform">←</span>
                </div>
              </button>
            );
          })}
        </div>

        {/* 3 Step Features */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-6 border-t border-slate-900 text-right">
          <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800/80 space-y-2">
            <div className="w-8 h-8 rounded-xl bg-indigo-600/20 text-indigo-400 flex items-center justify-center font-bold text-sm">
              1
            </div>
            <h4 className="text-sm font-bold text-white">اكتب فكرتك في مربع النص</h4>
            <p className="text-xs text-slate-400 leading-relaxed">
              استخدم النص أو الصوت لشرح أي لعبة أو تطبيق 3D يخطر ببالك.
            </p>
          </div>

          <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800/80 space-y-2">
            <div className="w-8 h-8 rounded-xl bg-purple-600/20 text-purple-400 flex items-center justify-center font-bold text-sm">
              2
            </div>
            <h4 className="text-sm font-bold text-white">تشاور مع الذكاء الاصطناعي بالشات</h4>
            <p className="text-xs text-slate-400 leading-relaxed">
              يقترح عليك الروبوت الأنماط والخيارات والصور قبل البناء، بدون أي أكواد معقدة.
            </p>
          </div>

          <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800/80 space-y-2">
            <div className="w-8 h-8 rounded-xl bg-emerald-600/20 text-emerald-400 flex items-center justify-center font-bold text-sm">
              3
            </div>
            <h4 className="text-sm font-bold text-white">العب وانشر برابط فوري</h4>
            <p className="text-xs text-slate-400 leading-relaxed">
              تحكم كامل في بيئة اللعبة عبر لوحة مفاتيح الـ PC والماوس مع إمكانية النشر الفوري.
            </p>
          </div>
        </div>

      </div>

    </div>
  );
}
