import React, { useState } from 'react';
import { Upload, Image as ImageIcon, Sparkles, RefreshCw, AlertCircle } from 'lucide-react';
import { Button } from './components/Button';
import { ChatInterface } from './components/ChatInterface';
import { geminiService } from './services/geminiService';
import { processFile } from './utils/fileUtils';
import { FileData } from './types';

const App: React.FC = () => {
  const [fileData, setFileData] = useState<FileData | null>(null);
  const [analysisResult, setAnalysisResult] = useState<string | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      setError('Please upload a valid image file.');
      return;
    }

    try {
      setError(null);
      setAnalysisResult(null);
      geminiService.reset(); // Reset chat history
      
      const processed = await processFile(file);
      setFileData(processed);
      
      // Auto-start analysis
      await analyzeImage(processed);
    } catch (err) {
      setError('Failed to process image. Please try again.');
      console.error(err);
    }
  };

  const analyzeImage = async (data: FileData) => {
    setIsAnalyzing(true);
    try {
      const result = await geminiService.analyzeRoom(data.base64, data.mimeType);
      setAnalysisResult(result);
    } catch (err) {
      setError('AI Analysis failed. Please check your connection or try a different image.');
      console.error(err);
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleReset = () => {
    setFileData(null);
    setAnalysisResult(null);
    setError(null);
    geminiService.reset();
  };

  return (
    <div className="h-screen flex flex-col bg-stone-50 overflow-hidden">
      {/* Header */}
      <header className="bg-white border-b border-stone-200 py-4 px-6 shadow-sm z-10 flex-shrink-0">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-teal-600 rounded-lg flex items-center justify-center text-white">
              <Sparkles className="w-5 h-5" />
            </div>
            <h1 className="text-xl font-bold text-stone-800 tracking-tight">ZenSpace</h1>
          </div>
          {fileData && (
             <Button variant="ghost" onClick={handleReset} icon={<RefreshCw className="w-4 h-4" />}>
               New Room
             </Button>
          )}
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 relative overflow-hidden">
        {!fileData ? (
          // Empty State - Upload
          <div className="h-full flex flex-col items-center justify-center p-6 text-center animate-fade-in">
             <div className="max-w-md w-full">
               <div className="mb-8 relative group">
                  <div className="absolute -inset-1 bg-gradient-to-r from-teal-400 to-emerald-400 rounded-2xl blur opacity-25 group-hover:opacity-40 transition duration-1000 group-hover:duration-200"></div>
                  <div className="relative bg-white p-8 rounded-xl shadow-xl border border-stone-100">
                    <div className="w-16 h-16 bg-teal-50 text-teal-600 rounded-full flex items-center justify-center mx-auto mb-4">
                      <Upload className="w-8 h-8" />
                    </div>
                    <h2 className="text-2xl font-bold text-stone-800 mb-2">Analyze Your Room</h2>
                    <p className="text-stone-500 mb-6">
                      Upload a photo of your messy space. Our AI will analyze it and create a personalized decluttering plan.
                    </p>
                    
                    <label className="block w-full">
                      <input 
                        type="file" 
                        accept="image/*" 
                        onChange={handleFileUpload}
                        className="hidden"
                      />
                      <span className="block w-full bg-stone-900 text-white font-medium py-3 px-4 rounded-lg cursor-pointer hover:bg-stone-800 transition-colors shadow-lg shadow-stone-900/10">
                        Select Photo
                      </span>
                    </label>
                  </div>
               </div>
               
               <p className="text-sm text-stone-400">
                 Powered by Gemini 3.0 Pro • Private & Secure
               </p>
             </div>
          </div>
        ) : (
          // Analysis View
          <div className="h-full flex flex-col lg:flex-row overflow-hidden">
            {/* Left Panel: Image Preview */}
            <div className="w-full lg:w-1/2 p-4 lg:p-6 bg-stone-100 flex flex-col justify-center overflow-hidden">
              <div className="relative w-full h-full max-h-[80vh] bg-stone-200 rounded-2xl overflow-hidden shadow-inner border border-stone-300">
                <img 
                  src={fileData.previewUrl} 
                  alt="Room Analysis" 
                  className="w-full h-full object-contain"
                />
                 {isAnalyzing && (
                  <div className="absolute inset-0 bg-stone-900/20 backdrop-blur-sm flex items-center justify-center">
                    <div className="bg-white/90 backdrop-blur px-6 py-4 rounded-xl shadow-lg flex items-center gap-3">
                      <RefreshCw className="w-5 h-5 text-teal-600 animate-spin" />
                      <span className="font-medium text-stone-800">Analyzing your space...</span>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Right Panel: Chat & Results */}
            <div className="w-full lg:w-1/2 flex flex-col h-full bg-white border-l border-stone-200 relative">
               {error ? (
                 <div className="flex-1 flex flex-col items-center justify-center p-8 text-center">
                    <AlertCircle className="w-12 h-12 text-red-500 mb-4" />
                    <h3 className="text-lg font-bold text-stone-800 mb-2">Something went wrong</h3>
                    <p className="text-stone-500 mb-6">{error}</p>
                    <Button onClick={handleReset}>Try Again</Button>
                 </div>
               ) : !analysisResult && isAnalyzing ? (
                 <div className="flex-1 p-8 space-y-6 animate-pulse">
                    <div className="h-8 bg-stone-100 rounded w-3/4"></div>
                    <div className="space-y-3">
                      <div className="h-4 bg-stone-100 rounded"></div>
                      <div className="h-4 bg-stone-100 rounded w-5/6"></div>
                      <div className="h-4 bg-stone-100 rounded w-4/6"></div>
                    </div>
                    <div className="h-32 bg-stone-100 rounded"></div>
                 </div>
               ) : (
                 // Chat Interface with pre-loaded analysis
                 <div className="flex-1 h-full overflow-hidden p-4 lg:p-6 bg-stone-50">
                    <ChatInterface initialMessage={analysisResult || ""} />
                 </div>
               )}
            </div>
          </div>
        )}
      </main>
    </div>
  );
};

export default App;
