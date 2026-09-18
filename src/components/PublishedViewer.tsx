import { useState, useEffect } from "react";
import { getPublishedApp, renewAppMonthly, PublishedApp } from "../firebase";
import { Sparkles, Calendar, RefreshCw, ExternalLink, ArrowRight, ShieldCheck, Copy, Check, Maximize2 } from "lucide-react";

interface PublishedViewerProps {
  appId: string;
  onOpenEditor: () => void;
}

export default function PublishedViewer({ appId, onOpenEditor }: PublishedViewerProps) {
  const [appData, setAppData] = useState<PublishedApp | null>(null);
  const [loading, setLoading] = useState(true);
  const [renewing, setRenewing] = useState(false);
  const [renewMessage, setRenewMessage] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    async function load() {
      try {
        const data = await getPublishedApp(appId);
        setAppData(data);
      } catch (err) {
        console.error("Failed to load app from Firebase", err);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [appId]);

  const handleCopyLink = () => {
    navigator.clipboard.writeText(window.location.href);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  const handleToggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().catch(() => {});
    } else {
      document.exitFullscreen().catch(() => {});
    }
  };

  const handleRenew = async () => {
    if (!appData || renewing) return;
    setRenewing(true);
    try {
      const res = await renewAppMonthly(appData.id);
      setAppData((prev) => prev ? { ...prev, expiresAt: res.newExpiresAt, renewalCount: res.renewalCount } : null);
      setRenewMessage("تم تجديد صلاحية اللعبة بنجاح لشهر إضافي!");
      setTimeout(() => setRenewMessage(null), 4000);
    } catch (err: any) {
      alert("حدث خطأ أثناء تجديد الصلاحية: " + err.message);
    } finally {
      setRenewing(false);
    }
  };

  if (loading) {
    return (
      <div className="flex h-screen w-screen items-center justify-center bg-slate-50 text-slate-800 font-sans" dir="rtl">
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin" />
          <p className="text-slate-600 text-sm font-medium">جاري تحميل التطبيق...</p>
        </div>
      </div>
    );
  }

  if (!appData) {
    return (
      <div className="flex h-screen w-screen items-center justify-center bg-slate-50 text-slate-800 p-6 font-sans" dir="rtl">
        <div className="max-w-md bg-white border border-slate-200 p-6 rounded-2xl text-center space-y-4 shadow-xl">
          <div className="w-12 h-12 rounded-xl bg-red-50 text-red-600 mx-auto flex items-center justify-center text-xl">
            ⚠️
          </div>
          <h2 className="text-lg font-bold text-slate-900">لم يتم العثور على هذا التطبيق</h2>
          <p className="text-sm text-slate-600">قد يكون الرابط غير صحيح أو تم حذفه.</p>
          <button
            onClick={onOpenEditor}
            className="w-full py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-sm font-bold transition shadow-sm"
          >
            الذهاب للاستوديو الرئيسي
          </button>
        </div>
      </div>
    );
  }

  const expiryDate = new Date(appData.expiresAt);
  const now = new Date();
  const diffDays = Math.ceil((expiryDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));

  return (
    <div className="flex flex-col h-screen w-screen bg-slate-900 overflow-hidden font-sans select-none" dir="rtl">
      {/* Top Floating Hosting Banner */}
      <div className="bg-white border-b border-slate-200 px-4 py-2 flex flex-wrap items-center justify-between text-xs text-slate-700 z-50 gap-2 shadow-sm">
        <div className="flex items-center gap-2.5">
          <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
          <span className="font-bold text-slate-900 text-sm">{appData.title}</span>
          <span className="bg-indigo-50 text-indigo-700 px-2 py-0.5 rounded-full border border-indigo-200 text-[10px] font-semibold">
            {appData.engine}
          </span>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          <button
            onClick={handleCopyLink}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-xs font-semibold transition cursor-pointer"
            title="نسخ رابط اللعبة"
          >
            {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
            <span>{copied ? "تم النسخ!" : "نسخ الرابط"}</span>
          </button>

          <button
            onClick={handleToggleFullscreen}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-xs font-semibold transition cursor-pointer"
            title="ملء الشاشة"
          >
            <Maximize2 className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">شاشة كاملة</span>
          </button>

          <button
            onClick={handleRenew}
            disabled={renewing}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-xs font-semibold transition cursor-pointer"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${renewing ? "animate-spin" : ""}`} />
            <span>تحديث</span>
          </button>

          <button
            onClick={onOpenEditor}
            className="flex items-center gap-1.5 px-3.5 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-xs font-bold transition shadow-sm cursor-pointer"
          >
            <span>فتح في الاستوديو</span>
            <ArrowRight className="w-3.5 h-3.5 rotate-180" />
          </button>
        </div>
      </div>

      {renewMessage && (
        <div className="bg-emerald-950 border-b border-emerald-800 text-emerald-300 px-4 py-1.5 text-center text-xs flex items-center justify-center gap-2">
          <ShieldCheck className="w-4 h-4 text-emerald-400" />
          <span>{renewMessage}</span>
        </div>
      )}

      {/* Main Game Iframe */}
      <div className="flex-1 relative w-full h-full bg-black">
        <iframe
          srcDoc={appData.htmlCode}
          title={appData.title}
          sandbox="allow-scripts allow-forms allow-modals allow-same-origin allow-pointer-lock"
          className="w-full h-full border-0"
        />
      </div>
    </div>
  );
}
