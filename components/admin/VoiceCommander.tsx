'use client';

import { useState, useEffect } from 'react';
import { Mic, Activity } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

// Define SpeechRecognition types safely for TypeScript
interface SpeechRecognitionEvent extends Event {
    results: {
        [key: number]: {
            [key: number]: {
                transcript: string;
            };
        };
    };
}

interface SpeechRecognition extends EventTarget {
    continuous: boolean;
    interimResults: boolean;
    lang: string;
    onstart: (() => void) | null;
    onresult: ((event: SpeechRecognitionEvent) => void) | null;
    onend: (() => void) | null;
    start: () => void;
    stop: () => void;
}

interface SpeechRecognitionConstructor {
    new (): SpeechRecognition;
}

declare global {
    interface Window {
        webkitSpeechRecognition?: SpeechRecognitionConstructor;
        SpeechRecognition?: SpeechRecognitionConstructor;
    }
}

export default function VoiceCommander() {
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [processing, setProcessing] = useState(false);
  const [response, setResponse] = useState<string | null>(null);

  useEffect(() => {
    if (typeof window !== 'undefined' && !('webkitSpeechRecognition' in window) && !('SpeechRecognition' in window)) {
      console.warn("Speech Recognition not supported in this browser.");
    }
  }, []);

  const toggleListening = () => {
    if (isListening) {
      setIsListening(false);
    } else {
      startListening();
    }
  };

  const startListening = () => {
    const SpeechRecognition = window.webkitSpeechRecognition || window.SpeechRecognition;
    if (!SpeechRecognition) {
        alert("Voice not supported");
        return;
    }

    const recognition = new SpeechRecognition();
    recognition.continuous = false;
    recognition.interimResults = false;
    recognition.lang = 'en-US';

    recognition.onstart = () => {
        setIsListening(true);
        setTranscript('');
        setResponse(null);
    };

    recognition.onresult = (event: SpeechRecognitionEvent) => {
        const text = event.results[0][0].transcript;
        setTranscript(text);
        handleCommand(text);
    };

    recognition.onend = () => {
        setIsListening(false);
    };

    recognition.start();
  };

  const handleCommand = async (text: string) => {
      setProcessing(true);
      try {
          const res = await fetch('/api/ai/commander', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ transcript: text })
          });
          const data = await res.json();
          if (data.speech) {
              setResponse(data.speech);
              // Speak it back
              const utterance = new SpeechSynthesisUtterance(data.speech);
              window.speechSynthesis.speak(utterance);
          }
      } catch (e) {
          console.error(e);
          setResponse("Error processing command.");
      } finally {
          setProcessing(false);
      }
  };

  return (
    <div className="bg-white p-6 rounded-2xl shadow-sm border border-orange-100 relative overflow-hidden">
        <div className="absolute top-0 right-0 p-4 opacity-10">
            <Mic className="w-24 h-24 text-orange-500" />
        </div>

        <h3 className="font-bold text-gray-800 mb-2 flex items-center gap-2">
            <Mic className="w-5 h-5 text-orange-600" /> Magic Commander
        </h3>
        <p className="text-sm text-gray-500 mb-6">&quot;Discount red shoes by 10%&quot;</p>

        <div className="flex flex-col items-center justify-center min-h-[120px]">
            {isListening ? (
                 <motion.div
                    animate={{ scale: [1, 1.2, 1] }}
                    transition={{ repeat: Infinity, duration: 1.5 }}
                    className="w-16 h-16 rounded-full bg-red-100 flex items-center justify-center mb-4"
                 >
                     <Mic className="w-8 h-8 text-red-600" />
                 </motion.div>
            ) : (
                <button
                    onClick={toggleListening}
                    className="w-16 h-16 rounded-full bg-orange-500 hover:bg-orange-600 flex items-center justify-center text-white shadow-lg transition-all mb-4"
                >
                    <Mic className="w-8 h-8" />
                </button>
            )}

            <AnimatePresence>
                {transcript && (
                    <motion.p
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="text-center font-medium text-gray-800 italic"
                    >
                        &quot;{transcript}&quot;
                    </motion.p>
                )}
                {processing && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="flex items-center gap-2 text-xs text-orange-500 mt-2 font-mono"
                    >
                        <Activity className="w-3 h-3 animate-pulse" /> AI PROCESSING...
                    </motion.div>
                )}
                {response && !processing && (
                    <motion.div
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="mt-4 p-3 bg-green-50 text-green-700 text-sm rounded-lg border border-green-200 w-full text-center"
                    >
                        ✅ {response}
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    </div>
  );
}
