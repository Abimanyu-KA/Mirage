"use client";

import { useState } from "react";
import axios from "axios";
import { Upload, Lock, FileImage, ArrowRight, FileText, Download, ShieldAlert, File as FileIcon } from "lucide-react";

export default function DecodePage() {
  const [file, setFile] = useState<File | null>(null);
  const [pin, setPin] = useState("");
  const [loading, setLoading] = useState(false);
  
  // The result can be Text OR a File object
  const [result, setResult] = useState<any>(null);

  const handleDecode = async () => {
    if (!file || !pin) {
      alert("Please upload an image and enter the PIN.");
      return;
    }

    setLoading(true);
    setResult(null); // Reset previous results

    const formData = new FormData();
    formData.append("file", file);
    formData.append("pin", pin);

    try {
      const response = await axios.post("/api/decode", formData, {
        // We expect JSON now, unless the PIN is wrong (then we get a blob image)
        // But axios is tricky. If the backend returns an image (glitch), it might look like text garbage.
        // Strategy: We request 'blob' so we can handle images, then try to parse text if it's not an image.
        responseType: "blob", 
      });

      const contentType = response.headers["content-type"];

      // CASE A: GLITCH ART (Wrong PIN)
      if (contentType && contentType.includes("image")) {
        const url = window.URL.createObjectURL(new Blob([response.data]));
        setResult({ type: "glitch", url: url });
      } 
      
      // CASE B: SUCCESS (JSON Data)
      else {
        // Convert Blob -> Text -> JSON
        const textData = await response.data.text();
        try {
            const data = JSON.parse(textData);
            setResult(data);
        } catch (e) {
            // Fallback if parsing fails
            console.error("Parse error", e);
            alert("Decryption failed or returned invalid data.");
        }
      }

    } catch (error) {
      console.error("Decoding failed", error);
      alert("System Error.");
    } finally {
      setLoading(false);
    }
  };

  // Helper to trigger download of the hidden file
  const downloadSecretFile = () => {
    if (!result || result.type !== 'file') return;
    
    // 1. Decode Base64 content
    const byteCharacters = atob(result.content);
    const byteNumbers = new Array(byteCharacters.length);
    for (let i = 0; i < byteCharacters.length; i++) {
        byteNumbers[i] = byteCharacters.charCodeAt(i);
    }
    const byteArray = new Uint8Array(byteNumbers);
    
    // 2. Create Blob & Link
    const blob = new Blob([byteArray]);
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = result.filename || "secret_file";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <main className="min-h-screen bg-black text-green-500 p-8 flex flex-col items-center font-mono">
      <h1 className="text-4xl font-bold mb-8 tracking-tighter text-white">DECODE PROTOCOL</h1>

      {/* RESULT SECTION */}
      {result ? (
        <div className="w-full max-w-xl animate-in zoom-in duration-300">
           
           {/* GLITCH RESULT (Wrong PIN) */}
           {result.type === "glitch" && (
             <div className="text-center">
               <div className="border border-red-500/50 p-2 rounded mb-4 bg-red-900/10">
                 <p className="text-red-500 font-bold tracking-widest">ACCESS DENIED</p>
                 <p className="text-xs text-red-400 opacity-70">Security protocol triggered. Payload incinerated.</p>
               </div>
               <img src={result.url} alt="Glitch" className="w-full rounded border border-gray-800 opacity-80" />
               <button onClick={() => window.location.reload()} className="mt-6 text-gray-500 underline text-sm">Try Again</button>
             </div>
           )}

           {/* TEXT RESULT */}
           {result.type === "text" && (
             <div className={`p-8 rounded-lg border relative ${result.is_decoy ? 'border-red-500 bg-red-900/10' : 'border-green-500 bg-green-900/10'}`}>
                {result.is_decoy && (
                    <div className="absolute top-0 right-0 bg-red-600 text-black text-[10px] font-bold px-2 py-1 rounded-bl flex items-center gap-1">
                        <ShieldAlert size={12} /> DECOY DETECTED
                    </div>
                )}
                <h3 className={`text-sm font-bold mb-4 flex items-center gap-2 ${result.is_decoy ? 'text-red-400' : 'text-green-400'}`}>
                    <FileText size={18} /> DECRYPTED PAYLOAD:
                </h3>
                <p className="text-white text-lg whitespace-pre-wrap leading-relaxed">{result.message}</p>
                
                <button 
                    onClick={() => window.location.reload()} 
                    className="mt-8 w-full py-3 bg-gray-900 text-gray-400 text-sm font-bold rounded hover:bg-gray-800"
                >
                    DECODE ANOTHER
                </button>
             </div>
           )}

           {/* FILE RESULT */}
           {result.type === "file" && (
             <div className={`p-8 rounded-lg border relative ${result.is_decoy ? 'border-red-500 bg-red-900/10' : 'border-blue-500 bg-blue-900/10'}`}>
                {result.is_decoy && (
                    <div className="absolute top-0 right-0 bg-red-600 text-black text-[10px] font-bold px-2 py-1 rounded-bl">
                        DECOY DETECTED
                    </div>
                )}
                <div className="text-center py-6">
                    <div className={`mx-auto w-16 h-16 rounded-full flex items-center justify-center mb-4 ${result.is_decoy ? 'bg-red-900/30 text-red-400' : 'bg-blue-900/30 text-blue-400'}`}>
                        <FileIcon size={32} />
                    </div>
                    <h3 className="text-xl font-bold text-white mb-1">{result.filename}</h3>
                    <p className="text-xs opacity-60 mb-6">Hidden File Extracted Successfully</p>
                    
                    <button 
                        onClick={downloadSecretFile}
                        className={`px-8 py-3 rounded font-bold flex items-center gap-2 mx-auto transition-all ${
                            result.is_decoy 
                            ? 'bg-red-600 text-black hover:bg-red-500' 
                            : 'bg-blue-600 text-white hover:bg-blue-500 shadow-[0_0_15px_rgba(37,99,235,0.4)]'
                        }`}
                    >
                        <Download size={18} /> DOWNLOAD FILE
                    </button>
                </div>
                <button 
                    onClick={() => window.location.reload()} 
                    className="mt-6 w-full text-center text-xs opacity-40 hover:opacity-100"
                >
                    Decode Another
                </button>
             </div>
           )}

        </div>
      ) : (
        <div className="w-full max-w-md space-y-6">
            {/* UPLOAD INPUT (Fast Version) */}
            <div className="border-2 border-dashed border-gray-700 rounded-lg p-8 text-center hover:border-green-500 transition-colors cursor-pointer relative bg-gray-900/30 group">
                <input
                    type="file"
                    accept=".png" // Stego images are usually PNG
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                    onChange={(e) => setFile(e.target.files?.[0] || null)}
                />
                <div className="flex flex-col items-center gap-3 group-hover:scale-105 transition-transform">
                    {file ? (
                        <>
                        <FileImage size={40} className="text-green-400" />
                        <span className="font-bold text-sm text-white">{file.name}</span>
                        </>
                    ) : (
                        <>
                        <Upload size={40} className="opacity-40" />
                        <span className="opacity-40 text-sm">UPLOAD STEGO-IMAGE</span>
                        </>
                    )}
                </div>
            </div>

            {/* PIN INPUT */}
            <div>
                <label className="block text-xs mb-2 opacity-70">DECRYPTION PIN</label>
                <div className="relative">
                    <Lock className="absolute left-3 top-3 text-green-700" size={18} />
                    <input
                        type="text"
                        maxLength={8}
                        className="w-full bg-black border border-green-900 rounded p-3 pl-10 text-green-500 outline-none focus:border-green-500 tracking-[0.5em] font-bold text-center placeholder-green-900"
                        placeholder="0000"
                        value={pin}
                        onChange={(e) => setPin(e.target.value)}
                    />
                </div>
            </div>

            {/* ACTION BUTTON */}
            <button
                onClick={handleDecode}
                disabled={loading}
                className="w-full py-4 border border-green-600 text-green-500 font-bold tracking-widest hover:bg-green-600 hover:text-black transition-all rounded flex justify-center items-center gap-2 mt-4"
            >
                {loading ? "ANALYZING..." : "REVEAL SECRETS"}
                {!loading && <ArrowRight size={18} />}
            </button>
        </div>
      )}
    </main>
  );
}