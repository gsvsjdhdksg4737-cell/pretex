import React, { useState, useEffect } from "react";
import { 
  X, 
  Crown, 
  Check, 
  Sparkles, 
  Zap, 
  ShieldCheck, 
  Gift, 
  Infinity as InfinityIcon, 
  Lock, 
  Flame,
  CheckCircle2,
  AlertCircle,
  Phone,
  MessageSquare,
  Copy,
  ExternalLink,
  RefreshCw,
  Send
} from "lucide-react";
import { 
  getAdminSettings, 
  createSubscriptionRequest, 
  checkEmailIsApproved,
  AdminSettings, 
  DEFAULT_ADMIN_SETTINGS 
} from "../firebase";

interface SubscriptionModalProps {
  isOpen: boolean;
  onClose: () => void;
  isSubscribed: boolean;
  dailyCount: number;
  dailyLimit: number;
  onUpgradeToVip: () => void;
  onResetDailyCount?: () => void;
  userEmail?: string;
}

export default function SubscriptionModal({
  isOpen,
  onClose,
  isSubscribed,
  dailyCount,
  dailyLimit,
  onUpgradeToVip,
  onResetDailyCount,
  userEmail = ""
}: SubscriptionModalProps) {
  const [adminSettings, setAdminSettings] = useState<AdminSettings>(DEFAULT_ADMIN_SETTINGS);
  const [copiedCash, setCopiedCash] = useState(false);

  // Form states
  const [email, setEmail] = useState(userEmail || "");
  const [cashNumber, setCashNumber] = useState("");
  const [notes, setNotes] = useState("");
  const [screenshotUrl, setScreenshotUrl] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [requestSent, setRequestSent] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  // Live status check
  const [isCheckingStatus, setIsCheckingStatus] = useState(false);
  const [statusResult, setStatusResult] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen) {
      getAdminSettings().then(setAdminSettings).catch(console.error);
      if (userEmail && !email) {
        setEmail(userEmail);
      }
    }
  }, [isOpen, userEmail]);

  if (!isOpen) return null;

  const remaining = Math.max(0, dailyLimit - dailyCount);

  const handleCopyCash = () => {
    navigator.clipboard.writeText(adminSettings.cashNumber);
    setCopiedCash(true);
    setTimeout(() => setCopiedCash(false), 2500);
  };

  const handleScreenshotChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 4 * 1024 * 1024) {
      setErrorMessage("حجم الصورة كبير جداً، يرجى اختيار صورة أقل من 4 ميجابايت.");
      return;
    }
    const reader = new FileReader();
    reader.onload = () => {
      setScreenshotUrl(reader.result as string);
    };
    reader.readAsDataURL(file);
  };

  const handleSubmitRequest = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage("");

    const cleanEmail = email.trim().toLowerCase();
    const cleanCash = cashNumber.trim();

    if (!cleanEmail || !cleanEmail.includes("@")) {
      setErrorMessage("يرجى إدخال بريد إلكتروني (جيميل) صحيح لتفعيل الحساب عليه.");
      return;
    }

    if (!cleanCash) {
      setErrorMessage("يرجى إدخال رقم الكاش الذي قمت بالتحويل منه أو رقم العملية.");
      return;
    }

    setIsSubmitting(true);
    try {
      // 1. Save in Firestore subscriptions with screenshot if provided
      await createSubscriptionRequest({
        email: cleanEmail,
        cashNumber: cleanCash,
        whatsappNumber: adminSettings.whatsappNumber,
        amount: adminSettings.priceUsd || 20,
        notes: notes.trim(),
        screenshotUrl: screenshotUrl || "",
      });

      setRequestSent(true);

      // 2. Prepare WhatsApp message & open WhatsApp
      const waNumber = adminSettings.whatsappNumber.replace(/[^0-9]/g, "");
      const messageText = encodeURIComponent(
        `مرحباً، قمت بتحويل اشتراك $${adminSettings.priceUsd || 20} لمنصة بريتكس 360.\n\n` +
        `📧 بريدي الإلكتروني: ${cleanEmail}\n` +
        `📱 رقم المحفظة المحول منها (K): ${cleanCash}\n` +
        (notes ? `📝 ملاحظات: ${notes}\n` : "") +
        (screenshotUrl ? `🖼️ قمت بإرفاق سكرين شوت التحويل في الموقع.\n` : "") +
        `أرجو قبول الطلب وتفعيل باقة VIP. شكراً لك!`
      );

      const waUrl = `https://wa.me/${waNumber}?text=${messageText}`;
      window.open(waUrl, "_blank");

      // Remember email locally for auto-checks
      try {
        localStorage.setItem("rony_user_email", cleanEmail);
      } catch (e) {}

    } catch (err: any) {
      setErrorMessage(err.message || "حدث خطأ أثناء إرسال الطلب، يرجى المحاولة مجدداً.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCheckApprovalNow = async () => {
    const targetEmail = (email || userEmail || localStorage.getItem("rony_user_email") || "").trim().toLowerCase();
    if (!targetEmail) {
      setStatusResult("يرجى كتابة بريدك الإلكتروني للتحقق من حالة اشتراكه.");
      return;
    }

    setIsCheckingStatus(true);
    setStatusResult(null);

    try {
      const isApproved = await checkEmailIsApproved(targetEmail);
      if (isApproved) {
        setStatusResult("مبروك! تم قبول طلبك وتفعيل اشتراك VIP بحسابك بنجاح!");
        onUpgradeToVip();
      } else {
        setStatusResult("الطلب لا يزال قيد المراجعة لدى الأدمن. بمجرد قبوله سيتفعل فوراً!");
      }
    } catch (e) {
      setStatusResult("تعذر التحقق حالياً، يرجى المحاولة بعد قليل.");
    } finally {
      setIsCheckingStatus(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/80 backdrop-blur-md flex items-center justify-center p-3 sm:p-6 animate-fade-in" dir="rtl">
      <div 
        className="bg-white border border-slate-200 rounded-3xl max-w-xl w-full p-6 sm:p-8 space-y-6 shadow-2xl relative overflow-hidden text-slate-800 max-h-[95vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Background glow accents */}
        <div className="absolute -top-24 -right-24 w-60 h-60 bg-amber-200/40 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-24 -left-24 w-60 h-60 bg-indigo-200/40 rounded-full blur-3xl pointer-events-none" />

        {/* Close Button */}
        <button
          type="button"
          onClick={onClose}
          className="absolute top-5 left-5 p-2 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-500 hover:text-slate-800 transition cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Header */}
        <div className="text-center space-y-2 pt-2">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-amber-50 border border-amber-200 text-amber-800 text-xs font-bold shadow-xs">
            <Crown className="w-4 h-4 text-amber-600 animate-bounce" />
            <span>نظام اشتراك باقة المحترفين VIP</span>
          </div>

          <h2 className="text-xl sm:text-2xl font-black text-slate-900">
            {isSubscribed 
              ? "أنت مشترك في باقة VIP غير المحدودة 👑" 
              : "اشتراك باقة المحترفين ($20 دولار)"}
          </h2>

          <p className="text-xs sm:text-sm text-slate-600 max-w-md mx-auto leading-relaxed">
            {isSubscribed
              ? "حسابك مفعّل بالكامل! يمكنك توليد وبرمجة ما تشاء من ألعاب وتطبيقات 3D بدون أي توقف."
              : "لديك تطبيق 1 مجاني في البداية. لتوليد تطبيقات وألعاب ثلاثية أبعاد غير محدودة بأعلى جودة، اشترك في باقة VIP بقيمة 20 دولار."}
          </p>
        </div>

        {/* If Already Subscribed */}
        {isSubscribed ? (
          <div className="p-5 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-900 text-center space-y-3">
            <div className="w-12 h-12 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto">
              <CheckCircle2 className="w-6 h-6" />
            </div>
            <div className="font-black text-base">اشتراكك مفعّل بنجاح لدى الأدمن!</div>
            <p className="text-xs text-emerald-700 leading-relaxed max-w-sm mx-auto">
              حسابك مسجل في قاعدة البيانات ومفعل بشكل دائم. يمكنك الاستمرار في بناء ونشر ألعابك بكل حرية.
            </p>
            <button
              type="button"
              onClick={onClose}
              className="px-6 py-2.5 bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-xs rounded-xl transition cursor-pointer shadow-sm"
            >
              العودة للوحة الألعاب
            </button>
          </div>
        ) : (
          /* Subscription Payment Flow */
          <div className="space-y-5">
            
            {/* Payment Info Card (Cash & WhatsApp) */}
            <div className="p-4 sm:p-5 rounded-2xl bg-gradient-to-br from-indigo-950 via-slate-900 to-indigo-900 text-white shadow-xl space-y-4 border border-indigo-800/60">
              <div className="flex items-center justify-between border-b border-indigo-800/80 pb-3">
                <span className="text-xs font-bold text-indigo-200">طرق الدفع وتفعيل باقة VIP:</span>
                <span className="text-sm font-black text-amber-400 bg-amber-400/10 px-2.5 py-0.5 rounded-lg border border-amber-400/30">
                  ${adminSettings.priceUsd || 20} دولار
                </span>
              </div>

              {/* K: Cash Number with Copy button */}
              <div className="space-y-1.5">
                <div className="text-[11px] text-indigo-300 flex items-center justify-between font-medium">
                  <div className="flex items-center gap-1.5">
                    <span className="px-2 py-0.5 rounded-md bg-amber-400 text-slate-950 font-black text-[11px]">K</span>
                    <span className="font-bold text-white">رقم الكاش (فودافون كاش / Vodafone Cash):</span>
                  </div>
                  <span className="text-[10px] text-amber-300">انسخ وحوّل المبلغ</span>
                </div>
                <div className="flex items-center justify-between bg-black/50 border border-indigo-600/60 rounded-xl p-2.5">
                  <span className="font-mono text-base sm:text-lg font-black text-amber-300 tracking-wider" dir="ltr">
                    {adminSettings.cashNumber}
                  </span>
                  <button
                    type="button"
                    onClick={handleCopyCash}
                    className="px-3 py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg text-xs font-bold flex items-center gap-1.5 transition cursor-pointer"
                  >
                    {copiedCash ? <Check className="w-3.5 h-3.5 text-emerald-300" /> : <Copy className="w-3.5 h-3.5" />}
                    <span>{copiedCash ? "تم النسخ!" : "نسخ الرقم"}</span>
                  </button>
                </div>
              </div>

              {/* W: WhatsApp direct chat button */}
              <div className="pt-2 border-t border-indigo-800/60 space-y-2">
                <div className="text-[11px] text-indigo-300 flex items-center gap-1.5 font-medium">
                  <span className="px-2 py-0.5 rounded-md bg-emerald-500 text-white font-black text-[11px]">W</span>
                  <span className="font-bold text-white">رقم الواتساب (WhatsApp) للدفع والتواصل:</span>
                </div>
                <div className="flex flex-col sm:flex-row items-center justify-between gap-2.5 bg-black/30 p-2.5 rounded-xl border border-emerald-500/30">
                  <div className="text-xs text-emerald-300 font-mono font-bold" dir="ltr">
                    {adminSettings.whatsappNumber}
                  </div>
                  <a
                    href={`https://wa.me/${adminSettings.whatsappNumber.replace(/[^0-9]/g, "")}?text=${encodeURIComponent("مرحباً، أود الاشتراك في باقة VIP على منصة بريتكس 360")}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-full sm:w-auto px-3.5 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-xs font-black flex items-center justify-center gap-1.5 transition shadow-sm cursor-pointer"
                  >
                    <MessageSquare className="w-3.5 h-3.5" />
                    <span>لو مش معاك كاش، اشترك بالواتس مباشرة</span>
                    <ExternalLink className="w-3 h-3" />
                  </a>
                </div>
              </div>
            </div>

            {/* Request Submission Form */}
            {!requestSent ? (
              <form onSubmit={handleSubmitRequest} className="bg-slate-50 p-4 sm:p-5 rounded-2xl border border-slate-200 space-y-3.5">
                <div className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                  <Send className="w-4 h-4 text-indigo-600" />
                  <span>تأكيد التحويل وإرسال السكرين شوت لتفعيل الحساب لدى الأدمن:</span>
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-700 mb-1">
                    بريدك الإلكتروني (Gmail) الذي سيتم تفعيل الـ VIP عليه:
                  </label>
                  <input
                    type="email"
                    placeholder="مثال: yourname@gmail.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-white border border-slate-200 text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 text-left"
                    dir="ltr"
                    required
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-700 mb-1">
                    رقم الكاش أو المحفظة التي قمت بالتحويل منها (K):
                  </label>
                  <input
                    type="text"
                    placeholder="مثال: 01012345678"
                    value={cashNumber}
                    onChange={(e) => setCashNumber(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-white border border-slate-200 text-xs sm:text-sm font-mono focus:outline-none focus:ring-2 focus:ring-indigo-500 text-left"
                    dir="ltr"
                    required
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-700 mb-1">
                    إرفاق سكرين شوت التحويل (Screenshot) لتسريع التفعيل:
                  </label>
                  <div className="flex items-center gap-2">
                    <label className="flex items-center gap-2 px-3 py-2 bg-white hover:bg-slate-100 border border-slate-300 rounded-xl text-xs font-medium text-slate-700 cursor-pointer transition">
                      <span>{screenshotUrl ? "✓ تم اختيار السكرين شوت (انقر للتغيير)" : "اختيار صورة السكرين شوت"}</span>
                      <input type="file" accept="image/*" onChange={handleScreenshotChange} className="hidden" />
                    </label>
                    {screenshotUrl && (
                      <img src={screenshotUrl} alt="Screenshot preview" className="w-10 h-10 object-cover rounded-lg border border-slate-300" />
                    )}
                  </div>
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-700 mb-1">
                    ملاحظات إضافية (اختياري):
                  </label>
                  <input
                    type="text"
                    placeholder="مثال: تم التحويل باسم أحمد..."
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    className="w-full px-3.5 py-2 rounded-xl bg-white border border-slate-200 text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>

                {errorMessage && (
                  <div className="flex items-center gap-1.5 text-xs text-rose-600 font-medium bg-rose-50 p-2.5 rounded-xl border border-rose-200">
                    <AlertCircle className="w-4 h-4 shrink-0" />
                    <span>{errorMessage}</span>
                  </div>
                )}

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full py-3 bg-gradient-to-r from-amber-500 via-indigo-600 to-indigo-700 hover:from-amber-600 hover:to-indigo-800 text-white font-black text-xs sm:text-sm rounded-xl shadow-md transition flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
                >
                  <Crown className={`w-4 h-4 text-amber-200 ${isSubmitting ? "animate-spin" : ""}`} />
                  <span>{isSubmitting ? "جاري إرسال الطلب..." : "إرسال السكرين شوت وتأكيد الاشتراك"}</span>
                </button>
              </form>
            ) : (
              /* Request Sent Confirmation Box */
              <div className="p-5 rounded-2xl bg-amber-50 border border-amber-200 text-amber-900 space-y-3 text-center">
                <div className="w-10 h-10 rounded-full bg-amber-100 text-amber-700 flex items-center justify-center mx-auto">
                  <Check className="w-5 h-5" />
                </div>
                <h4 className="text-sm font-bold">تم إرسال طلب اشتراكك إلى الأدمن بنجاح!</h4>
                <p className="text-xs text-amber-800 leading-relaxed max-w-md mx-auto">
                  طلبك محفوظ في النظام برقم التحويل والبريد <strong className="font-mono">{email}</strong>.
                  بمجرد أن يقوم الأدمن بالنقر على «قبول»، سيتفعل حسابك فوراً.
                </p>

                <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-2">
                  <button
                    type="button"
                    onClick={handleCheckApprovalNow}
                    disabled={isCheckingStatus}
                    className="w-full sm:w-auto px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs rounded-xl flex items-center justify-center gap-1.5 transition cursor-pointer"
                  >
                    <RefreshCw className={`w-3.5 h-3.5 ${isCheckingStatus ? "animate-spin" : ""}`} />
                    <span>فحص حالة تفعيل اشتراكي الآن</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setRequestSent(false)}
                    className="w-full sm:w-auto px-4 py-2 bg-white hover:bg-slate-50 border border-amber-300 text-amber-900 font-medium text-xs rounded-xl transition cursor-pointer"
                  >
                    تعديل البيانات
                  </button>
                </div>

                {statusResult && (
                  <div className="text-xs font-bold pt-2 text-indigo-900">
                    {statusResult}
                  </div>
                )}
              </div>
            )}

            {/* Quick check approval section */}
            {!requestSent && (
              <div className="pt-1 flex items-center justify-between text-xs text-slate-500 border-t border-slate-100">
                <span>هل قمت بالتحويل مسبقاً وتنتظر التفعيل؟</span>
                <button
                  type="button"
                  onClick={handleCheckApprovalNow}
                  className="text-indigo-600 hover:text-indigo-800 font-bold flex items-center gap-1 cursor-pointer"
                >
                  <RefreshCw className={`w-3 h-3 ${isCheckingStatus ? "animate-spin" : ""}`} />
                  <span>فحص حالة حسابي</span>
                </button>
              </div>
            )}

          </div>
        )}
      </div>
    </div>
  );
}
