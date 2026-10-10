import React, { useState, useCallback, useRef, useEffect } from 'react';
import { motion } from 'framer-motion';
import { ArrowRight, AlertCircle, Zap, FileText } from 'lucide-react';

interface InputFormProps {
  onAnalyze: (text: string) => void;
  error: string | null;
  isLoading: boolean;
}

const InputForm: React.FC<InputFormProps> = ({ onAnalyze, error, isLoading }) => {
  const [text, setText] = useState('');
  const [isLocked, setIsLocked] = useState(false);
  
  // Ref to track the last submission time to prevent double-clicks
  const lastSubmitTime = useRef<number>(0);

  // Debounce lock release when loading finishes
  useEffect(() => {
    if (!isLoading && isLocked) {
      const timer = setTimeout(() => setIsLocked(false), 500); // 500ms safety lock
      return () => clearTimeout(timer);
    }
  }, [isLoading, isLocked]);

  const handleSubmit = useCallback((e: React.FormEvent) => {
    e.preventDefault();
    
    const now = Date.now();
    const isDoubleClick = now - lastSubmitTime.current < 1000; // 1s cooldown

    if (text.trim().length < 10 || isLoading || isLocked || isDoubleClick) {
      return;
    }

    lastSubmitTime.current = now;
    setIsLocked(true);
    onAnalyze(text.trim());
  }, [text, isLoading, isLocked, onAnalyze]);

  const charCount = text.length;
  const isReady = text.trim().length >= 10 && !isLocked && !isLoading;

  return (
    <div className="w-full max-w-2xl mx-auto space-y-6">
      <motion.form
        onSubmit={handleSubmit}
        className={`input-vivid-wrapper rounded-[1.4rem] p-1.5 relative ${
          isLocked ? 'opacity-80' : ''
        }`}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ type: 'spring', stiffness: 300, damping: 20 }}
      >
        {/* Inner content area */}
        <div className="rounded-[1.1rem] overflow-hidden bg-black/20">
          {/* Header bar */}
          <div className="flex items-center gap-2 px-6 pt-4 pb-2">
            <FileText className="w-3.5 h-3.5 text-zinc-600" />
            <span className="text-[10px] font-bold tracking-widest uppercase text-zinc-500">
              Check a Claim or Article
            </span>
          </div>

            <textarea
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder="Paste an article, social post, or specific claim to verify..."
            className="input-vivid-textarea w-full h-40 bg-transparent border-none focus:ring-0 px-6 pb-2 text-[15px] font-medium resize-none leading-relaxed relative z-10 outline-none"
            disabled={isLocked || isLoading}
          />

          {/* Bottom bar */}
          <div className="flex items-center justify-between px-6 py-3 border-t border-white/[0.06] bg-black/30">
            <div className="flex items-center gap-3">
              <span className={`text-[10px] font-bold tracking-widest uppercase ${charCount >= 10 ? 'text-zinc-500' : 'text-zinc-700'}`}>
                {charCount} characters
              </span>
              {charCount > 0 && charCount < 10 && (
                <span className="text-[9px] text-amber-500/70 font-bold uppercase tracking-wider">
                  Min 10 required
                </span>
              )}
            </div>
            <motion.button
              type="submit"
              disabled={!isReady}
              className={`px-6 py-2.5 rounded-xl font-bold flex items-center gap-2.5 transition-all ${
                !isReady
                  ? 'bg-zinc-900/80 text-zinc-700 cursor-not-allowed border border-white/[0.04]'
                  : 'bg-gradient-to-r from-indigo-500 to-cyan-500 text-white shadow-lg shadow-indigo-500/20 hover:shadow-indigo-500/40 hover:shadow-xl'
              }`}
              whileHover={isReady ? { scale: 1.04, y: -1 } : {}}
              whileTap={isReady ? { scale: 0.97 } : {}}
            >
              <Zap className="w-3.5 h-3.5" />
              <span className="text-[10px] uppercase tracking-widest font-bold">
                {isLocked || isLoading ? "Processing..." : "Analyze"}
              </span>
              {isReady && <ArrowRight className="w-3.5 h-3.5" />}
            </motion.button>
          </div>
        </div>
      </motion.form>

      {error && (
        <motion.div
          initial={{ opacity: 0, y: -5 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center gap-2 justify-center text-rose-500 text-[10px] font-bold uppercase tracking-widest bg-rose-500/10 px-4 py-3 rounded-xl border border-rose-500/20"
        >
          <AlertCircle className="w-4 h-4" />
          {error}
        </motion.div>
      )}
    </div>
  );
};

export default InputForm;
