"use client";

import { useState } from "react";
import axios from "axios";
import { Upload, Lock, FileImage, ArrowRight, Download } from "lucide-react";

export default function EncodePage() {
  const [file, setFile] = useState<File | null>(null);
  const [message, setMessage] = useState("");
  const [pin, setPin] = useState("");
  const [loading, setLoading] = useState(false);
  const [downloadUrl, setDownloadUrl] = useState<string | null>(null);

  const handleEncode = async () => {
    if (!file || !message || !pin) {
      alert("Please fill in all fields.");
      return;
    }

    setLoading(true);
    const formData = new FormData();
    formData.append("file", file);
    formData.append("message", message);
    formData.append("pin", pin);
    formData.append("mode", "secret"); // Default to Blue channel

    try {
      // 1. Send data to Python Backend
      const response = await axios.post("/api/encode", formData, {
        responseType: "blob", // Important: We expect a FILE back, not text
      });

      // 2. Create a fake download link for the browser
      const url = window.URL.createObjectURL(new Blob([response.data]));
      setDownloadUrl(url);
    } catch (error) {
      console.error("Encoding failed", error);
      alert("Something went wrong with the engine.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-black text-green-500 p-8 flex flex-col items-center">
      <h1 className="text-4xl font-bold mb-12 tracking-tighter">ENCODE PROTOCOL</h1>

      {/* RESULT STATE: If we have a download URL, show it */}
      {downloadUrl ? (
        <div className="text-center animate-pulse">
          <div className="mb-8 p-4 border border-green-500 rounded bg-green-900/20">
            <p className="text-xl mb-2">Stego-Image Generated Successfully.</p>
            <p className="text-sm opacity-70">The message is now hidden in the pixels.</p>
          </div>
          <a
            href={downloadUrl}
            download="mirage_secured.png"
            className="inline-flex items-center gap-2 px-8 py-4 bg-green-500 text-black font-bold rounded hover:bg-green-400 transition-all"
          >
            <Download size={20} /> DOWNLOAD IMAGE
          </a>
          <button 
            onClick={() => window.location.reload()} 
            className="block mt-6 text-sm underline hover:text-white mx-auto"
          >
            Encode Another
          </button>
        </div>
      ) : (
        /* INPUT STATE: Form */
        <div className="w-full max-w-md space-y-8">
          
          {/* 1. Image Upload */}
          <div className="border-2 border-dashed border-green-800 rounded-lg p-8 text-center hover:border-green-500 transition-colors cursor-pointer relative">
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
                  <span className="opacity-50 font-mono text-sm">DROP TARGET IMAGE</span>
                </>
              )}
            </div>
          </div>

          {/* 2. Message Input */}
          <div>
            <label className="block text-xs font-mono mb-2 opacity-70">SECRET PAYLOAD</label>
            <textarea
              className="w-full bg-black border border-green-800 rounded p-4 text-green-500 focus:border-green-500 outline-none h-32 font-mono"
              placeholder="Type your secret message here..."
              value={message}
              onChange={(e) => setMessage(e.target.value)}
            />
          </div>

          {/* 3. PIN Input */}
          <div>
            <label className="block text-xs font-mono mb-2 opacity-70">ENCRYPTION PIN</label>
            <div className="relative">
              <Lock className="absolute left-3 top-3 text-green-700" size={18} />
              <input
                type="text"
                maxLength={4}
                className="w-full bg-black border border-green-800 rounded p-3 pl-10 text-green-500 focus:border-green-500 outline-none font-mono tracking-widest"
                placeholder="0000"
                value={pin}
                onChange={(e) => setPin(e.target.value)}
              />
            </div>
          </div>

          {/* Action Button */}
          <button
            onClick={handleEncode}
            disabled={loading}
            className="w-full py-4 bg-green-900/30 border border-green-500 text-green-500 hover:bg-green-500 hover:text-black font-bold tracking-widest transition-all flex justify-center items-center gap-2"
          >
            {loading ? "ENCRYPTING..." : "INITIATE ENCODE"}
            {!loading && <ArrowRight size={18} />}
          </button>
        </div>
      )}
    </main>
  );
}