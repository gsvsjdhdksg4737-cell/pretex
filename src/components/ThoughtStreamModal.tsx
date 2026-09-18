import React from "react";
import { Brain, Cpu, Sparkles, CheckCircle2, CircleDashed } from "lucide-react";

interface ThoughtStreamModalProps {
  isOpen: boolean;
  elapsedSeconds: number;
  currentStage: string;
  thoughtSteps: string[];
}

export default function ThoughtStreamModal({
  isOpen,
  elapsedSeconds,
  currentStage,
  thoughtSteps
}: ThoughtStreamModalProps) {
  if (!isOpen) return null;

  return (
    <div className="absolute inset-0 z-40 bg-slate-900/80 backdrop-blur-md flex items-center justify-center p-4 font-sans select-none" dir="rtl">
      <div className="bg-white border border-slate-200 rounded-3xl max-w-xl w-full p-6 text-slate-800 shadow-2xl space-y-5 animate-in fade-in zoom-in-95 duration-200">
        
        {/* Header with animated thinking icon */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-100">
          <div className="flex items-center gap-3">
            <div className="relative">
              <div className="w-12 h-12 rounded-2xl bg-indigo-50 border border-indigo-200 flex items-center justify-center text-indigo-600 shadow-inner">
                <Brain className="w-6 h-6 animate-pulse" />
              </div>
              <span className="absolute -top-1 -right-1 w-3.5 h-3.5 bg-emerald-500 border-2 border-white rounded-full"></span>
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-bold text-slate-900">
                  الذكاء الاصطناعي يفكر ويحلل فكرتك
                </h3>
                <span className="px-2 py-0.5 rounded-full bg-indigo-50 border border-indigo-200 text-indigo-700 text-[10px] font-bold">
                  تفكير عميق
                </span>
              </div>
              <p className="text-xs text-slate-500">
                يقوم بتحليل المتطلبات، توزيع الإضاءة، وهندسة الكود ثلاثي الأبعاد
              </p>
            </div>
          </div>

          <div className="text-left">
            <span className="text-xs font-mono font-bold px-2.5 py-1 rounded-xl bg-slate-100 text-slate-700 border border-slate-200">
              {elapsedSeconds} ثانية
            </span>
          </div>
        </div>

        {/* Current Live Stage Bar */}
        <div className="bg-indigo-50/70 border border-indigo-100 rounded-2xl p-3.5 space-y-2">
          <div className="flex items-center justify-between text-xs">
            <span className="font-bold text-indigo-900 flex items-center gap-1.5">
              <Cpu className="w-4 h-4 text-indigo-600 animate-spin" />
              المرحلة الحالية:
            </span>
            <span className="text-[11px] font-bold text-indigo-700 font-mono">
              {Math.min(95, elapsedSeconds * 8)}%
            </span>
          </div>

          <p className="text-xs font-semibold text-indigo-800 leading-relaxed">
            {currentStage}
          </p>

          <div className="w-full h-2 bg-indigo-100 rounded-full overflow-hidden">
            <div 
              className="h-full bg-gradient-to-r from-indigo-500 to-sky-500 rounded-full transition-all duration-300"
              style={{ width: `${Math.min(95, elapsedSeconds * 8)}%` }}
            />
          </div>
        </div>

        {/* Real-time Thought Chain Breakdown */}
        <div className="space-y-2">
          <span className="text-xs font-bold text-slate-700 block">
            مسار التفكير الهندسي (Chain of Thought):
          </span>

          <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
            {thoughtSteps.map((step, idx) => (
              <div 
                key={idx}
                className="flex items-start gap-2.5 p-2.5 rounded-xl bg-slate-50 border border-slate-200/80 text-xs leading-relaxed"
              >
                <div className="mt-0.5 shrink-0 text-emerald-600">
                  <CheckCircle2 className="w-4 h-4" />
                </div>
                <div className="flex-1">
                  <span className="font-semibold text-slate-800">{step}</span>
                </div>
              </div>
            ))}

            <div className="flex items-start gap-2.5 p-2.5 rounded-xl bg-indigo-50/40 border border-indigo-200/60 text-xs text-indigo-900 leading-relaxed animate-pulse">
              <div className="mt-0.5 shrink-0 text-indigo-600">
                <CircleDashed className="w-4 h-4 animate-spin" />
              </div>
              <div className="flex-1">
                <span className="font-semibold">جاري التوليد وكتابة الكود البرمجي الكامل وضبط أجهزة التحكم والفيزياء...</span>
              </div>
            </div>
          </div>
        </div>

        {/* Footnote */}
        <div className="pt-2 border-t border-slate-100 text-center">
          <p className="text-[11px] text-slate-400">
            يتم بناء المشهد كاملاً في كود نقي واحد باستخدام Three.js و WebGL بدون أي وسائط مفقودة
          </p>
        </div>

      </div>
    </div>
  );
}
