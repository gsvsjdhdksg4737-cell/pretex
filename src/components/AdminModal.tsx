import React, { useState, useEffect } from "react";
import { 
  X, 
  ShieldCheck, 
  Crown, 
  Check, 
  AlertCircle, 
  RefreshCw, 
  Trash2, 
  Plus, 
  Phone, 
  MessageSquare, 
  DollarSign, 
  Save, 
  UserCheck, 
  Clock, 
  ExternalLink,
  Search
} from "lucide-react";
import { 
  getAllSubscriptionRequests, 
  approveSubscriptionRequest, 
  rejectSubscriptionRequest, 
  getAllApprovedEmails, 
  manuallyApproveEmail, 
  revokeApprovedEmail, 
  getAdminSettings, 
  saveAdminSettings,
  SubscriptionRequest,
  ApprovedEmail,
  AdminSettings,
  DEFAULT_ADMIN_SETTINGS
} from "../firebase";

interface AdminModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentUserEmail?: string;
  onSubscriptionApprovedLocally?: (email: string) => void;
}

export default function AdminModal({
  isOpen,
  onClose,
  currentUserEmail,
  onSubscriptionApprovedLocally
}: AdminModalProps) {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [adminPassword, setAdminPassword] = useState("");
  const [authError, setAuthError] = useState("");

  const [activeTab, setActiveTab] = useState<"requests" | "emails" | "settings">("requests");
  const [requests, setRequests] = useState<SubscriptionRequest[]>([]);
  const [approvedEmails, setApprovedEmails] = useState<ApprovedEmail[]>([]);
  const [settings, setSettings] = useState<AdminSettings>(DEFAULT_ADMIN_SETTINGS);
  const [isLoading, setIsLoading] = useState(false);

  // Manual Add Email state
  const [newEmail, setNewEmail] = useState("");
  const [manualAddSuccess, setManualAddSuccess] = useState("");

  // Settings Feedback
  const [settingsSaved, setSettingsSaved] = useState(false);

  // Filter search
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    if (isOpen) {
      // Auto-authenticate if email matches admin email
      if (currentUserEmail?.toLowerCase() === "al6332047@gmail.com") {
        setIsAuthenticated(true);
      }
      loadAdminData();
    }
  }, [isOpen, currentUserEmail]);

  const loadAdminData = async () => {
    setIsLoading(true);
    try {
      const [reqs, emails, sett] = await Promise.all([
        getAllSubscriptionRequests(),
        getAllApprovedEmails(),
        getAdminSettings()
      ]);
      setRequests(reqs);
      setApprovedEmails(emails);
      setSettings(sett);
    } catch (err) {
      console.error("Error loading admin data:", err);
    } finally {
      setIsLoading(false);
    }
  };

  if (!isOpen) return null;

  const handlePasswordLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError("");
    // Allow either the admin email or the universal passkey
    if (
      adminPassword === "admin2026" || 
      adminPassword === "rony2026" || 
      adminPassword === "2026" ||
      currentUserEmail?.toLowerCase() === "al6332047@gmail.com"
    ) {
      setIsAuthenticated(true);
      loadAdminData();
    } else {
      setAuthError("كلمة مرور الأدمن غير صحيحة. يرجى التحقق وإعادة المحاولة.");
    }
  };

  const handleApproveRequest = async (req: SubscriptionRequest) => {
    try {
      await approveSubscriptionRequest(req.id, req.email, currentUserEmail || "al6332047@gmail.com");
      if (onSubscriptionApprovedLocally) {
        onSubscriptionApprovedLocally(req.email);
      }
      await loadAdminData();
    } catch (e) {
      alert("حدث خطأ أثناء قبول الطلب");
    }
  };

  const handleRejectRequest = async (reqId: string) => {
    if (!confirm("هل أنت متأكد من رفض هذا الطلب؟")) return;
    try {
      await rejectSubscriptionRequest(reqId);
      await loadAdminData();
    } catch (e) {
      alert("حدث خطأ أثناء الرفض");
    }
  };

  const handleAddManualEmail = async (e: React.FormEvent) => {
    e.preventDefault();
    const clean = newEmail.trim().toLowerCase();
    if (!clean || !clean.includes("@")) {
      alert("يرجى إدخال بريد جيميل صالح");
      return;
    }
    try {
      await manuallyApproveEmail(clean, currentUserEmail || "al6332047@gmail.com");
      setManualAddSuccess(`تم تفعيل اشتراك VIP بنجاح للبريد: ${clean}`);
      setNewEmail("");
      if (onSubscriptionApprovedLocally) {
        onSubscriptionApprovedLocally(clean);
      }
      await loadAdminData();
      setTimeout(() => setManualAddSuccess(""), 4000);
    } catch (e) {
      alert("حدث خطأ أثناء إضافة البريد");
    }
  };

  const handleRevokeEmail = async (email: string) => {
    if (!confirm(`هل تريد إلغاء اشتراك البريد: ${email}؟`)) return;
    try {
      await revokeApprovedEmail(email);
      await loadAdminData();
    } catch (e) {
      alert("حدث خطأ أثناء إلغاء الاشتراك");
    }
  };

  const handleSaveSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await saveAdminSettings(settings);
      setSettingsSaved(true);
      setTimeout(() => setSettingsSaved(false), 3000);
    } catch (e) {
      alert("حدث خطأ أثناء حفظ الإعدادات");
    }
  };

  const filteredRequests = requests.filter(r => 
    r.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
    r.cashNumber.includes(searchQuery) ||
    r.displayName?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/80 backdrop-blur-md flex items-center justify-center p-3 sm:p-6 animate-fade-in" dir="rtl">
      <div 
        className="bg-white border border-slate-200 rounded-3xl max-w-4xl w-full h-[90vh] flex flex-col shadow-2xl relative overflow-hidden text-slate-800"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Top Header */}
        <div className="p-5 border-b border-slate-200 bg-slate-50/80 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-indigo-600 text-white flex items-center justify-center shadow-md shadow-indigo-600/20">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base sm:text-lg font-black text-slate-900">لوحة تحكم الأدمن والاشتراكات</h2>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-amber-100 text-amber-800 font-bold border border-amber-200">
                  al6332047@gmail.com
                </span>
              </div>
              <p className="text-xs text-slate-500">
                مراجعة طلبات الـ 20$، تفعيل الاشتراكات الفورية، وتعديل أرقام الكاش والواتساب
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={loadAdminData}
              disabled={isLoading}
              className="p-2 rounded-xl bg-white border border-slate-200 text-slate-600 hover:text-indigo-600 transition shadow-2xs cursor-pointer"
              title="تحديث البيانات"
            >
              <RefreshCw className={`w-4 h-4 ${isLoading ? "animate-spin" : ""}`} />
            </button>

            <button
              type="button"
              onClick={onClose}
              className="p-2 rounded-xl bg-white border border-slate-200 text-slate-500 hover:text-slate-900 transition shadow-2xs cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Content Area */}
        {!isAuthenticated ? (
          /* Password Authentication screen */
          <div className="flex-1 flex items-center justify-center p-6 text-center">
            <div className="max-w-md w-full p-8 rounded-3xl bg-slate-50 border border-slate-200/90 shadow-sm space-y-5">
              <div className="w-14 h-14 rounded-2xl bg-indigo-100 text-indigo-700 flex items-center justify-center mx-auto">
                <Crown className="w-7 h-7" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-slate-900">تسجيل دخول مسؤول النظام (الأدمن)</h3>
                <p className="text-xs text-slate-500 mt-1">
                  أدخل كلمة مرور الأدمن للمتابعة وإدارة الاشتراكات وقبول طلبات التحويل
                </p>
              </div>

              <form onSubmit={handlePasswordLogin} className="space-y-3">
                <input
                  type="password"
                  placeholder="أدخل كلمة المرور السرية..."
                  value={adminPassword}
                  onChange={(e) => setAdminPassword(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl bg-white border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 text-center font-mono"
                  autoFocus
                />
                <button
                  type="submit"
                  className="w-full py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs sm:text-sm rounded-xl transition shadow-md cursor-pointer"
                >
                  دخول لوحة التحكم
                </button>
              </form>

              {authError && (
                <div className="flex items-center justify-center gap-1 text-xs text-rose-600 font-medium">
                  <AlertCircle className="w-4 h-4" />
                  <span>{authError}</span>
                </div>
              )}

              <div className="text-[11px] text-slate-400">
                بريد الأدمن المصرح له: <span className="font-mono text-slate-600">al6332047@gmail.com</span>
              </div>
            </div>
          </div>
        ) : (
          /* Authenticated Admin Management Tabs */
          <div className="flex-1 flex flex-col min-h-0">
            {/* Tabs Navigation */}
            <div className="flex items-center gap-2 px-6 pt-4 border-b border-slate-200 bg-white">
              <button
                type="button"
                onClick={() => setActiveTab("requests")}
                className={`pb-3 px-3 text-xs font-bold border-b-2 transition flex items-center gap-1.5 cursor-pointer ${
                  activeTab === "requests"
                    ? "border-indigo-600 text-indigo-600"
                    : "border-transparent text-slate-500 hover:text-slate-900"
                }`}
              >
                <Clock className="w-3.5 h-3.5" />
                <span>طلبات التحويل الواردة</span>
                <span className="px-1.5 py-0.2 rounded-full bg-slate-100 text-slate-700 text-[10px]">
                  {requests.length}
                </span>
              </button>

              <button
                type="button"
                onClick={() => setActiveTab("emails")}
                className={`pb-3 px-3 text-xs font-bold border-b-2 transition flex items-center gap-1.5 cursor-pointer ${
                  activeTab === "emails"
                    ? "border-indigo-600 text-indigo-600"
                    : "border-transparent text-slate-500 hover:text-slate-900"
                }`}
              >
                <UserCheck className="w-3.5 h-3.5" />
                <span>إضافة وتفعيل الجيميل يدوياً</span>
                <span className="px-1.5 py-0.2 rounded-full bg-slate-100 text-slate-700 text-[10px]">
                  {approvedEmails.filter(e => e.active).length}
                </span>
              </button>

              <button
                type="button"
                onClick={() => setActiveTab("settings")}
                className={`pb-3 px-3 text-xs font-bold border-b-2 transition flex items-center gap-1.5 cursor-pointer ${
                  activeTab === "settings"
                    ? "border-indigo-600 text-indigo-600"
                    : "border-transparent text-slate-500 hover:text-slate-900"
                }`}
              >
                <DollarSign className="w-3.5 h-3.5" />
                <span>إعدادات الكاش والواتساب والـ 20$</span>
              </button>
            </div>

            {/* Tab Body */}
            <div className="flex-1 overflow-y-auto p-4 sm:p-6 bg-slate-50/50">
              
              {/* TAB 1: Requests */}
              {activeTab === "requests" && (
                <div className="space-y-4">
                  {/* Search Bar & Summary */}
                  <div className="flex flex-col sm:flex-row items-center justify-between gap-3 bg-white p-3 rounded-2xl border border-slate-200">
                    <div className="relative w-full sm:w-80">
                      <Search className="w-4 h-4 text-slate-400 absolute right-3 top-3" />
                      <input
                        type="text"
                        placeholder="بحث بالإيميل أو رقم الكاش..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full pr-9 pl-3 py-2 text-xs rounded-xl bg-slate-50 border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                      />
                    </div>
                    <div className="text-xs text-slate-500 flex items-center gap-2">
                      <span>إجمالي الطلبات: <strong className="text-slate-900">{requests.length}</strong></span>
                      <span>•</span>
                      <span className="text-amber-600 font-bold">معلق: {requests.filter(r => r.status === "pending").length}</span>
                      <span>•</span>
                      <span className="text-emerald-600 font-bold">مقبول: {requests.filter(r => r.status === "approved").length}</span>
                    </div>
                  </div>

                  {/* Requests Table */}
                  {filteredRequests.length === 0 ? (
                    <div className="text-center py-16 bg-white rounded-2xl border border-slate-200 p-8 space-y-3">
                      <Clock className="w-10 h-10 text-slate-300 mx-auto" />
                      <h4 className="text-sm font-bold text-slate-700">لا توجد طلبات اشتراك حالياً</h4>
                      <p className="text-xs text-slate-500 max-w-sm mx-auto">
                        عندما يقوم أي مستخدم بتحويل 20 دولار وإرسال إيميله ورقم الكاش، سيظهر طلبه هنا فوراً للموافقة عليه بنقرة واحدة!
                      </p>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {filteredRequests.map((req) => {
                        const isPending = req.status === "pending";
                        const isApproved = req.status === "approved";
                        const isRejected = req.status === "rejected";

                        return (
                          <div 
                            key={req.id} 
                            className={`p-4 rounded-2xl border transition bg-white flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-2xs ${
                              isPending ? "border-amber-200 bg-amber-50/20" : isApproved ? "border-emerald-200" : "border-slate-200 opacity-60"
                            }`}
                          >
                            <div className="space-y-1">
                              <div className="flex items-center gap-2">
                                <span className="text-xs sm:text-sm font-black text-slate-900">{req.email}</span>
                                <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold ${
                                  isPending ? "bg-amber-100 text-amber-800 border border-amber-200" : isApproved ? "bg-emerald-100 text-emerald-800 border border-emerald-200" : "bg-rose-100 text-rose-800 border border-rose-200"
                                }`}>
                                  {isPending ? "⏳ قيد المراجعة" : isApproved ? "✅ تم القبول والتفعيل" : "❌ مرفوض"}
                                </span>
                                <span className="text-xs font-extrabold text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded-md border border-indigo-100">
                                  ${req.amount || 20}
                                </span>
                              </div>

                              <div className="flex flex-wrap items-center gap-3 text-xs text-slate-600 pt-1">
                                <span><strong className="text-amber-700 bg-amber-100 px-1.5 py-0.5 rounded text-[10px] ml-1">K</strong>رقم الكاش المحول: <strong className="font-mono text-slate-800">{req.cashNumber}</strong></span>
                                {req.whatsappNumber && (
                                  <span><strong className="text-emerald-700 bg-emerald-100 px-1.5 py-0.5 rounded text-[10px] ml-1">W</strong>واتساب: <strong className="font-mono text-slate-800">{req.whatsappNumber}</strong></span>
                                )}
                                <span>📅 التاريخ: {new Date(req.createdAt).toLocaleDateString("ar-EG", { month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" })}</span>
                              </div>

                              {req.screenshotUrl && (
                                <div className="mt-2 flex items-center gap-2">
                                  <span className="text-[11px] font-bold text-indigo-700">🖼️ سكرين شوت التحويل:</span>
                                  <a 
                                    href={req.screenshotUrl} 
                                    target="_blank" 
                                    rel="noopener noreferrer"
                                    className="inline-block relative group"
                                  >
                                    <img 
                                      src={req.screenshotUrl} 
                                      alt="إيصال التحويل" 
                                      className="w-14 h-14 object-cover rounded-lg border-2 border-indigo-400 group-hover:opacity-90 shadow-sm" 
                                    />
                                    <span className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center text-white text-[9px] font-bold rounded-lg transition">
                                      تكبير
                                    </span>
                                  </a>
                                </div>
                              )}

                              {req.notes && (
                                <p className="text-[11px] text-slate-500 bg-slate-50 p-2 rounded-lg border border-slate-200/80 mt-1">
                                  ملاحظة المستخدم: {req.notes}
                                </p>
                              )}
                            </div>

                            {/* Actions */}
                            <div className="flex items-center gap-2 shrink-0">
                              {req.whatsappNumber && (
                                <a
                                  href={`https://wa.me/${req.whatsappNumber.replace(/[^0-9]/g, "")}`}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="p-2 rounded-xl bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border border-emerald-200 text-xs font-bold transition flex items-center gap-1 cursor-pointer"
                                  title="مراسلة على واتساب"
                                >
                                  <MessageSquare className="w-3.5 h-3.5" />
                                  <span className="hidden md:inline">محادثة</span>
                                </a>
                              )}

                              {isPending && (
                                <>
                                  <button
                                    type="button"
                                    onClick={() => handleApproveRequest(req)}
                                    className="px-3.5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-black transition flex items-center gap-1.5 shadow-sm cursor-pointer"
                                  >
                                    <Check className="w-3.5 h-3.5" />
                                    <span>قبول وتفعيل فوري</span>
                                  </button>

                                  <button
                                    type="button"
                                    onClick={() => handleRejectRequest(req.id)}
                                    className="px-2.5 py-2 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 text-xs font-bold transition cursor-pointer"
                                  >
                                    رفض
                                  </button>
                                </>
                              )}

                              {isApproved && (
                                <span className="text-xs font-bold text-emerald-700 bg-emerald-50 px-3 py-1.5 rounded-xl border border-emerald-200 flex items-center gap-1">
                                  <Check className="w-3.5 h-3.5" />
                                  <span>مفعّل دائم</span>
                                </span>
                              )}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              )}

              {/* TAB 2: Manual Email Whitelist */}
              {activeTab === "emails" && (
                <div className="space-y-6">
                  {/* Add Email Form */}
                  <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs space-y-4">
                    <div className="flex items-center gap-2 text-slate-900 font-bold text-sm">
                      <Plus className="w-4 h-4 text-indigo-600" />
                      <span>تفعيل اشتراك VIP فوري لأي بريد جيميل مباشرة:</span>
                    </div>

                    <form onSubmit={handleAddManualEmail} className="flex flex-col sm:flex-row items-center gap-2">
                      <input
                        type="email"
                        placeholder="اكتب بريد الجيميل هنا (مثال: user@gmail.com)..."
                        value={newEmail}
                        onChange={(e) => setNewEmail(e.target.value)}
                        className="flex-1 w-full px-4 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                        required
                      />
                      <button
                        type="submit"
                        className="w-full sm:w-auto px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-xl transition shadow-xs flex items-center justify-center gap-1.5 cursor-pointer shrink-0"
                      >
                        <Crown className="w-3.5 h-3.5 text-amber-300" />
                        <span>تفعيل اشتراك فوري للجيميل</span>
                      </button>
                    </form>

                    {manualAddSuccess && (
                      <div className="flex items-center gap-1.5 text-xs text-emerald-700 font-bold bg-emerald-50 p-2.5 rounded-xl border border-emerald-200">
                        <Check className="w-4 h-4 text-emerald-600" />
                        <span>{manualAddSuccess}</span>
                      </div>
                    )}
                  </div>

                  {/* List of Approved Emails */}
                  <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs space-y-3">
                    <div className="flex items-center justify-between">
                      <h4 className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
                        <UserCheck className="w-4 h-4 text-emerald-600" />
                        <span>قائمة الحسابات المفعلة والمصرح لها بـ VIP:</span>
                      </h4>
                      <span className="text-[11px] text-slate-500">
                        {approvedEmails.filter(e => e.active).length} حساب مفعل
                      </span>
                    </div>

                    <div className="divide-y divide-slate-100">
                      {approvedEmails.length === 0 ? (
                        <div className="text-center py-8 text-xs text-slate-400">
                          لم يتم تفعيل أي بريد إلكتروني يدوي حتى الآن
                        </div>
                      ) : (
                        approvedEmails.map((item) => (
                          <div key={item.email} className="py-2.5 flex items-center justify-between text-xs">
                            <div className="flex items-center gap-2">
                              <span className="w-2 h-2 rounded-full bg-emerald-500" />
                              <span className="font-bold text-slate-800">{item.email}</span>
                              <span className="text-[10px] text-slate-400">
                                (منذ {new Date(item.approvedAt).toLocaleDateString("ar-EG")})
                              </span>
                            </div>

                            <button
                              type="button"
                              onClick={() => handleRevokeEmail(item.email)}
                              className="text-[11px] text-rose-600 hover:text-rose-800 font-medium flex items-center gap-1 cursor-pointer"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                              <span>إلغاء الاشتراك</span>
                            </button>
                          </div>
                        ))
                      )}
                    </div>
                  </div>
                </div>
              )}

              {/* TAB 3: Settings */}
              {activeTab === "settings" && (
                <div className="max-w-xl mx-auto bg-white p-6 rounded-3xl border border-slate-200 shadow-2xs space-y-5">
                  <div>
                    <h3 className="text-sm font-bold text-slate-900">إعدادات أرقام الكاش والدفع</h3>
                    <p className="text-xs text-slate-500 mt-0.5">
                      الأرقام التي تظهر للمستخدمين عند طلب الاشتراك والتحويل
                    </p>
                  </div>

                  <form onSubmit={handleSaveSettings} className="space-y-4">
                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">
                        رقم الكاش (فودافون كاش / إنستاباي / أورنج):
                      </label>
                      <div className="relative">
                        <Phone className="w-4 h-4 text-slate-400 absolute right-3 top-3" />
                        <input
                          type="text"
                          value={settings.cashNumber}
                          onChange={(e) => setSettings({ ...settings, cashNumber: e.target.value })}
                          className="w-full pr-9 pl-3 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs sm:text-sm font-mono focus:outline-none focus:ring-2 focus:ring-indigo-500 text-left"
                          dir="ltr"
                          placeholder="010XXXXXXXX"
                          required
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">
                        رقم الواتساب للتأكيد واستلام الإيصال (مع كود الدولة):
                      </label>
                      <div className="relative">
                        <MessageSquare className="w-4 h-4 text-slate-400 absolute right-3 top-3" />
                        <input
                          type="text"
                          value={settings.whatsappNumber}
                          onChange={(e) => setSettings({ ...settings, whatsappNumber: e.target.value })}
                          className="w-full pr-9 pl-3 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs sm:text-sm font-mono focus:outline-none focus:ring-2 focus:ring-indigo-500 text-left"
                          dir="ltr"
                          placeholder="2010XXXXXXXX"
                          required
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">
                        قيمة الاشتراك بالدولار الأمريكي (USD):
                      </label>
                      <div className="relative">
                        <DollarSign className="w-4 h-4 text-slate-400 absolute right-3 top-3" />
                        <input
                          type="number"
                          value={settings.priceUsd}
                          onChange={(e) => setSettings({ ...settings, priceUsd: Number(e.target.value) || 20 })}
                          className="w-full pr-9 pl-3 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs sm:text-sm font-mono focus:outline-none focus:ring-2 focus:ring-indigo-500 text-left"
                          dir="ltr"
                          required
                        />
                      </div>
                    </div>

                    <button
                      type="submit"
                      className="w-full py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs sm:text-sm rounded-xl transition shadow-md flex items-center justify-center gap-1.5 cursor-pointer"
                    >
                      <Save className="w-4 h-4" />
                      <span>حفظ وتحديث الإعدادات في السحابة</span>
                    </button>
                  </form>

                  {settingsSaved && (
                    <div className="flex items-center justify-center gap-1.5 text-xs text-emerald-700 font-bold bg-emerald-50 p-2.5 rounded-xl border border-emerald-200">
                      <Check className="w-4 h-4 text-emerald-600" />
                      <span>تم حفظ إعدادات الدفع وتحديثها لجميع المستخدمين بنجاح!</span>
                    </div>
                  )}
                </div>
              )}

            </div>
          </div>
        )}
      </div>
    </div>
  );
}
