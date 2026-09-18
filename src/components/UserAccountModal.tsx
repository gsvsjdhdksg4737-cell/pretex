import React, { useState, useEffect } from "react";
import { 
  X, 
  User, 
  Copy, 
  Check, 
  LogOut, 
  Sparkles, 
  ShieldCheck, 
  FolderKanban, 
  Play, 
  ExternalLink,
  Crown
} from "lucide-react";
import { UserProfile, UserProject, getUserProjects, logoutUser } from "../firebase";

interface UserAccountModalProps {
  userProfile: UserProfile;
  isOpen: boolean;
  onClose: () => void;
  onSelectProject: (project: UserProject) => void;
  onLogout: () => void;
}

export default function UserAccountModal({
  userProfile,
  isOpen,
  onClose,
  onSelectProject,
  onLogout,
}: UserAccountModalProps) {
  const [copied, setCopied] = useState(false);
  const [projects, setProjects] = useState<UserProject[]>([]);
  const [loadingProjects, setLoadingProjects] = useState(false);

  useEffect(() => {
    if (isOpen && userProfile?.uid) {
      setLoadingProjects(true);
      getUserProjects(userProfile.uid)
        .then((data) => setProjects(data))
        .catch((err) => console.error("Error loading user projects:", err))
        .finally(() => setLoadingProjects(false));
    }
  }, [isOpen, userProfile]);

  if (!isOpen) return null;

  const handleCopyCode = () => {
    navigator.clipboard.writeText(userProfile.accountCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  const handleSignOut = async () => {
    try {
      await logoutUser();
      onLogout();
      onClose();
    } catch (e) {
      console.error("Sign out error:", e);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 font-sans" dir="rtl">
      <div className="bg-white border border-slate-200 rounded-2xl max-w-lg w-full p-6 text-slate-800 relative shadow-2xl space-y-6 max-h-[90vh] overflow-y-auto">
        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute left-4 top-4 p-1.5 text-slate-400 hover:text-slate-700 rounded-lg hover:bg-slate-100 transition cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>

        {/* User Profile Header */}
        <div className="flex items-center gap-3.5">
          {userProfile.photoURL ? (
            <img
              src={userProfile.photoURL}
              alt={userProfile.displayName}
              className="w-14 h-14 rounded-2xl object-cover border-2 border-indigo-500 shadow-sm"
            />
          ) : (
            <div className="w-14 h-14 rounded-2xl bg-indigo-50 border border-indigo-200 text-indigo-600 flex items-center justify-center font-bold text-xl">
              <User className="w-7 h-7" />
            </div>
          )}

          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-base font-extrabold text-slate-900">{userProfile.displayName}</h2>
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-indigo-50 border border-indigo-200 text-indigo-700 text-[10px] font-bold">
                <ShieldCheck className="w-3 h-3 text-indigo-600" />
                حساب موثق
              </span>
            </div>
            <p className="text-xs text-slate-500 font-mono" dir="ltr">{userProfile.email}</p>
          </div>
        </div>

        {/* Unique Account Code Card (عشان كل حساب يبقى ليه كود لوحده) */}
        <div className="p-4 rounded-xl bg-gradient-to-r from-indigo-50 via-slate-50 to-purple-50 border border-indigo-100 space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
              <Sparkles className="w-4 h-4 text-indigo-600" />
              كود الحساب الفريد (Account Code):
            </span>
            <span className="text-[11px] font-semibold text-indigo-600 bg-white px-2 py-0.5 rounded-md border border-indigo-100">
              خاص بك فقط
            </span>
          </div>

          <div className="flex items-center justify-between bg-white border border-indigo-200/80 rounded-xl px-4 py-2.5 shadow-xs">
            <span className="font-mono text-lg font-black text-indigo-700 tracking-wider">
              {userProfile.accountCode}
            </span>
            <button
              onClick={handleCopyCode}
              className="flex items-center gap-1 px-3 py-1.5 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 text-xs font-bold rounded-lg transition cursor-pointer"
            >
              {copied ? (
                <>
                  <Check className="w-3.5 h-3.5 text-emerald-600" />
                  <span className="text-emerald-700">تم النسخ</span>
                </>
              ) : (
                <>
                  <Copy className="w-3.5 h-3.5" />
                  <span>نسخ الكود</span>
                </>
              )}
            </button>
          </div>

          <p className="text-[11px] text-slate-500 leading-relaxed">
            يُربط هذا الكود بحسابك في قاعدة بيانات فايربيس (Firebase)، ويُستخدم لربط مشاريعك وتفعيل الاشتراكات القادمة.
          </p>
        </div>

        {/* Subscription Plan Status Card */}
        <div className="flex items-center justify-between p-3.5 rounded-xl border border-slate-200 bg-slate-50 text-xs">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-lg bg-amber-50 border border-amber-200 text-amber-600">
              <Crown className="w-4 h-4" />
            </div>
            <div>
              <div className="font-bold text-slate-800">حالة الاشتراك: {userProfile.subscriptionPlan || "مجاني"}</div>
              <div className="text-[11px] text-slate-500">مستعد لربط باقات واشتراكات روني ستيكس القادمة</div>
            </div>
          </div>
          <span className="text-[11px] font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2 py-1 rounded-lg">
            نشط
          </span>
        </div>

        {/* User Saved Projects in Firebase */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
              <FolderKanban className="w-4 h-4 text-indigo-600" />
              ألعابي ومشاريعي السحابية ({projects.length})
            </h3>
          </div>

          {loadingProjects ? (
            <div className="py-6 text-center text-xs text-slate-500">جاري تحميل ألعابك...</div>
          ) : projects.length === 0 ? (
            <div className="p-4 rounded-xl border border-dashed border-slate-200 text-center text-xs text-slate-500 space-y-1">
              <p className="font-semibold text-slate-700">لا توجد مشاريع محفوظة بعد</p>
              <p className="text-[11px]">عند إنشاء أو تعديل أي لعبة سيتم ربطها تلقائياً بكود حسابك {userProfile.accountCode}</p>
            </div>
          ) : (
            <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
              {projects.map((proj) => (
                <div
                  key={proj.id}
                  className="flex items-center justify-between p-3 rounded-xl border border-slate-200 hover:border-indigo-300 hover:bg-indigo-50/30 transition text-xs group"
                >
                  <div className="min-w-0 flex-1 pr-2">
                    <p className="font-bold text-slate-900 truncate">{proj.title}</p>
                    <p className="text-[10px] text-slate-400">
                      {new Date(proj.createdAt).toLocaleDateString("ar-EG")}
                    </p>
                  </div>
                  <button
                    onClick={() => {
                      onSelectProject(proj);
                      onClose();
                    }}
                    className="flex items-center gap-1 px-3 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-lg text-xs transition cursor-pointer shrink-0 shadow-xs"
                  >
                    <Play className="w-3 h-3 fill-current" />
                    <span>تشغيل</span>
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Logout Button */}
        <div className="pt-2 border-t border-slate-200 flex justify-between items-center">
          <button
            onClick={handleSignOut}
            className="flex items-center gap-1.5 px-3 py-2 text-red-600 hover:bg-red-50 rounded-xl text-xs font-bold transition cursor-pointer"
          >
            <LogOut className="w-4 h-4" />
            <span>تسجيل الخروج</span>
          </button>
          <button
            onClick={onClose}
            className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold transition cursor-pointer"
          >
            إغلاق
          </button>
        </div>
      </div>
    </div>
  );
}
