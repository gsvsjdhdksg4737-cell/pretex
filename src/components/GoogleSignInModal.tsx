import React, { useState } from "react";
import { X, Sparkles, Shield, Key, Loader2, Fan } from "lucide-react";
import { loginWithGoogle, UserProfile } from "../firebase";

interface GoogleSignInModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (profile: UserProfile) => void;
}

export default function GoogleSignInModal({
  isOpen,
  onClose,
  onSuccess,
}: GoogleSignInModalProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSignIn = async () => {
    setLoading(true);
    setError(null);
    try {
      const profile = await loginWithGoogle();
      onSuccess(profile);
      onClose();
    } catch (err: any) {
      console.error("Google login failed:", err);
      setError(err.message || "تعذر إكمال تسجيل الدخول عبر Google. يرجى المحاولة ثانية.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 font-sans" dir="rtl">
      <div className="bg-white border border-slate-200 rounded-3xl max-w-md w-full p-6 sm:p-8 text-slate-800 relative shadow-2xl space-y-6 text-center animate-in fade-in zoom-in duration-200">
        <button
          onClick={onClose}
          className="absolute left-4 top-4 p-1.5 text-slate-400 hover:text-slate-700 rounded-lg hover:bg-slate-100 transition cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Logo and Brand */}
        <div className="flex flex-col items-center space-y-3">
          <div className="w-16 h-16 rounded-2xl bg-indigo-50 border border-indigo-100 flex items-center justify-center text-indigo-600 shadow-sm">
            <Fan className="w-9 h-9 text-indigo-600 animate-spin" style={{ animationDuration: "3.5s" }} />
          </div>
          <div>
            <h2 className="text-xl sm:text-2xl font-black text-slate-900">
              تسجيل الدخول في <span className="text-indigo-600">روني ستيكس</span>
            </h2>
            <p className="text-xs sm:text-sm text-slate-500 mt-1">
              احصل على كود حسابك الفريد واربط ألعابك ثلاثية الأبعاد بسحابة فايربيس
            </p>
          </div>
        </div>

        {/* Benefits list */}
        <div className="bg-slate-50 rounded-2xl p-4 border border-slate-200 text-right space-y-2.5 text-xs text-slate-700">
          <div className="flex items-center gap-2.5">
            <div className="w-6 h-6 rounded-lg bg-indigo-100 text-indigo-700 flex items-center justify-center font-bold text-xs shrink-0">
              <Key className="w-3.5 h-3.5" />
            </div>
            <span>
              <strong>كود فريد لكل حساب:</strong> يُخصص لك كود مثل <code className="text-indigo-600 font-mono font-bold">RS-XXXXXX</code> لحفظ هويتك ومشاريعك.
            </span>
          </div>

          <div className="flex items-center gap-2.5">
            <div className="w-6 h-6 rounded-lg bg-emerald-100 text-emerald-700 flex items-center justify-center font-bold text-xs shrink-0">
              <Shield className="w-3.5 h-3.5" />
            </div>
            <span>
              <strong>حفظ ومزامنة سحابية:</strong> ألعابك وأكوادك محفوظة دائماً في حسابك بفايربيس.
            </span>
          </div>

          <div className="flex items-center gap-2.5">
            <div className="w-6 h-6 rounded-lg bg-amber-100 text-amber-700 flex items-center justify-center font-bold text-xs shrink-0">
              <Sparkles className="w-3.5 h-3.5" />
            </div>
            <span>
              <strong>جاهز لنظام الاشتراكات:</strong> تفعيل فوري لترقيات الحساب والمزايا المتقدمة القادمة.
            </span>
          </div>
        </div>

        {error && (
          <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-red-700 text-xs">
            {error}
          </div>
        )}

        {/* Google Sign In Button */}
        <div className="space-y-3">
          <button
            onClick={handleSignIn}
            disabled={loading}
            className="w-full py-3.5 px-4 bg-white hover:bg-slate-50 text-slate-700 border border-slate-300 font-bold rounded-2xl shadow-sm hover:shadow transition flex items-center justify-center gap-3 cursor-pointer disabled:opacity-50"
          >
            {loading ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin text-indigo-600" />
                <span>جاري الاتصال بـ Google...</span>
              </>
            ) : (
              <>
                <svg className="w-5 h-5" viewBox="0 0 24 24">
                  <path
                    fill="#4285F4"
                    d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                  />
                  <path
                    fill="#34A853"
                    d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                  />
                  <path
                    fill="#FBBC05"
                    d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                  />
                  <path
                    fill="#EA4335"
                    d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                  />
                </svg>
                <span className="text-sm">المتابعة باستخدام حساب Google</span>
              </>
            )}
          </button>

          <button
            type="button"
            onClick={onClose}
            className="text-xs text-slate-500 hover:text-slate-800 transition cursor-pointer"
          >
            المتابعة كزائر بدون تسجيل (يمكنك التسجيل في أي وقت)
          </button>
        </div>
      </div>
    </div>
  );
}
