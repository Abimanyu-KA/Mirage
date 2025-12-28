"use client";

import { useState, useEffect } from "react";
import axios from "axios";
import { Upload, Lock, FileImage, ArrowRight, Download, Shield, ShieldAlert, Plus, FileText, File as FileIcon, X } from "lucide-react";

export default function EncodePage() {
  const [file, setFile] = useState<File | null>(null);
  
  // --- CAPACITY STATE ---
  const [maxBytes, setMaxBytes] = useState(0);
  const [usedBytes, setUsedBytes] = useState(0);
  const [imageDimensions, setImageDimensions] = useState<{w:number, h:number} | null>(null);

  // --- LAYER 1: SECRET (BLUE) ---
  const [secretType, setSecretType] = useState<"text" | "file">("text");
  const [secretMessage, setSecretMessage] = useState(""); 
  const [secretFile, setSecretFile] = useState<File | null>(null); 
  const [pin, setPin] = useState("");
  
  // --- LAYER 2: DECOY (RED) ---
  const [enableDecoy, setEnableDecoy] = useState(false);
  const [decoyMessage, setDecoyMessage] = useState("");
  const [decoyPin, setDecoyPin] = useState("");

  const [loading, setLoading] = useState(false);
  const [downloadUrl, setDownloadUrl] = useState<string | null>(null);

  // --- CAPACITY ENGINE ---
  useEffect(() => {
      if (!maxBytes) return;

      // 1. Calculate Available Space
      // If Decoy is active, we lose 2 channels (Green/Red reserved). We only write to Blue (33%).
      // If Decoy is OFF, we write to RGB (100%).
      // We calculate currentCapacity here just for internal logic, but UI needs it too.
      // So we will just use the logic directly in the render for simplicity.

      // 2. Calculate Used Space
      let used = 0;
      
      // Secret Layer Usage
      if (secretType === 'text') {
          used += new Blob([secretMessage]).size; 
      } else if (secretFile) {
          used += secretFile.size;
      }
      
      // Decoy Layer Usage (If active)
      if (enableDecoy) {
          used += new Blob([decoyMessage]).size;
      }

      // Add overhead for JSON headers + Encryption Salt + Zlib headers (approx 1KB safety margin)
      used += 1024; 

      setUsedBytes(used);
      
  }, [secretMessage, secretFile, secretType, enableDecoy, decoyMessage, maxBytes]);

  const getCurrentCapacity = () => {
      return enableDecoy ? Math.floor(maxBytes / 3) : maxBytes;
  };

  const handleEncode = async () => {
    // Validation
    if (!file) {
      alert("Please upload a target image.");
      return;
    }
    if (!pin) {
      alert("Please set a PIN for the Secret Layer.");
      return;
    }
    if (secretType === "text" && !secretMessage) {
      alert("Please enter a secret message.");
      return;
    }
    if (secretType === "file" && !secretFile) {
      alert("Please select a file to hide.");
      return;
    }
    if (enableDecoy && (!decoyMessage || !decoyPin)) {
      alert("Please fill in all Decoy Layer fields.");
      return;
    }
    
    // Final Capacity Check
    if (usedBytes > getCurrentCapacity()) {
        alert("Payload is too large for this image! Disable Decoy mode or use a larger image.");
        return;
    }

    setLoading(true);
    const formData = new FormData();
    
    formData.append("file", file);
    formData.append("pin", pin);
    formData.append("mode", "secret"); // Default

    if (secretType === "file" && secretFile) {
      formData.append("secret_file", secretFile);
    } else {
      formData.append("message", secretMessage);
    }

    if (enableDecoy) {
      formData.append("decoy_message", decoyMessage);
      formData.append("decoy_pin", decoyPin);
    }

    try {
      const response = await axios.post("/api/encode", formData, {
        responseType: "blob",
      });
      const url = window.URL.createObjectURL(new Blob([response.data]));
      setDownloadUrl(url);
    } catch (error) {
      console.error("Encoding failed", error);
      alert("Encoding failed. The server rejected the file size.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-black text-green-500 p-8 flex flex-col items-center font-mono pb-24">
      <h1 className="text-4xl font-bold mb-8 tracking-tighter text-white">ENCODE PROTOCOL</h1>

      {downloadUrl ? (
        <div className="text-center animate-in zoom-in duration-300">
           <div className="mb-8 p-6 border border-green-500 rounded bg-green-900/20 max-w-md">
            <p className="text-xl mb-2 font-bold text-white">Stego-Image Generated.</p>
            <p className="text-sm opacity-70">
              Payload secured. 
              {enableDecoy && <span className="block text-red-400 mt-1">Decoy Layer Active.</span>}
            </p>
          </div>
          <a
            href={downloadUrl}
            // Dynamic naming: vacation.jpg -> vacation_mirage.png
            download={file ? `${file.name.split('.')[0]}_mirage.png` : "mirage_secured.png"}
            className="inline-flex items-center gap-2 px-8 py-4 bg-green-600 text-black font-bold rounded hover:bg-green-500 transition-all shadow-[0_0_15px_rgba(22,163,74,0.5)]"
          >
            <Download size={20} /> DOWNLOAD IMAGE
          </a>
          <button 
            onClick={() => window.location.reload()} 
            className="block mt-6 text-sm underline hover:text-white mx-auto opacity-60"
          >
            Encode Another
          </button>
        </div>
      ) : (
        <div className="w-full max-w-xl space-y-6">
          
          {/* TARGET IMAGE UPLOAD (Fast Version + Capacity Read) */}
          <div className="border-2 border-dashed border-gray-700 rounded-lg p-8 text-center hover:border-blue-500 transition-colors cursor-pointer relative bg-gray-900/30 group">
            <input
              type="file"
              // NO 'accept' attribute -> Fast Windows Fix
              className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
              onChange={(e) => {
                 const selected = e.target.files?.[0];
                 if (selected) {
                    if (!selected.type.startsWith("image/")) {
                        alert("Please select a valid image file.");
                        return;
                    }
                    setFile(selected);

                    // Read Dimensions for Capacity
                    const img = new Image();
                    img.src = URL.createObjectURL(selected);
                    img.onload = () => {
                        setImageDimensions({ w: img.width, h: img.height });
                        // Default Max: Width * Height * 3 channels / 8 bits
                        const rawCapacity = Math.floor((img.width * img.height * 3) / 8); 
                        setMaxBytes(rawCapacity);
                    };
                 }
              }}
            />
            <div className="flex flex-col items-center gap-3 group-hover:scale-105 transition-transform">
              {file ? (
                <>
                  <FileImage size={40} className="text-blue-400" />
                  <span className="font-bold text-sm text-white">{file.name}</span>
                </>
              ) : (
                <>
                  <Upload size={40} className="opacity-40" />
                  <span className="opacity-40 text-sm">DROP TARGET IMAGE</span>
                </>
              )}
            </div>
          </div>

          {/* CAPACITY METER (New!) */}
          {file && imageDimensions && (
            <div className="bg-gray-900/50 p-4 rounded border border-gray-800 animate-in fade-in">
                <div className="flex justify-between text-[10px] uppercase font-bold tracking-widest mb-2">
                    <span className="text-gray-400">Storage Capacity</span>
                    <span className={usedBytes > getCurrentCapacity() ? "text-red-500" : "text-green-500"}>
                        {Math.min(usedBytes, getCurrentCapacity()).toLocaleString()} / {getCurrentCapacity().toLocaleString()} BYTES
                    </span>
                </div>
                
                {/* Bar Container */}
                <div className="h-2 w-full bg-black rounded-full overflow-hidden border border-gray-700 relative">
                    <div 
                        className={`h-full transition-all duration-500 ${
                            usedBytes > getCurrentCapacity() ? 'bg-red-600' : 'bg-green-500 shadow-[0_0_10px_rgba(34,197,94,0.5)]'
                        }`}
                        style={{ 
                            width: `${Math.min((usedBytes / getCurrentCapacity()) * 100, 100)}%` 
                        }}
                    />
                </div>
                
                {/* Stats Footer */}
                <div className="flex justify-between mt-2 text-[10px] text-gray-500 font-mono">
                    <span>RES: {imageDimensions.w} x {imageDimensions.h} px</span>
                    <span>MODE: {enableDecoy ? "SAFE (1 Channel)" : "HIGH CAP (3 Channels)"}</span>
                </div>

                {/* Overload Warning */}
                {usedBytes > getCurrentCapacity() && (
                    <div className="mt-2 text-red-400 text-xs font-bold flex items-center gap-2">
                        <ShieldAlert size={12} />
                        PAYLOAD TOO LARGE. DISABLE DECOY OR COMPRESS FILE.
                    </div>
                )}
            </div>
          )}

          {/* --- LAYER 1: SECRET (BLUE) --- */}
          <div className="border border-blue-900/50 rounded-lg p-6 bg-blue-950/10 relative overflow-hidden">
             <div className="absolute top-0 left-0 bg-blue-900 text-blue-200 text-[10px] font-bold px-2 py-1 flex items-center gap-1 rounded-br">
                <Shield size={10} /> SECRET LAYER (BLUE)
             </div>
             
             {/* Text vs File Toggle */}
             <div className="flex justify-end mb-4">
                <div className="flex bg-black rounded p-1 border border-blue-900/50">
                    <button 
                        onClick={() => setSecretType("text")}
                        className={`px-3 py-1 text-[10px] font-bold rounded flex items-center gap-1 ${secretType === 'text' ? 'bg-blue-900 text-white' : 'text-gray-500'}`}
                    >
                        <FileText size={10} /> TEXT
                    </button>
                    <button 
                        onClick={() => setSecretType("file")}
                        className={`px-3 py-1 text-[10px] font-bold rounded flex items-center gap-1 ${secretType === 'file' ? 'bg-blue-900 text-white' : 'text-gray-500'}`}
                    >
                        <FileIcon size={10} /> FILE
                    </button>
                </div>
             </div>
             
             <div className="space-y-4">
                {/* Secret Input */}
                {secretType === "text" ? (
                    <div>
                        <label className="text-xs text-blue-400 block mb-1">SECRET MESSAGE</label>
                        <textarea 
                            className="w-full bg-black border border-blue-900/50 rounded p-3 text-blue-400 focus:border-blue-500 outline-none h-24 text-sm font-mono"
                            placeholder="Type confidential data..."
                            value={secretMessage}
                            onChange={(e) => setSecretMessage(e.target.value)}
                        />
                    </div>
                ) : (
                    <div>
                         <label className="text-xs text-blue-400 block mb-1">SECRET FILE</label>
                         <div className="border border-blue-900/30 rounded bg-black p-4 text-center relative hover:border-blue-500 transition-colors">
                            <input 
                                type="file" 
                                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                                onChange={(e) => setSecretFile(e.target.files?.[0] || null)}
                            />
                            {secretFile ? (
                                <div className="flex items-center justify-center gap-2 text-blue-400">
                                    <FileIcon size={16} />
                                    <span className="text-sm font-bold truncate max-w-50">{secretFile.name}</span>
                                </div>
                            ) : (
                                <span className="text-xs text-blue-700 font-bold">CLICK TO SELECT FILE (PDF, ZIP, ETC)</span>
                            )}
                         </div>
                    </div>
                )}

                {/* PIN Input */}
                <div>
                    <label className="text-xs text-blue-400 block mb-1">REAL PIN</label>
                    <div className="relative">
                        <Lock className="absolute left-3 top-2.5 text-blue-700" size={14} />
                        <input 
                            type="text" 
                            maxLength={8}
                            className="w-full bg-black border border-blue-900/50 rounded p-2 pl-9 text-blue-400 focus:border-blue-500 outline-none tracking-[0.5em] font-bold"
                            placeholder="1234"
                            value={pin}
                            onChange={(e) => setPin(e.target.value)}
                        />
                    </div>
                </div>
             </div>
          </div>

          {/* --- LAYER 2: DECOY (RED) --- */}
          {enableDecoy ? (
              <div className="border border-red-900/50 rounded-lg p-6 bg-red-950/10 relative animate-in slide-in-from-top-4 fade-in">
                <div className="absolute top-0 left-0 bg-red-900 text-red-200 text-[10px] font-bold px-2 py-1 flex items-center gap-1 rounded-br">
                    <ShieldAlert size={10} /> DECOY LAYER (RED)
                </div>
                <button 
                    onClick={() => setEnableDecoy(false)}
                    className="absolute top-2 right-2 text-red-700 hover:text-red-400"
                >
                    <X size={16} />
                </button>
                
                <div className="mt-4 space-y-4">
                    <div>
                        <label className="text-xs text-red-400 block mb-1">FAKE MESSAGE</label>
                        <textarea 
                            className="w-full bg-black border border-red-900/50 rounded p-3 text-red-400 focus:border-red-500 outline-none h-20 text-sm"
                            placeholder="Shopping list: Milk, Eggs..."
                            value={decoyMessage}
                            onChange={(e) => setDecoyMessage(e.target.value)}
                        />
                    </div>
                    <div>
                        <label className="text-xs text-red-400 block mb-1">FAKE PIN</label>
                        <div className="relative">
                            <Lock className="absolute left-3 top-2.5 text-red-700" size={14} />
                            <input 
                                type="text" 
                                maxLength={4}
                                className="w-full bg-black border border-red-900/50 rounded p-2 pl-9 text-red-400 focus:border-red-500 outline-none tracking-[0.5em] font-bold"
                                placeholder="0000"
                                value={decoyPin}
                                onChange={(e) => setDecoyPin(e.target.value)}
                            />
                        </div>
                    </div>
                </div>
              </div>
          ) : (
              <button 
                onClick={() => setEnableDecoy(true)}
                className="w-full py-4 border border-dashed border-gray-800 text-gray-500 hover:border-red-500 hover:text-red-500 rounded flex flex-col items-center justify-center gap-2 transition-all group"
              >
                  <div className="flex items-center gap-2 font-bold">
                    <Plus size={16} /> ADD DECOY LAYER
                  </div>
                  <span className="text-xs opacity-50 group-hover:opacity-100">
                    Embed a second fake message for plausible deniability.
                  </span>
              </button>
          )}

          {/* ACTION BUTTON */}
          <button
            onClick={handleEncode}
            disabled={loading || (file ? usedBytes > getCurrentCapacity() : false)}
            className={`w-full py-4 font-bold tracking-widest transition-all rounded shadow-lg flex justify-center items-center gap-2 mt-8 ${
                (file && usedBytes > getCurrentCapacity())
                ? "bg-gray-800 text-gray-500 cursor-not-allowed border border-gray-700"
                : "bg-white text-black hover:bg-gray-200"
            }`}
          >
            {loading ? "ENCRYPTING DATA..." : "INITIATE ENCODE"}
            {!loading && <ArrowRight size={18} />}
          </button>

        </div>
      )}
    </main>
  );
}