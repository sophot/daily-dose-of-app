export enum OutfitStyle {
  Casual = 'Casual',
  Business = 'Business',
  NightOut = 'Night Out'
}

export interface OutfitPlan {
  style: OutfitStyle;
  description: string;
  keyItems: string[];
  colorPalette: string[];
  whyItWorks: string;
}

export interface AnalyzedItem {
  description: string;
  category: string;
  baseColor: string;
}

export interface AnalysisResult {
  itemAnalysis: AnalyzedItem;
  outfitPlans: OutfitPlan[];
}

export type VisualType = 'flat-lay' | 'on-model';

export interface VisualState {
  url: string | null;
  loading: boolean;
  error?: string;
}

export interface GeneratedOutfitVisuals {
  style: OutfitStyle;
  flatLay: VisualState;
  onModel: VisualState;
}