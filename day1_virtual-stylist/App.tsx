import React, { useState, useRef } from 'react';
import { Upload, Camera, Sparkles, AlertCircle, Wand2, X } from 'lucide-react';
import { AnalysisResult, OutfitStyle, GeneratedOutfitVisuals, OutfitPlan, VisualType } from './types';
import { analyzeClothingItem, generateOutfitVisual } from './services/geminiService';
import OutfitDisplay from './components/OutfitDisplay';
import EditorModal from './components/EditorModal';

const initialVisualState = { url: null, loading: false };
const initialGeneratedImages: Record<OutfitStyle, GeneratedOutfitVisuals> = {
  [OutfitStyle.Casual]: { style: OutfitStyle.Casual, flatLay: initialVisualState, onModel: initialVisualState },
  [OutfitStyle.Business]: { style: OutfitStyle.Business, flatLay: initialVisualState, onModel: initialVisualState },
  [OutfitStyle.NightOut]: { style: OutfitStyle.NightOut, flatLay: initialVisualState, onModel: initialVisualState },
};

const App: React.FC = () => {
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysis, setAnalysis] = useState<AnalysisResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  
  // Image Generation State
  const [generatedImages, setGeneratedImages] = useState<Record<OutfitStyle, GeneratedOutfitVisuals>>(initialGeneratedImages);

  // Modal State
  const [isEditorOpen, setIsEditorOpen] = useState(false);
  const [imageToEdit, setImageToEdit] = useState<string>('');

  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const selectedFile = e.target.files[0];
      setFile(selectedFile);
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreview(reader.result as string);
        setAnalysis(null); // Reset analysis
        setGeneratedImages(initialGeneratedImages); // Reset images
      };
      reader.readAsDataURL(selectedFile);
    }
  };

  const startAnalysis = async () => {
    if (!preview) return;
    setIsAnalyzing(true);
    setError(null);

    try {
      const result = await analyzeClothingItem(preview);
      setAnalysis(result);
    } catch (err) {
      console.error(err);
      setError("We couldn't analyze that image. Please try another clearer photo.");
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleGenerateImage = async (style: OutfitStyle, plan: OutfitPlan, type: VisualType) => {
    if (!preview) return;

    // Set loading for specific type
    setGeneratedImages(prev => ({
      ...prev,
      [style]: {
        ...prev[style],
        [type === 'flat-lay' ? 'flatLay' : 'onModel']: { url: null, loading: true, error: undefined }
      }
    }));

    try {
      const imageUrl = await generateOutfitVisual(preview, plan.description, style, type);
      setGeneratedImages(prev => ({
        ...prev,
        [style]: {
          ...prev[style],
          [type === 'flat-lay' ? 'flatLay' : 'onModel']: { url: imageUrl, loading: false }
        }
      }));
    } catch (err) {
      setGeneratedImages(prev => ({
        ...prev,
        [style]: {
          ...prev[style],
          [type === 'flat-lay' ? 'flatLay' : 'onModel']: { url: null, loading: false, error: "Failed to generate image" }
        }
      }));
    }
  };

  const openEditor = (imageUrl: string) => {
    setImageToEdit(imageUrl);
    setIsEditorOpen(true);
  };

  return (
    <div className="min-h-screen bg-stone-50 flex flex-col text-stone-900 font-sans">
      {/* Header */}
      <header className="bg-white border-b border-stone-200 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Sparkles className="w-6 h-6 text-purple-600" />
            <h1 className="text-xl font-serif font-bold tracking-tight">ChicMinds <span className="text-stone-400 font-sans font-normal text-sm ml-1">Virtual Stylist</span></h1>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full">
        
        {/* Intro / Empty State */}
        {!preview && (
          <div className="flex flex-col items-center justify-center min-h-[60vh] text-center max-w-2xl mx-auto">
            <div className="w-20 h-20 bg-purple-100 rounded-full flex items-center justify-center mb-6 animate-pulse">
               <Camera className="w-10 h-10 text-purple-600" />
            </div>
            <h2 className="text-4xl md:text-5xl font-serif font-medium text-stone-900 mb-6">
              "I don't know what to<br/>wear with this..."
            </h2>
            <p className="text-lg text-stone-500 mb-10 max-w-md mx-auto leading-relaxed">
              Upload a photo of that tricky item in your closet. Our AI will analyze it and create 3 perfect outfits for you.
            </p>
            
            <button 
              onClick={() => fileInputRef.current?.click()}
              className="bg-stone-900 text-white px-8 py-4 rounded-full text-lg font-medium hover:bg-stone-800 transition-all shadow-xl hover:shadow-2xl hover:-translate-y-1 flex items-center gap-3"
            >
              <Upload className="w-5 h-5" />
              Upload Item
            </button>
            <input 
              type="file" 
              ref={fileInputRef} 
              onChange={handleFileChange} 
              className="hidden" 
              accept="image/*"
            />
          </div>
        )}

        {/* Dashboard */}
        {preview && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            
            {/* Sidebar: Source Image */}
            <div className="lg:col-span-4 space-y-6 sticky top-24">
               <div className="bg-white p-4 rounded-2xl shadow-sm border border-stone-200">
                  <div className="flex justify-between items-center mb-3">
                    <h3 className="font-semibold text-stone-900">Your Item</h3>
                    <button onClick={() => { setPreview(null); setAnalysis(null); }} className="text-stone-400 hover:text-red-500">
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                  <div className="relative aspect-square rounded-xl overflow-hidden bg-stone-100 mb-4 group">
                    <img src={preview} alt="Uploaded Item" className="w-full h-full object-cover" />
                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                       <button 
                         onClick={() => openEditor(preview)}
                         className="bg-white text-stone-900 px-4 py-2 rounded-full font-medium text-sm flex items-center gap-2 hover:bg-stone-100"
                       >
                         <Wand2 className="w-4 h-4" />
                         Edit Image
                       </button>
                    </div>
                  </div>
                  
                  {analysis && (
                    <div className="bg-stone-50 p-4 rounded-xl text-sm space-y-2">
                       <p><span className="font-semibold text-stone-700">Identified:</span> {analysis.itemAnalysis.description}</p>
                       <p><span className="font-semibold text-stone-700">Category:</span> {analysis.itemAnalysis.category}</p>
                       <p><span className="font-semibold text-stone-700">Base Color:</span> {analysis.itemAnalysis.baseColor}</p>
                    </div>
                  )}

                  {!analysis && !isAnalyzing && !error && (
                    <button 
                      onClick={startAnalysis}
                      className="w-full mt-2 bg-purple-600 text-white py-3 rounded-xl font-medium hover:bg-purple-700 transition-colors flex items-center justify-center gap-2"
                    >
                      <Sparkles className="w-4 h-4" />
                      Style This Item
                    </button>
                  )}
                  
                   {isAnalyzing && (
                    <div className="w-full mt-2 bg-stone-100 text-stone-500 py-3 rounded-xl font-medium flex items-center justify-center gap-2 cursor-wait">
                      <div className="animate-spin rounded-full h-4 w-4 border-2 border-purple-600 border-t-transparent"></div>
                      Analyzing...
                    </div>
                  )}

                  {error && (
                     <div className="mt-4 p-3 bg-red-50 text-red-600 text-sm rounded-lg flex items-start gap-2">
                        <AlertCircle className="w-4 h-4 mt-0.5 flex-shrink-0" />
                        {error}
                     </div>
                  )}
               </div>
            </div>

            {/* Main Area: Results */}
            <div className="lg:col-span-8">
               {analysis ? (
                 <OutfitDisplay 
                    plans={analysis.outfitPlans}
                    generatedImages={generatedImages}
                    onGenerateImage={handleGenerateImage}
                    onEditImage={openEditor}
                 />
               ) : (
                 <div className="bg-stone-100/50 rounded-3xl border border-dashed border-stone-300 h-96 flex flex-col items-center justify-center text-stone-400">
                    <p className="max-w-xs text-center">
                      {isAnalyzing 
                        ? "Our AI stylist is studying your item and browsing the latest trends..." 
                        : "Click 'Style This Item' to see your outfit options."}
                    </p>
                 </div>
               )}
            </div>
          </div>
        )}
      </main>

      {/* Editor Modal */}
      <EditorModal 
        isOpen={isEditorOpen}
        onClose={() => setIsEditorOpen(false)}
        initialImage={imageToEdit}
      />
    </div>
  );
};

export default App;