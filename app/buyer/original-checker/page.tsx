"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Camera, Upload, CheckCircle2, AlertCircle, RefreshCcw, Loader2, Info, ChevronRight } from "lucide-react";
import toast from "react-hot-toast";

type Category = "shoes" | "bags" | "outerwear" | "accessories";

interface Requirement {
  id: string;
  label: string;
  desc: string;
}

const REQUIREMENTS: Record<Category, Requirement[]> = {
  shoes: [
    { id: "tag", label: "Size Tag", desc: "Inner tongue or side tag" },
    { id: "right", label: "Right Side", desc: "Full profile of the right shoe" },
    { id: "left", label: "Left Side", desc: "Full profile of the left shoe" },
    { id: "sole", label: "Outer Sole", desc: "Bottom tread and branding" },
  ],
  bags: [
    { id: "logo", label: "Logo/Stamp", desc: "Main branding or heat stamp" },
    { id: "hardware", label: "Hardware", desc: "Zippers, buckles or chains" },
    { id: "stitching", label: "Stitching", desc: "Close-up of a corner or seam" },
    { id: "lining", label: "Inner Lining", desc: "Interior fabric and pockets" },
  ],
  outerwear: [
    { id: "wash_tag", label: "Wash Tag", desc: "Internal care instructions" },
    { id: "neck_tag", label: "Neck Label", desc: "Main brand label at neck" },
    { id: "zipper", label: "Zipper/Buttons", desc: "Branding on fasteners" },
  ],
  accessories: [
    { id: "engraving", label: "Engraving", desc: "Serial numbers or hallmarks" },
    { id: "box", label: "Packaging", desc: "Authenticity cards or box" },
  ],
};

