import React, { useState } from 'react';
import { OutfitPlan, OutfitStyle, GeneratedOutfitVisuals, VisualType } from '../types';
import { Loader2, Wand2, Info, CheckCircle2, User, Layers } from 'lucide-react';

interface OutfitDisplayProps {
  plans: OutfitPlan[];
  generatedImages: Record<OutfitStyle, GeneratedOutfitVisuals>;
  onGenerateImage: (style: OutfitStyle, plan: OutfitPlan, type: VisualType) => void;
  onEditImage: (imageUrl: string) => void;
}

const OutfitDisplay: React.FC<OutfitDisplayProps> = ({ 
  plans, 
  generatedImages, 
  onGenerateImage,
  onEditImage 
}) => {
  const [activeTab, setActiveTab] = useState<OutfitStyle>(OutfitStyle.Casual);
  const [visualType, setVisualType] = useState<VisualType>('flat-lay');

  const activePlan = plans.find(p => p.style === activeTab) || plans[0];
  const activeVisuals = generatedImages[activeTab];
  const currentImageState = visualType === 'flat-lay' ? activeVisuals.flatLay : activeVisuals.onModel;

  return (
    <div className="bg-white rounded-3xl shadow-xl border border-stone-100 overflow-hidden flex flex-col h-full">
      {/* Tabs */}
      <div className="flex border-b border-stone-200">
        {plans.map((plan) => (
          <button
            key={plan.style}
            onClick={() => setActiveTab(plan.style)}
            className={`flex-1 py-4 text-sm font-semibold tracking-wide uppercase transition-all duration-300
              ${activeTab === plan.style 
                ? 'bg-stone-900 text-white' 
                : 'bg-white text-stone-500 hover:text-stone-900 hover:bg-stone-50'
              }`}
          >
            {plan.style}
          </button>
        ))}
      </div>

      <div className="flex-1 overflow-y-auto p-6 md:p-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12 h-full">
          
          {/* Left: Visualization */}
          <div className="flex flex-col gap-4">
            
            {/* View Toggle */}
            <div className="flex p-1 bg-stone-100 rounded-lg self-center">
               <button
                 onClick={() => setVisualType('flat-lay')}
                 className={`px-4 py-2 rounded-md text-sm font-medium flex items-center gap-2 transition-all ${visualType === 'flat-lay' ? 'bg-white shadow-sm text-stone-900' : 'text-stone-500 hover:text-stone-900'}`}
               >
                 <Layers className="w-4 h-4" />
                 Flat Lay
               </button>
               <button
                 onClick={() => setVisualType('on-model')}
                 className={`px-4 py-2 rounded-md text-sm font-medium flex items-center gap-2 transition-all ${visualType === 'on-model' ? 'bg-white shadow-sm text-stone-900' : 'text-stone-500 hover:text-stone-900'}`}
               >
                 <User className="w-4 h-4" />
                 On Model
               </button>
            </div>

            <div className="relative aspect-[4/5] w-full bg-stone-100 rounded-2xl overflow-hidden border border-stone-200 group">
              {currentImageState.url ? (
                <>
                  <img 
                    src={currentImageState.url} 
                    alt={`${activeTab} Outfit ${visualType}`} 
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity">
                     <button
                        onClick={() => onEditImage(currentImageState.url!)}
                        className="bg-white/90 backdrop-blur text-stone-900 px-4 py-2 rounded-full shadow-lg font-medium text-sm flex items-center gap-2 hover:bg-white transition-colors"
                      >
                        <Wand2 className="w-4 h-4 text-purple-600" />
                        Edit Look
                      </button>
                  </div>
                </>
              ) : currentImageState.loading ? (
                <div className="absolute inset-0 flex flex-col items-center justify-center text-stone-400 bg-stone-50">
                  <Loader2 className="w-10 h-10 animate-spin mb-3 text-purple-600" />
                  <p className="font-medium text-sm text-stone-600">
                    {visualType === 'flat-lay' ? 'Arranging items...' : 'Styling model...'}
                  </p>
                </div>
              ) : (
                <div className="absolute inset-0 flex flex-col items-center justify-center text-stone-400 p-6 text-center bg-stone-50">
                  <div className="w-16 h-16 bg-stone-200 rounded-full flex items-center justify-center mb-4">
                     {visualType === 'flat-lay' ? <Layers className="w-8 h-8 text-stone-400" /> : <User className="w-8 h-8 text-stone-400" />}
                  </div>
                  <p className="mb-4 text-stone-500">
                    See this {activeTab.toLowerCase()} look {visualType === 'flat-lay' ? 'laid out' : 'on a model'}
                  </p>
                  <button 
                    onClick={() => onGenerateImage(activeTab, activePlan, visualType)}
                    className="bg-stone-900 text-white px-6 py-3 rounded-full hover:bg-stone-800 transition-all font-medium flex items-center gap-2 shadow-lg shadow-stone-900/10"
                  >
                    Generate {visualType === 'flat-lay' ? 'Flat-Lay' : 'Model Look'}
                  </button>
                  {currentImageState.error && (
                    <p className="mt-4 text-red-500 text-sm">{currentImageState.error}</p>
                  )}
                </div>
              )}
            </div>
            
            {/* Color Palette */}
            <div className="flex items-center gap-3 justify-center p-4 bg-stone-50 rounded-xl">
              <span className="text-xs font-semibold text-stone-500 uppercase tracking-wider">Palette</span>
              <div className="flex -space-x-2">
                {activePlan.colorPalette.map((color, idx) => (
                  <div 
                    key={idx}
                    className="w-8 h-8 rounded-full border-2 border-white shadow-sm"
                    style={{ backgroundColor: color.toLowerCase() }} 
                    title={color}
                  />
                ))}
              </div>
              <span className="text-xs text-stone-400 ml-2 italic">
                 {activePlan.colorPalette.join(', ')}
              </span>
            </div>
          </div>

          {/* Right: Details */}
          <div className="flex flex-col justify-start space-y-6">
            <div>
              <h2 className="text-3xl font-serif font-medium text-stone-900 mb-2">
                {activeTab}
              </h2>
              <p className="text-stone-600 leading-relaxed">
                {activePlan.description}
              </p>
            </div>

            <div className="space-y-4">
              <h3 className="text-sm font-bold text-stone-900 uppercase tracking-wider border-b border-stone-200 pb-2">
                Key Pieces
              </h3>
              <ul className="space-y-3">
                {activePlan.keyItems.map((item, idx) => (
                  <li key={idx} className="flex items-start gap-3 group">
                    <CheckCircle2 className="w-5 h-5 text-green-600 mt-0.5 flex-shrink-0 group-hover:scale-110 transition-transform" />
                    <span className="text-stone-700">{item}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="bg-purple-50 p-5 rounded-xl border border-purple-100">
              <div className="flex items-center gap-2 mb-2 text-purple-800">
                <Info className="w-4 h-4" />
                <h4 className="font-semibold text-sm uppercase tracking-wide">Stylist Note</h4>
              </div>
              <p className="text-purple-900/80 text-sm leading-relaxed italic">
                "{activePlan.whyItWorks}"
              </p>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
};

export default OutfitDisplay;