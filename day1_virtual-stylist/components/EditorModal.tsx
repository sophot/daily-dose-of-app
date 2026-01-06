import React, { useState } from 'react';
import { X, Wand2, Loader2, Download } from 'lucide-react';
import { editImageWithPrompt } from '../services/geminiService';

interface EditorModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialImage: string;
  title?: string;
}

const EditorModal: React.FC<EditorModalProps> = ({ isOpen, onClose, initialImage, title = "AI Studio Editor" }) => {
  const [currentImage, setCurrentImage] = useState(initialImage);
  const [prompt, setPrompt] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Reset state when modal opens with a new image
  React.useEffect(() => {
    setCurrentImage(initialImage);
    setPrompt('');
    setError(null);
  }, [initialImage, isOpen]);

  if (!isOpen) return null;

  const handleEdit = async () => {
    if (!prompt.trim()) return;
    setIsProcessing(true);
    setError(null);

    try {
      const newImage = await editImageWithPrompt(currentImage, prompt);
      setCurrentImage(newImage);
      setPrompt(''); // Clear prompt after successful edit
    } catch (err) {
      setError("Failed to edit image. Please try a different prompt.");
    } finally {
      setIsProcessing(false);
    }
  };

  const handleDownload = () => {
    const link = document.createElement('a');
    link.href = currentImage;
    link.download = `edited-style-${Date.now()}.jpg`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
      <div className="bg-white rounded-2xl w-full max-w-4xl overflow-hidden shadow-2xl flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="p-4 border-b border-stone-200 flex justify-between items-center bg-stone-50">
          <div className="flex items-center gap-2">
            <Wand2 className="w-5 h-5 text-purple-600" />
            <h3 className="font-serif text-lg font-semibold text-stone-800">{title}</h3>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-stone-200 rounded-full transition-colors">
            <X className="w-5 h-5 text-stone-600" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6 bg-stone-100 flex flex-col items-center justify-center">
           <div className="relative w-full max-w-2xl aspect-[4/3] bg-white shadow-sm rounded-lg overflow-hidden flex items-center justify-center border border-stone-200">
             <img 
               src={currentImage} 
               alt="Editing canvas" 
               className="max-w-full max-h-full object-contain"
             />
             {isProcessing && (
               <div className="absolute inset-0 bg-white/60 flex items-center justify-center backdrop-blur-[2px]">
                 <div className="text-center">
                   <Loader2 className="w-10 h-10 text-purple-600 animate-spin mx-auto mb-2" />
                   <p className="text-stone-800 font-medium">Applying magic...</p>
                 </div>
               </div>
             )}
           </div>
           {error && (
             <p className="mt-4 text-red-500 text-sm bg-red-50 px-4 py-2 rounded-lg border border-red-100">{error}</p>
           )}
        </div>

        {/* Controls */}
        <div className="p-6 bg-white border-t border-stone-200">
          <div className="flex flex-col sm:flex-row gap-4 items-stretch">
            <div className="flex-1 relative">
              <input
                type="text"
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleEdit()}
                placeholder="Describe your edit (e.g., 'Add a vintage filter', 'Change background to marble')"
                className="w-full pl-4 pr-12 py-3 rounded-xl border border-stone-300 focus:border-purple-500 focus:ring-2 focus:ring-purple-200 outline-none transition-all"
                disabled={isProcessing}
              />
              <div className="absolute right-2 top-1/2 -translate-y-1/2">
                <button 
                  onClick={handleEdit}
                  disabled={!prompt.trim() || isProcessing}
                  className="p-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  <Wand2 className="w-4 h-4" />
                </button>
              </div>
            </div>
            
            <button
              onClick={handleDownload}
              className="flex items-center justify-center gap-2 px-6 py-3 bg-stone-900 text-white rounded-xl hover:bg-stone-800 transition-colors font-medium"
            >
              <Download className="w-4 h-4" />
              <span>Save</span>
            </button>
          </div>
          <p className="mt-2 text-xs text-stone-500 text-center sm:text-left">
            Describe the change you want to see.
          </p>
        </div>
      </div>
    </div>
  );
};

export default EditorModal;