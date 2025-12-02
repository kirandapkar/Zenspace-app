export interface ChatMessage {
  id: string;
  role: 'user' | 'model';
  text: string;
  timestamp: number;
}

export interface AnalysisState {
  isAnalyzing: boolean;
  result: string | null;
  error: string | null;
}

export interface FileData {
  base64: string;
  mimeType: string;
  previewUrl: string;
}
