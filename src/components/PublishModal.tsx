import { useState } from "react";
import { publishAppToFirebase, renewAppMonthly, saveUserProject, UserProfile } from "../firebase";
import { X, Globe, Check, Copy, RefreshCw, Send, Sparkles, ExternalLink, ShieldCheck, Download, Share2 } from "lucide-react";

interface PublishModalProps {
  title: string;
  htmlCode: string;
  prompt: string;
  engine: string;
  currentUser?: UserProfile | null;
  onRequireLogin?: () => void;
  onClose: () => void;
}

export default function PublishModal({
  title,
  htmlCode,
  prompt,
  engine,
  currentUser,
  onRequireLogin,
  onClose,
}: PublishModalProps) {
  const [publishing, setPublishing] = useState(false);
  const [publishedUrl, setPublishedUrl] = useState<string | null>(null);
  const [appId, setAppId] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [shared, setShared] = useState(false);
  const [renewing, setRenewing] = useState(false);
  const [renewSuccess, setRenewSuccess] = useState(false);

  const handlePublish = async () => {
    if (!htmlCode) {
      alert("يرجى وجود لعبة أو تطبيق 3D أولاً قبل النشر.");
      return;
    }

    setPublishing(true);
    try {
      const id = await publishAppToFirebase({
        title: title || "تطبيق / لعبة 3D",
        htmlCode,
        prompt: prompt || "لعبة ثلاثية الأبعاد",
        engine: engine || "Three.js",
        creatorName: currentUser?.displayName || "مطور بريتكس 360",
        creatorUid: currentUser?.uid || "",
        accountCode: currentUser?.accountCode || "",
      });

      // Also save to user's private library in Firestore if logged in
      if (currentUser?.uid && currentUser?.accountCode) {
        try {
          await saveUserProject(
            currentUser.uid,
            currentUser.accountCode,
            title || "مشروع بريتكس 360",
            htmlCode,
            prompt
          );
        } catch (saveErr) {
          console.warn("Could not save to user library:", saveErr);
        }
      }

      setAppId(id);
      let origin = window.location.origin;
      if (!origin || origin === "null" || origin === "about:blank") {
        origin = window.location.href.split("?")[0].replace(/\/$/, "");
      }
      const path = window.location.pathname || "/";
      const url = `${origin}${path}?app=${id}`;
      setPublishedUrl(url);

      // Auto copy
      try {
        await navigator.clipboard.writeText(url);
        setCopied(true);
        setTimeout(() => setCopied(false), 2500);
      } catch (e) {}
    } catch (err: any) {
      console.error("Publish error:", err);
      alert("حدث خطأ أثناء النشر: " + (err.message || err));
    } finally {
      setPublishing(false);
    }
  };

  const handleCopy = () => {
    if (!publishedUrl) return;
    navigator.clipboard.writeText(publishedUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  const handleShare = async () => {
    if (!publishedUrl) return;
    if (navigator.share) {
      try {
        await navigator.share({
          title: title || "تطبيق / لعبة بريتكس 360",
          text: `جرّب ${title || "هذا التطبيق الرائع"} الآن مباشرة عبر بريتكس 360!`,
          url: publishedUrl,
        });
        setShared(true);
        setTimeout(() => setShared(false), 2000);
        return;
      } catch (e) {}
    }
    handleCopy();
  };

  const handleDownloadHtml = () => {
    if (!htmlCode) return;
    const blob = new Blob([htmlCode], { type: "text/html;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${(title || "game").replace(/\s+/g, "_")}.html`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handleRenew = async () => {
    if (!appId || renewing) return;
    setRenewing(true);
    try {
      await renewAppMonthly(appId);
      setRenewSuccess(true);
      setTimeout(() => setRenewSuccess(false), 3000);
    } catch (err: any) {
      alert("خطأ: " + err.message);
    } finally {
      setRenewing(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center p-4 font-sans" dir="rtl">
      <div className="bg-white border border-slate-200 rounded-2xl max-w-lg w-full p-6 text-slate-800 relative shadow-2xl space-y-5">
        <button
          onClick={onClose}
          className="absolute left-4 top-4 p-1.5 text-slate-400 hover:text-slate-700 rounded-lg hover:bg-slate-100 transition"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-3">
          <div className="p-3 bg-indigo-50 text-indigo-600 rounded-xl border border-indigo-100">
            <Send className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-slate-900">نشر التطبيق</h2>
            <p className="text-xs text-slate-500">إنشاء رابط مباشر لتجربة ومشاركة التطبيق واللعبة على الفور</p>
          </div>
        </div>

        {!publishedUrl ? (
          <div className="space-y-4">
            <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 text-xs space-y-2 text-slate-700">
              <div className="flex justify-between items-center">
                <span className="text-slate-500">اسم المشروع:</span>
                <span className="font-bold text-slate-900">{title || "تطبيق / لعبة ثلاثية الأبعاد"}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-slate-500">حالة الجاهزية:</span>
                <span className="font-semibold text-emerald-600 flex items-center gap-1">
                  <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                  جاهز للنشر الفوري
                </span>
              </div>
              <div className="flex justify-between items-center pt-1 border-t border-slate-200/60">
                <span className="text-slate-500">الناشر / الحساب:</span>
                {currentUser ? (
                  <span className="font-bold text-indigo-700 flex items-center gap-1">
                    <ShieldCheck className="w-3.5 h-3.5 text-indigo-600" />
                    <span>{currentUser.displayName} ({currentUser.accountCode})</span>
                  </span>
                ) : (
                  <button
                    type="button"
                    onClick={onRequireLogin}
                    className="text-indigo-600 hover:text-indigo-800 font-bold underline text-[11px]"
                  >
                    تسجيل الدخول بحساب Google لربط اللعبة بكودك
                  </button>
                )}
              </div>
            </div>

            <button
              onClick={handlePublish}
              disabled={publishing}
              className="w-full py-3.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl transition flex items-center justify-center gap-2 disabled:opacity-50 shadow-md shadow-indigo-600/20"
            >
              {publishing ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  <span>جاري النشر...</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4" />
                  <span>تأكيد النشر (Publish)</span>
                </>
              )}
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="p-3.5 bg-emerald-50 border border-emerald-200 rounded-xl text-xs text-emerald-800 space-y-1">
              <div className="flex items-center gap-1.5 font-bold text-sm text-emerald-900">
                <Check className="w-4 h-4 text-emerald-600" />
                <span>تم النشر بنجاح!</span>
              </div>
              <p className="text-xs text-emerald-700 leading-relaxed">
                رابط تطبيقك جاهز الآن ويمكن لأي شخص فتحه والتجربة مباشرة بدون تثبيت.
              </p>
            </div>

            {/* Link Box */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-700">رابط التطبيق واللعبة المباشر:</label>
              <div className="flex items-center gap-2 bg-slate-50 border border-slate-300 rounded-xl p-2.5">
                <input
                  type="text"
                  readOnly
                  value={publishedUrl}
                  className="bg-transparent border-0 text-xs text-indigo-700 font-mono w-full focus:outline-none select-all"
                  dir="ltr"
                />
                <button
                  onClick={handleCopy}
                  className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-xs font-bold flex items-center gap-1.5 shrink-0 transition shadow-sm cursor-pointer"
                >
                  {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copied ? "تم النسخ!" : "نسخ الرابط"}</span>
                </button>
              </div>
            </div>

            {/* Quick Actions Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 pt-2">
              <a
                href={publishedUrl}
                target="_blank"
                rel="noreferrer"
                className="px-3 py-2.5 bg-slate-900 hover:bg-black text-white rounded-xl text-xs font-bold transition flex items-center justify-center gap-1.5 shadow-sm"
              >
                <span>فتح اللعبة الآن</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </a>

              <button
                type="button"
                onClick={handleShare}
                className="px-3 py-2.5 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 border border-indigo-200 rounded-xl text-xs font-bold transition flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <Share2 className="w-3.5 h-3.5" />
                <span>{shared ? "تمت المشاركة!" : "مشاركة الرابط"}</span>
              </button>

              <button
                type="button"
                onClick={handleDownloadHtml}
                className="px-3 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-200 rounded-xl text-xs font-bold transition flex items-center justify-center gap-1.5 cursor-pointer"
                title="تنزيل كود اللعبة HTML كاملاً للتشغيل دون إنترنت"
              >
                <Download className="w-3.5 h-3.5" />
                <span>تحميل كود HTML</span>
              </button>
            </div>

            <div className="flex items-center justify-between pt-2 border-t border-slate-100">
              <button
                onClick={handleRenew}
                disabled={renewing}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-50 hover:bg-slate-100 border border-slate-200 text-slate-600 rounded-lg text-[11px] font-medium transition cursor-pointer"
              >
                <RefreshCw className={`w-3 h-3 ${renewing ? "animate-spin" : ""}`} />
                <span>{renewSuccess ? "تم تجديد الصلاحية!" : "تجديد الصلاحية شهرياً"}</span>
              </button>
              <span className="text-[11px] text-slate-400">معرف اللعبة: {appId?.slice(0, 10)}...</span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
