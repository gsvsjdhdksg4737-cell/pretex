import React, { useState } from "react";
import { Copy, Check, Download, Play, Edit3, Code2, Sparkles } from "lucide-react";

interface CodeViewerProps {
  code: string;
  isGenerating: boolean;
  generationStage: string;
  onRunCode: (updatedCode: string) => void;
}

export default function CodeViewer({
  code,
  isGenerating,
  generationStage,
  onRunCode,
}: CodeViewerProps) {
  const [copied, setCopied] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editableCode, setEditableCode] = useState(code);

  const handleCopy = () => {
    navigator.clipboard.writeText(isEditing ? editableCode : code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownload = () => {
    const blob = new Blob([isEditing ? editableCode : code], { type: "text/html" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "3D_App_Game.html";
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleApplyEdits = () => {
    onRunCode(editableCode);
    setIsEditing(false);
  };

  // Fast token-based HTML/JS syntax highlighter
  const highlightCode = (raw: string) => {
    const lines = raw.split("\n");
    return lines.map((line, idx) => {
      // Escape HTML
      let formatted = line
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;");

      // Strings
      formatted = formatted.replace(
        /(&quot;.*?&quot;|&#39;.*?&#39;|`.*?`|"(?:\\"|[^"])*"|'(?:\\'|[^'])*')/g,
        '<span class="text-emerald-400">$1</span>'
      );

      // Comments
      formatted = formatted.replace(
        /(\/\/.*$|\/\*[\s\S]*?\*\/|&lt;!--[\s\S]*?--&gt;)/g,
        '<span class="text-gray-500 italic">$1</span>'
      );

      // HTML Tags & standard syntax
      formatted = formatted.replace(
        /(&lt;\/?)([a-zA-Z0-9\-]+)(.*?)(&gt;)/g,
        '<span class="text-gray-400">$1</span><span class="text-pink-400 font-semibold">$2</span>$3<span class="text-gray-400">$4</span>'
      );

      // Keywords
      formatted = formatted.replace(
        /\b(const|let|var|function|return|if|else|for|while|new|this|async|await|class|import|from|export|default|switch|case|break)\b/g,
        '<span class="text-purple-400 font-semibold">$1</span>'
      );

      // Three.js and standard classes
      formatted = formatted.replace(
        /\b(THREE|Scene|PerspectiveCamera|WebGLRenderer|BoxGeometry|SphereGeometry|CylinderGeometry|PlaneGeometry|MeshStandardMaterial|MeshBasicMaterial|Mesh|DirectionalLight|AmbientLight|PointLight|Vector3|Vector2|Color|FogExp2|Raycaster|AudioContext|BufferGeometry)\b/g,
        '<span class="text-amber-300 font-medium">$1</span>'
      );

      // Builtin methods & functions
      formatted = formatted.replace(
        /\b(add|position|rotation|scale|set|requestAnimationFrame|addEventListener|getElementById|querySelector|play|init|render)\b/g,
        '<span class="text-sky-400">$1</span>'
      );

      // Numbers & Booleans
      formatted = formatted.replace(
        /\b(\d+(\.\d+)?|true|false|null|undefined)\b/g,
        '<span class="text-yellow-400 font-mono">$1</span>'
      );

      return (
        <div key={idx} className="table-row hover:bg-white/[0.03] transition-colors leading-relaxed">
          <span className="table-cell pr-4 pl-2 text-right text-gray-600 select-none font-mono text-[11px] border-r border-gray-800/80">
            {idx + 1}
          </span>
          <span
            className="table-cell pl-4 pr-2 font-mono text-[12px] whitespace-pre text-gray-200"
            dangerouslySetInnerHTML={{ __html: formatted }}
          />
        </div>
      );
    });
  };

  return (
    <div className="w-full h-full flex flex-col bg-slate-950 text-slate-100 font-sans select-text">
      {/* Top Code Toolbar */}
      <div className="flex items-center justify-between px-4 py-2.5 bg-slate-900 border-b border-slate-800 shrink-0">
        <div className="flex items-center gap-2">
          <Code2 className="w-4 h-4 text-indigo-400" />
          <span className="text-xs font-semibold text-slate-200">
            كود التطبيق واللعبة الكامل (HTML / Three.js / WebGL)
          </span>
          <span className="text-[10px] px-2 py-0.5 rounded-md bg-slate-800 text-slate-400 font-mono">
            {code.split("\n").length} سطر برمجي
          </span>
        </div>

        <div className="flex items-center gap-1.5">
          {isEditing ? (
            <>
              <button
                onClick={handleApplyEdits}
                className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold transition shadow"
              >
                <Play className="w-3.5 h-3.5 fill-current" />
                <span>تشغيل التعديلات فوراً</span>
              </button>
              <button
                onClick={() => {
                  setEditableCode(code);
                  setIsEditing(false);
                }}
                className="px-2.5 py-1.5 rounded-lg bg-gray-800 hover:bg-gray-700 text-gray-300 text-xs transition"
              >
                إلغاء
              </button>
            </>
          ) : (
            <button
              onClick={() => {
                setEditableCode(code);
                setIsEditing(true);
              }}
              className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-gray-800 hover:bg-gray-700 text-gray-300 text-xs transition"
              title="تعديل الكود يدوياً"
            >
              <Edit3 className="w-3.5 h-3.5" />
              <span>تعديل يدوي</span>
            </button>
          )}

          <button
            onClick={handleCopy}
            className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-gray-800 hover:bg-gray-700 text-gray-300 text-xs transition"
          >
            {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
            <span>{copied ? "تم النسخ" : "نسخ الكود"}</span>
          </button>

          <button
            onClick={handleDownload}
            className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-gray-800 hover:bg-gray-700 text-gray-300 text-xs transition"
          >
            <Download className="w-3.5 h-3.5" />
            <span>تحميل HTML</span>
          </button>
        </div>
      </div>

      {/* Generation Status Banner if working */}
      {isGenerating && (
        <div className="bg-gradient-to-r from-amber-950/80 via-orange-950/60 to-gray-900 border-b border-amber-600/30 px-4 py-2.5 flex items-center justify-between animate-pulse">
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-amber-400 animate-spin" />
            <span className="text-xs font-bold text-amber-300">
              {generationStage || "جاري كتابة الأكواد البرمجية وهندسة البيئة ثلاثية الأبعاد..."}
            </span>
          </div>
          <span className="text-[11px] text-amber-400/80 font-mono">الذكاء الاصطناعي يقوم بالبناء الدقيق...</span>
        </div>
      )}

      {/* Main Code Body */}
      <div className="flex-1 overflow-auto p-4 bg-gray-950">
        {isEditing ? (
          <textarea
            value={editableCode}
            onChange={(e) => setEditableCode(e.target.value)}
            className="w-full h-full bg-gray-900/90 text-gray-100 font-mono text-xs p-4 rounded-xl border border-gray-700 focus:outline-none focus:ring-2 focus:ring-amber-500 resize-none leading-relaxed"
            dir="ltr"
            spellCheck={false}
          />
        ) : (
          <div className="table w-full select-text" dir="ltr">
            {highlightCode(code)}
            {isGenerating && (
              <div className="table-row">
                <span className="table-cell pr-4 pl-2 text-right text-gray-600 font-mono text-[11px] border-r border-gray-800/80">
                  {code.split("\n").length + 1}
                </span>
                <span className="table-cell pl-4 pr-2 font-mono text-[12px] text-emerald-400">
                  <span className="animate-pulse">|</span>
                </span>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