export default function OriginalCheckerPage() {
  const [step, setStep] = useState<"category" | "upload" | "analyzing" | "result">("category");
  const [category, setCategory] = useState<Category | null>(null);
  const [uploads, setUploads] = useState<Record<string, string>>({});
  const [analyzing, setAnalyzing] = useState(false);
  const [result, setResult] = useState<{ score: number; status: "authentic" | "replica" | "uncertain"; feedback: string } | null>(null);

  const handleCategorySelect = (cat: Category) => {
    setCategory(cat);
    setStep("upload");
  };

  const handleFileChange = (id: string, e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Mock URL for preview
      const url = URL.createObjectURL(file);
      setUploads(prev => ({ ...prev, [id]: url }));
    }
  };

  const startAnalysis = () => {
    const reqs = REQUIREMENTS[category!];
    if (Object.keys(uploads).length < reqs.length) {
      toast.error("Please upload all required photos");
      return;
    }

    setStep("analyzing");
    setAnalyzing(true);

    // Mock AI Analysis
    setTimeout(() => {
      setAnalyzing(false);
      setStep("result");
      // Random mock result
      const random = Math.random();
      if (random > 0.4) {
        setResult({
          score: 98,
          status: "authentic",
          feedback: "All verified points (stitching, fonts, and materials) match the authentic database for this model."
        });
      } else if (random > 0.15) {
        setResult({
          score: 42,
          status: "replica",
          feedback: "The font spacing on the tags and the stitching density deviate from authentic manufacturing standards."
        });
      } else {
        setResult({
          score: 65,
          status: "uncertain",
          feedback: "Images are slightly blurry. We cannot confirm authenticity with 100% certainty. Please retake photos in better lighting."
        });
      }
    }, 4000);
  };

  const reset = () => {
    setStep("category");
    setCategory(null);
    setUploads({});
    setResult(null);
  };

  return (
    <div className="pt-16 lg:pt-20 min-h-screen bg-stone-50 pb-24">
      <div className="section-container py-12 max-w-4xl">
        <div className="mb-10 text-center">
          <span className="text-[10px] tracking-[0.3em] uppercase font-bold text-warm-600 block mb-2">Reloop Authenticate</span>
          <h1 className="font-display text-4xl md:text-5xl text-stone-900 font-light tracking-tight">Original Checker</h1>
          <p className="text-stone-500 text-sm mt-3 max-w-md mx-auto">Our AI-powered system analyzes every detail to verify your premium pieces.</p>
        </div>

        <div className="bg-white border border-stone-100 shadow-elegant p-6 md:p-10 min-h-[500px] flex flex-col">
          
          {/* Step 1: Category Selection */}
          {step === "category" && (
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="flex-1 flex flex-col">
              <h2 className="text-sm font-bold uppercase tracking-widest text-stone-400 mb-8 text-center">What are we checking?</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 max-w-2xl mx-auto w-full">
                {(Object.keys(REQUIREMENTS) as Category[]).map((cat) => (
                  <button
                    key={cat}
                    onClick={() => handleCategorySelect(cat)}
                    className="group p-6 border border-stone-100 hover:border-stone-900 transition-all text-left flex items-center justify-between bg-stone-50/30 hover:bg-white"
                  >
                    <div>
                      <p className="text-lg font-display text-stone-800 capitalize">{cat}</p>
                      <p className="text-xs text-stone-400 mt-1">{REQUIREMENTS[cat].length} required photos</p>
                    </div>
                    <ChevronRight className="w-5 h-5 text-stone-200 group-hover:text-stone-900 transition-colors" />
                  </button>
                ))}
              </div>
              <div className="mt-auto pt-10 flex items-center gap-3 justify-center text-stone-400">
                <Info className="w-4 h-4" />
                <p className="text-[10px] uppercase tracking-widest">Powered by Reloop Vision™ AI</p>
              </div>
            </motion.div>
          )}

          {/* Step 2: Uploads */}
          {step === "upload" && category && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex-1 flex flex-col">
              <div className="flex items-center justify-between mb-8">
                <button onClick={() => setStep("category")} className="text-xs font-bold uppercase tracking-widest text-stone-400 hover:text-stone-900">← Back</button>
                <p className="text-xs font-bold uppercase tracking-widest text-stone-800">Category: {category}</p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                {REQUIREMENTS[category].map((req) => (
                  <div key={req.id} className="space-y-2">
                    <p className="text-[10px] font-bold uppercase tracking-widest text-stone-500">{req.label}</p>
                    <label className={`relative block aspect-video border-2 border-dashed transition-all cursor-pointer overflow-hidden ${
                      uploads[req.id] ? "border-stone-900" : "border-stone-200 hover:border-stone-400"
                    }`}>
                      <input type="file" className="hidden" onChange={(e) => handleFileChange(req.id, e)} accept="image/*" />
                      {uploads[req.id] ? (
                        <img src={uploads[req.id]} alt={req.label} className="w-full h-full object-cover" />
                      ) : (
                        <div className="absolute inset-0 flex flex-col items-center justify-center text-stone-400">
                          <Camera className="w-6 h-6 mb-2" />
                          <p className="text-[10px] font-medium uppercase tracking-tighter">{req.desc}</p>
                        </div>
                      )}
                    </label>
                  </div>
                ))}
              </div>

              <button
                onClick={startAnalysis}
                className="mt-12 bg-stone-900 text-white w-full py-4 text-xs font-bold uppercase tracking-[0.2em] hover:bg-stone-800 transition-colors shadow-lg"
              >
                Start AI Verification
              </button>
            </motion.div>
          )}

          {/* Step 3: Analyzing */}
          {step === "analyzing" && (
            <div className="flex-1 flex flex-col items-center justify-center text-center">
              <div className="relative mb-8">
                <div className="w-24 h-24 rounded-full border border-stone-100 flex items-center justify-center">
                   <Loader2 className="w-10 h-10 text-stone-900 animate-spin" />
                </div>
                <motion.div 
                  animate={{ scale: [1, 1.2, 1], opacity: [0.3, 0.6, 0.3] }}
                  transition={{ duration: 2, repeat: Infinity }}
                  className="absolute inset-0 bg-stone-900/5 rounded-full"
                />
              </div>
              <h2 className="font-display text-2xl text-stone-800 mb-2">Analyzing Detail...</h2>
              <p className="text-stone-400 text-sm tracking-widest uppercase animate-pulse">Scanning micro-stitches and font-alignment</p>
            </div>
          )}

          {/* Step 4: Result */}
          {step === "result" && result && (
            <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="flex-1 flex flex-col items-center justify-center text-center">
              <div className={`w-20 h-20 rounded-full flex items-center justify-center mb-6 ${
                result.status === 'authentic' ? 'bg-sage-100 text-sage-600' : result.status === 'replica' ? 'bg-warm-100 text-warm-600' : 'bg-stone-100 text-stone-400'
              }`}>
                {result.status === 'authentic' ? <CheckCircle2 className="w-10 h-10" /> : <AlertCircle className="w-10 h-10" />}
              </div>
              
              <h2 className="font-display text-4xl text-stone-900 mb-2">
                {result.status === 'authentic' ? 'Authentic' : result.status === 'replica' ? 'Replica' : 'Uncertain'}
              </h2>
              <div className="flex items-center gap-2 mb-6">
                 <div className="h-1 w-32 bg-stone-100 rounded-full overflow-hidden">
                    <motion.div 
                      initial={{ width: 0 }} animate={{ width: `${result.score}%` }}
                      className={`h-full ${result.status === 'authentic' ? 'bg-sage-500' : 'bg-warm-500'}`} 
                    />
                 </div>
                 <span className="text-xs font-bold text-stone-400">{result.score}% Confidence</span>
              </div>

              <div className="bg-stone-50 p-6 border border-stone-100 max-w-md mb-8">
                <p className="text-sm text-stone-600 leading-relaxed italic">"{result.feedback}"</p>
              </div>

              <div className="flex gap-4 w-full max-w-sm">
                <button onClick={reset} className="flex-1 border border-stone-200 py-3 text-[10px] font-bold uppercase tracking-widest hover:border-stone-900 transition-colors flex items-center justify-center gap-2">
                  <RefreshCcw className="w-3 h-3" /> Check Another
                </button>
                <button onClick={() => window.print()} className="flex-1 bg-stone-900 text-white py-3 text-[10px] font-bold uppercase tracking-widest hover:bg-stone-800 transition-colors shadow-md">
                  Download Certificate
                </button>
              </div>
            </motion.div>
          )}

        </div>
      </div>
    </div>
  );
}
