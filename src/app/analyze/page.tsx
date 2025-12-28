"use client";

import { useState, useRef, useEffect } from "react";
import { Upload, FileImage, Eye, Layers, Activity } from "lucide-react";

export default function AnalyzePage() {
  const [file, setFile] = useState<File | null>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  // When file changes, draw it to canvas and analyze
  useEffect(() => {
    if (!file || !canvasRef.current) return;

    const img = new Image();
    img.src = URL.createObjectURL(file);
    img.onload = () => {
      const canvas = canvasRef.current!;
      const ctx = canvas.getContext("2d");
      if (!ctx) return;

      // Set canvas size to match image
      canvas.width = img.width;
      canvas.height = img.height;
      ctx.drawImage(img, 0, 0);
    };
  }, [file]);

  const runAnalysis = () => {
    if (!canvasRef.current) return;
    setIsAnalyzing(true);

    // Give UI a moment to update
    setTimeout(() => {
      const canvas = canvasRef.current!;
      const ctx = canvas.getContext("2d");
      if (!ctx) return;

      const width = canvas.width;
      const height = canvas.height;
      
      // Get raw pixel data
      const imageData = ctx.getImageData(0, 0, width, height);
      const data = imageData.data; // [R, G, B, A, R, G, B, A...]

      // We will replace the visible image with the "Noise Map"
      // Logic: Extract the LSB of the Blue Channel.
      // If bit is 1 -> White Pixel. If bit is 0 -> Black Pixel.
      for (let i = 0; i < data.length; i += 4) {
        // Look at Blue Channel (Index + 2)
        const blueVal = data[i + 2];
        const lsb = blueVal & 1; // Extract last bit

        // Scale it up: 0 -> 0 (Black), 1 -> 255 (White)
        const pixelVal = lsb * 255;

        data[i] = pixelVal;     // R
        data[i + 1] = pixelVal; // G
        data[i + 2] = pixelVal; // B
        data[i + 3] = 255;      // Alpha (100%)
      }

      // Put the modified data back
      ctx.putImageData(imageData, 0, 0);
      setIsAnalyzing(false);
    }, 100);
  };

  return (
    <main className="min-h-screen bg-black text-blue-500 p-8 flex flex-col items-center font-mono">
      <h1 className="text-4xl font-bold mb-8 tracking-tighter text-white flex items-center gap-3">
        <Activity size={32} className="text-blue-500" />
        THE INSPECTOR
      </h1>

      <div className="w-full max-w-4xl grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* LEFT COLUMN: CONTROLS */}
        <div className="space-y-6">
            <div className="border border-blue-900/50 rounded-lg p-6 bg-blue-900/10">
                <h2 className="text-white font-bold mb-4 flex items-center gap-2">
                    <Layers size={18} /> BIT-PLANE SLICER
                </h2>
                <p className="text-xs text-blue-400 mb-6 leading-relaxed opacity-80">
                    This tool isolates the <strong>Least Significant Bit (LSB)</strong> of the image.
                    <br/><br/>
                    <span className="text-white">Clean Image:</span> You will see ghosts, shadows, or structural outlines.
                    <br/><br/>
                    <span className="text-white">Mirage Image:</span> You will see <strong>pure static noise</strong> (Chaos).
                </p>

                {/* Upload */}
                <div className="relative border border-dashed border-gray-700 hover:border-blue-500 rounded p-4 text-center cursor-pointer transition-colors">
                    <input
                        type="file"
                        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                        onChange={(e) => setFile(e.target.files?.[0] || null)}
                    />
                    <div className="flex flex-col items-center gap-2">
                        <Upload size={24} className="opacity-50" />
                        <span className="text-xs font-bold">{file ? "IMAGE LOADED" : "UPLOAD IMAGE"}</span>
                    </div>
                </div>

                {/* Action Button */}
                <button
                    onClick={runAnalysis}
                    disabled={!file}
                    className={`w-full py-3 mt-4 font-bold rounded flex items-center justify-center gap-2 transition-all ${
                        !file 
                        ? "bg-gray-900 text-gray-600 cursor-not-allowed" 
                        : "bg-blue-600 text-white hover:bg-blue-500 shadow-[0_0_15px_rgba(37,99,235,0.4)]"
                    }`}
                >
                    <Eye size={18} />
                    {isAnalyzing ? "SCANNING..." : "REVEAL NOISE LAYER"}
                </button>
            </div>
        </div>

        {/* RIGHT COLUMN: CANVAS VISUALIZER */}
        <div className="lg:col-span-2 bg-gray-900/30 border border-gray-800 rounded-lg p-4 flex items-center justify-center min-h-[400px] relative overflow-hidden">
            {!file && (
                <div className="text-center opacity-30">
                    <FileImage size={64} className="mx-auto mb-4" />
                    <p className="text-sm tracking-widest">NO SIGNAL INPUT</p>
                </div>
            )}
            
            {/* The Canvas (Hidden until file loaded) */}
            <canvas 
                ref={canvasRef} 
                className={`max-w-full max-h- object-contain border border-gray-700 shadow-2xl ${!file ? 'hidden' : 'block'}`}
            />
            
            {/* Overlay Label */}
            {file && (
                <div className="absolute top-4 left-4 bg-black/80 backdrop-blur text-white text-[10px] px-2 py-1 rounded border border-gray-700">
                    VISUAL FEED: {file.name}
                </div>
            )}
        </div>

      </div>
    </main>
  );
}