'use client';

import { useState } from 'react';
import { Camera, Search, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useRouter } from 'next/navigation';

export default function VisualSearch() {
  const [isOpen, setIsOpen] = useState(false);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const router = useRouter();

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onloadend = () => {
      setImagePreview(reader.result as string);
    };
    reader.readAsDataURL(file);

    setIsAnalyzing(true);

    // Convert file to base64 for server action
    const formData = new FormData();
    formData.append('image', file);

    try {
        // We will implement the actual search call in the page that uses this or here.
        // For "Snap to Shop", typically we upload -> analyze -> redirect to results.
        // Let's assume we pass the base64 string to a search page via query param or store it.
        // A better approach is to upload to storage + analyze, but for this demo,
        // we might handle it in the parent or a separate action.

        // For simplicity, let's just emit the event or redirect.
        // But wait, the prompt says "User uploads photo -> Gemini Vision identifies -> Search vector DB".
        // I should probably do this via a Server Action called inside this component or passed to it.

        // Let's create a server action `searchByImage` in `lib/actions/search.ts`.
        // I can't import server action directly here if it's not set up yet.
        // I will just prepare the UI and handle the logic in the action call.

        // Let's simulate for now or wait for the action.
        // I'll assume `searchByImage` exists and returns a redirect URL or results.

        // For now, I'll redirect to a results page with the image data (or ID if uploaded).
        // Since I don't have full upload infra setup in this step,
        // I will POST to an API route or Server Action.
    } catch (error) {
        console.error("Visual search failed", error);
    } finally {
        setIsAnalyzing(false);
    }
  };

  return (
    <>
      <button
        onClick={() => setIsOpen(true)}
        className="p-2 text-gray-600 hover:text-primary transition-colors"
      >
        <Camera className="w-6 h-6" />
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4"
          >
            <div className="bg-white rounded-2xl w-full max-w-md overflow-hidden shadow-2xl">
              <div className="p-4 border-b flex justify-between items-center bg-gradient-to-r from-orange-500 to-red-500 text-white">
                <h3 className="font-bold text-lg flex items-center gap-2">
                  <Camera className="w-5 h-5" /> Snap to Shop
                </h3>
                <button onClick={() => setIsOpen(false)} className="hover:bg-white/20 rounded-full p-1">
                  <X className="w-6 h-6" />
                </button>
              </div>

              <div className="p-6 flex flex-col items-center gap-6">
                 {!imagePreview ? (
                    <label className="flex flex-col items-center justify-center w-full h-64 border-2 border-dashed border-gray-300 rounded-xl cursor-pointer hover:bg-gray-50 hover:border-orange-400 transition-all">
                        <div className="flex flex-col items-center justify-center pt-5 pb-6">
                            <Camera className="w-12 h-12 text-gray-400 mb-3" />
                            <p className="mb-2 text-sm text-gray-500"><span className="font-semibold">Click to upload</span> or drag and drop</p>
                            <p className="text-xs text-gray-500">PNG, JPG, WEBP (MAX. 5MB)</p>
                        </div>
                        <input type="file" className="hidden" accept="image/*" onChange={handleFileChange} />
                    </label>
                 ) : (
                    <div className="relative w-full aspect-square rounded-lg overflow-hidden border">
                        <img src={imagePreview} alt="Preview" className="w-full h-full object-cover" />
                        {isAnalyzing && (
                            <div className="absolute inset-0 bg-black/50 flex items-center justify-center flex-col text-white">
                                <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-white mb-2"></div>
                                <p className="text-sm font-medium animate-pulse">Gemini is analyzing...</p>
                            </div>
                        )}
                    </div>
                 )}

                 {imagePreview && !isAnalyzing && (
                    <button
                        onClick={() => {
                            // Trigger search
                            const form = document.getElementById('visual-search-form') as HTMLFormElement;
                            form?.requestSubmit();
                        }}
                        className="w-full bg-gradient-to-r from-orange-500 to-red-500 text-white py-3 rounded-xl font-bold hover:shadow-lg hover:scale-[1.02] transition-all"
                    >
                        Search for this Look
                    </button>
                 )}

                 {/* Hidden form to handle server action */}
                 {imagePreview && (
                     <form id="visual-search-form" action="/search/visual" method="POST" className="hidden">
                        <input type="hidden" name="imageBase64" value={imagePreview} />
                     </form>
                 )}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
