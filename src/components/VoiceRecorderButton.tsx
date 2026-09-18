import React, { useState, useEffect, useRef } from "react";
import { Mic, MicOff, Send, X, Volume2, AlertCircle } from "lucide-react";

interface VoiceRecorderButtonProps {
  onSendTranscript?: (spokenText: string) => void;
  onTranscription?: (text: string) => void;
  onInterimUpdate?: (text: string) => void;
  disabled?: boolean;
  size?: "sm" | "md";
  className?: string;
}

export default function VoiceRecorderButton({
  onSendTranscript,
  onTranscription,
  onInterimUpdate,
  disabled = false,
  size = "md",
  className = "",
}: VoiceRecorderButtonProps) {
  const [isRecording, setIsRecording] = useState(false);
  const [transcript, setTranscript] = useState("");
  const [recordingSeconds, setRecordingSeconds] = useState(0);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isSpeechSupported, setIsSpeechSupported] = useState(true);

  const recognitionRef = useRef<any>(null);
  const timerRef = useRef<any>(null);
  const transcriptRef = useRef("");

  useEffect(() => {
    // Check SpeechRecognition support in window
    const SpeechRecognition =
      (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

    if (!SpeechRecognition) {
      setIsSpeechSupported(false);
    }
  }, []);

  // Timer while recording
  useEffect(() => {
    if (isRecording) {
      setRecordingSeconds(0);
      timerRef.current = setInterval(() => {
        setRecordingSeconds((prev) => prev + 1);
      }, 1000);
    } else {
      if (timerRef.current) clearInterval(timerRef.current);
      setRecordingSeconds(0);
    }

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [isRecording]);

  const startRecording = async () => {
    if (disabled) return;
    setErrorMessage(null);
    setTranscript("");
    transcriptRef.current = "";

    const SpeechRecognition =
      (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

    if (!SpeechRecognition) {
      // Fallback: If Web Speech API not supported in browser, prompt user
      const promptText = window.prompt(
        "خاصية التعرف الصوتي المباشر تتطلب متصفحاً يدعم Web Speech API (مثل Chrome أو Edge أو Safari). يمكنك إدخال فكرتك صوتياً عبر الكيبورد الصوتي للمتصفح أو كتابتها هنا مباشرة:"
      );
      if (promptText && promptText.trim()) {
        onSendTranscript(promptText.trim());
      }
      return;
    }

    try {
      // Request mic permission first
      if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
        await navigator.mediaDevices.getUserMedia({ audio: true }).catch(() => {
          // ignore or handle if already granted
        });
      }

      const recognition = new SpeechRecognition();
      recognition.lang = "ar-SA"; // Arabic recognition, widely compatible
      recognition.continuous = true;
      recognition.interimResults = true;
      recognition.maxAlternatives = 1;

      recognition.onstart = () => {
        setIsRecording(true);
      };

      recognition.onresult = (event: any) => {
        let interimText = "";
        let finalText = "";

        for (let i = 0; i < event.results.length; i++) {
          const result = event.results[i];
          if (result.isFinal) {
            finalText += result[0].transcript + " ";
          } else {
            interimText += result[0].transcript;
          }
        }

        const combined = (finalText + interimText).trim();
        if (combined) {
          setTranscript(combined);
          transcriptRef.current = combined;
          onInterimUpdate?.(combined);
        }
      };

      recognition.onerror = (event: any) => {
        console.warn("Speech recognition error:", event.error);
        if (event.error === "not-allowed") {
          setErrorMessage("يرجى السماح بالوصول إلى الميكروفون من إعدادات المتصفح.");
          stopRecording(false);
        } else if (event.error === "no-speech") {
          // just no sound detected yet, keep alive
        } else {
          setErrorMessage(`حدث خطأ في التسجيل: ${event.error}`);
        }
      };

      recognition.onend = () => {
        // If recording is still supposed to be active, don't auto-reset
      };

      recognitionRef.current = recognition;
      recognition.start();
      setIsRecording(true);
    } catch (err: any) {
      console.error("Error starting speech recognition:", err);
      setErrorMessage("تعذر بدء الميكروفون. يرجى التأكد من توصيله والسماح به.");
      setIsRecording(false);
    }
  };

  const stopRecording = (shouldSend: boolean = true) => {
    if (recognitionRef.current) {
      try {
        recognitionRef.current.stop();
      } catch (e) {
        // ignore
      }
      recognitionRef.current = null;
    }

    setIsRecording(false);

    const finalText = transcriptRef.current.trim() || transcript.trim();
    if (shouldSend && finalText) {
      // Send immediately as requested by user ("ويتبعت فجأة")
      onSendTranscript?.(finalText);
      onTranscription?.(finalText);
      setTranscript("");
      transcriptRef.current = "";
    }
  };

  const cancelRecording = () => {
    stopRecording(false);
    setTranscript("");
    transcriptRef.current = "";
    onInterimUpdate?.("");
  };

  // Format seconds into MM:SS
  const formatTime = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${m.toString().padStart(2, "0")}:${s.toString().padStart(2, "0")}`;
  };

  return (
    <div className="relative inline-flex items-center" dir="rtl">
      {/* Floating Active Voice Banner when Recording */}
      {isRecording && (
        <div className="fixed bottom-24 right-4 left-4 sm:left-auto sm:right-10 z-50 bg-slate-900/95 text-white border border-rose-500/50 shadow-2xl rounded-2xl p-4 sm:max-w-md w-full backdrop-blur-md animate-in fade-in slide-in-from-bottom-3 duration-200">
          <div className="flex items-center justify-between mb-2 pb-2 border-b border-white/10">
            <div className="flex items-center gap-2">
              <span className="relative flex h-3 w-3">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-rose-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-3 w-3 bg-rose-500"></span>
              </span>
              <span className="text-xs font-bold text-rose-300">
                جاري تسجيل فكرتك بالصوت ({formatTime(recordingSeconds)})
              </span>
            </div>

            {/* Sound Wave Animation Bars */}
            <div className="flex items-center gap-0.5 h-4">
              <span className="w-1 bg-rose-500 rounded-full animate-[bounce_0.8s_infinite]"></span>
              <span className="w-1 bg-rose-400 rounded-full animate-[bounce_0.6s_infinite_0.1s]"></span>
              <span className="w-1 bg-rose-300 rounded-full animate-[bounce_0.7s_infinite_0.2s]"></span>
              <span className="w-1 bg-rose-500 rounded-full animate-[bounce_0.5s_infinite_0.3s]"></span>
              <span className="w-1 bg-rose-400 rounded-full animate-[bounce_0.9s_infinite_0.15s]"></span>
            </div>
          </div>

          {/* Live transcript bubble */}
          <div className="bg-white/10 rounded-xl p-2.5 min-h-[44px] text-xs text-slate-100 leading-relaxed max-h-24 overflow-y-auto mb-3">
            {transcript ? (
              <span>"{transcript}"</span>
            ) : (
              <span className="text-slate-400 italic">
                تحدث الآن... قل فكرة لعبتك أو تطبيقك وسنقوم بكتابتها وإرسالها فوراً
              </span>
            )}
          </div>

          {/* Actions */}
          <div className="flex items-center justify-between gap-2">
            <button
              type="button"
              onClick={cancelRecording}
              className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-slate-300 text-xs transition"
            >
              <X className="w-3.5 h-3.5" />
              <span>إلغاء</span>
            </button>

            <button
              type="button"
              onClick={() => stopRecording(true)}
              className="flex items-center gap-1.5 px-4 py-1.5 rounded-lg bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs shadow-md transition animate-pulse"
            >
              <Send className="w-3.5 h-3.5" />
              <span>إرسال الفكرة فوراً للذكاء</span>
            </button>
          </div>
        </div>
      )}

      {/* Error alert toast */}
      {errorMessage && (
        <div className="absolute bottom-full mb-2 right-0 bg-red-600 text-white text-[11px] p-2 rounded-xl shadow-lg flex items-center gap-1.5 whitespace-nowrap z-50">
          <AlertCircle className="w-3.5 h-3.5 shrink-0" />
          <span>{errorMessage}</span>
          <button
            type="button"
            onClick={() => setErrorMessage(null)}
            className="text-white hover:text-red-200 ml-1 font-bold"
          >
            ✕
          </button>
        </div>
      )}

      {/* The Microphone Button */}
      <button
        type="button"
        onClick={() => {
          if (isRecording) {
            stopRecording(true);
          } else {
            startRecording();
          }
        }}
        disabled={disabled}
        title={
          isRecording
            ? "اضغط لإيقاف التسجيل وإرسال الفكرة فوراً"
            : "تسجيل فكرتك بالصوت (ريكورد)"
        }
        className={`relative flex items-center justify-center transition-all ${
          size === "sm" ? "p-2 rounded-lg text-xs" : "p-3 rounded-xl text-sm"
        } ${
          isRecording
            ? "bg-rose-600 text-white shadow-lg shadow-rose-500/30 scale-105 ring-4 ring-rose-200"
            : "bg-slate-50 hover:bg-rose-50 border border-slate-200 hover:border-rose-300 text-slate-700 hover:text-rose-600"
        } disabled:opacity-50 ${className}`}
      >
        {isRecording ? (
          <>
            <MicOff className={`${size === "sm" ? "w-3.5 h-3.5" : "w-4 h-4"} animate-pulse`} />
            <span className="sr-only">إيقاف التسجيل وإرسال</span>
          </>
        ) : (
          <>
            <Mic className={`${size === "sm" ? "w-3.5 h-3.5" : "w-4 h-4"} text-rose-500`} />
            <span className="sr-only">تسجيل صوتي</span>
          </>
        )}
      </button>
    </div>
  );
}
