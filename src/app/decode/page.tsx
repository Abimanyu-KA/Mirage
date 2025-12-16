"use client";

import { useState } from "react";
import axios from "axios";
import { Upload, Lock, FileImage, Eye, AlertTriangle } from "lucide-react";

export default function DecodePage() {
  const [file, setFile] = useState<File | null>(null);
  const [pin, setPin] = useState("");
  const [result, setResult] = useState<string | null>(null);
  const [glitchUrl, setGlitchUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleDecode = async () => {
    if (!file || !pin) {
      alert("Please upload an image and enter the PIN.");
      return;
    }

    setLoading(true);
    setResult(null);
    setGlitchUrl(null);

    const formData = new FormData();
    formData.append("file", file);
    formData.append("pin", pin);
    formData.append("mode", "secret");

    try {
      // We don't know if we will get JSON or an Image yet.
      // So we ask for 'blob' (raw data) and check the type later.
      const response = await axios.post("/api/decode", formData, {
        responseType: "blob",
      });

      const contentType = response.headers["content-type"];

      if (contentType.includes("application/json")) {
        // SCENARIO A: SUCCESS (It's JSON)
        // We have to convert the blob back to text to read the JSON
        const textData = await response.data.text();
        const jsonData = JSON.parse(textData);
        setResult(jsonData.message);
      } else {
        // SCENARIO B: FAILURE (It's an Image / Glitch)
        // Create a URL for the glitched image
        const url = window.URL.createObjectURL(new Blob([response.data]));
        setGlitchUrl(url);
      }

    } catch (error) {
      console.error("Decode failed", error);
      alert("System Error. The engine could not process this file.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-black text-red-500 p-8 flex flex-col items-center">
      <h1 className="text-4xl font-bold mb-12 tracking-tighter">DECODE PROTOCOL</h1>

      {/* RESULT AREA */}
      {result && (
        <div className="w-full max-w-md p-6 border border-green-500 bg-green-900/10 text-green-500 rounded animate-in fade-in slide-in-from-bottom-4">
          <h2 className="text-sm font-mono opacity-70 mb-2">DECRYPTED PAYLOAD:</h2>
          <p className="text-xl font-mono break-all">{result}</p>
        </div>
      )}

      {glitchUrl && (
        <div className="w-full max-w-md text-center animate-in zoom-in duration-300">
           <div className="p-4 border border-red-600 bg-red-900/20 rounded mb-4">
             <div className="flex items-center justify-center gap-2 mb-2 text-red-500 font-bold">
               <AlertTriangle /> ACCESS DENIED
             </div>
             <p className="text-xs font-mono opacity-80">
               Incorrect PIN. Security protocol initiated. 
               Data corrupted.
             </p>
           </div>
           {/* eslint-disable-next-line @next/next/no-img-element */}
           <img src={glitchUrl} alt="Glitch" className="w-full rounded border border-red-900" />
        </div>
      )}

      {/* INPUT FORM (Only show if no result is displayed) */}
      {!result && !glitchUrl && (
        <div className="w-full max-w-md space-y-8 mt-8">
          
          {/* 1. Image Upload */}
          <div className="border-2 border-dashed border-red-900 rounded-lg p-8 text-center hover:border-red-500 transition-colors cursor-pointer relative">
            <input
              type="file"
              accept="image/*"
              className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
              onChange={(e) => setFile(e.target.files?.[0] || null)}
            />
            <div className="flex flex-col items-center gap-2">
              {file ? (
                <>
                  <FileImage size={40} />
                  <span className="font-mono text-sm">{file.name}</span>
                </>
              ) : (
                <>
                  <Upload size={40} className="opacity-50" />
                  <span className="opacity-50 font-mono text-sm">UPLOAD STEGO-IMAGE</span>
                </>
              )}
            </div>
          </div>

          {/* 2. PIN Input */}
          <div>
            <label className="block text-xs font-mono mb-2 opacity-70">DECRYPTION PIN</label>
            <div className="relative">
              <Lock className="absolute left-3 top-3 text-red-700" size={18} />
              <input
                type="text"
                maxLength={4}
                className="w-full bg-black border border-red-900 rounded p-3 pl-10 text-red-500 focus:border-red-500 outline-none font-mono tracking-widest"
                placeholder="0000"
                value={pin}
                onChange={(e) => setPin(e.target.value)}
              />
            </div>
          </div>

          {/* Action Button */}
          <button
            onClick={handleDecode}
            disabled={loading}
            className="w-full py-4 bg-red-900/30 border border-red-600 text-red-500 hover:bg-red-600 hover:text-black font-bold tracking-widest transition-all flex justify-center items-center gap-2"
          >
            {loading ? "DECRYPTING..." : "REVEAL MESSAGE"}
            {!loading && <Eye size={18} />}
          </button>
        </div>
      )}
      
      {(result || glitchUrl) && (
        <button 
            onClick={() => window.location.reload()} 
            className="block mt-12 text-sm underline hover:text-white"
        >
            Decode Another
        </button>
      )}
    </main>
  );
}