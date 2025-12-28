import Link from "next/link";
import { ArrowRight, Shield, Activity, Lock, FileJson, Cpu, EyeOff } from "lucide-react";

export default function Home() {
  return (
    <main className="min-h-screen bg-black text-white selection:bg-green-500 selection:text-black">
      
      {/* --- HERO SECTION --- */}
      <section className="relative h-[80vh] flex flex-col items-center justify-center text-center px-4 border-b border-gray-900 overflow-hidden">
        {/* Background Grid Effect */}
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#111_1px,transparent_1px),linear-gradient(to_bottom,#111_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)] opacity-20 pointer-events-none" />
        
        <div className="z-10 animate-in fade-in zoom-in duration-1000">
          <h1 className="text-6xl md:text-8xl font-black tracking-tighter mb-6">
            MIRAGE<span className="text-green-500">_OS</span>
          </h1>
          <p className="text-xl md:text-2xl text-gray-400 max-w-2xl mx-auto mb-10 leading-relaxed font-mono">
            Hide secrets in plain sight. <br/>
            Next-gen <span className="text-blue-400">Polyglot Steganography</span> powered by the Chaos Engine.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link 
              href="/encode"
              className="group px-8 py-4 bg-white text-black font-bold text-lg rounded hover:bg-green-400 transition-all flex items-center justify-center gap-2"
            >
              START ENCRYPTING
              <ArrowRight className="group-hover:translate-x-1 transition-transform" />
            </Link>
            <Link 
              href="/decode"
              className="px-8 py-4 border border-gray-700 text-gray-400 font-bold text-lg rounded hover:border-white hover:text-white transition-all"
            >
              DECRYPT SIGNAL
            </Link>
          </div>
        </div>
      </section>

      {/* --- PROTOCOL BREAKDOWN --- */}
      <section className="py-24 px-6 max-w-6xl mx-auto">
        <div className="mb-16">
          <h2 className="text-3xl font-bold mb-4 flex items-center gap-3">
            <Cpu className="text-green-500" />
            SYSTEM ARCHITECTURE
          </h2>
          <div className="h-1 w-20 bg-green-500 rounded" />
        </div>

        <div className="grid md:grid-cols-3 gap-8">
          {/* Card 1 */}
          <div className="p-8 border border-gray-800 rounded bg-gray-900/20 hover:border-blue-500 transition-colors group">
            <Activity size={32} className="text-blue-500 mb-4 group-hover:scale-110 transition-transform" />
            <h3 className="text-xl font-bold mb-2">The Chaos Engine</h3>
            <p className="text-gray-400 text-sm leading-relaxed">
              Unlike standard linear steganography, Mirage uses a PIN-seeded <strong>PRNG scatter algorithm</strong>. Bits are distributed stochastically across the image canvas, defeating statistical steganalysis.
            </p>
          </div>

          {/* Card 2 */}
          <div className="p-8 border border-gray-800 rounded bg-gray-900/20 hover:border-red-500 transition-colors group">
            <Shield size={32} className="text-red-500 mb-4 group-hover:scale-110 transition-transform" />
            <h3 className="text-xl font-bold mb-2">Decoy Protocol</h3>
            <p className="text-gray-400 text-sm leading-relaxed">
              Plausible deniability via <strong>Dual-Layer Embedding</strong>. Encode a fake "Decoy" message in the Red Channel (PIN A) and the real secret in the Blue Channel (PIN B).
            </p>
          </div>

          {/* Card 3 */}
          <div className="p-8 border border-gray-800 rounded bg-gray-900/20 hover:border-purple-500 transition-colors group">
            <FileJson size={32} className="text-purple-500 mb-4 group-hover:scale-110 transition-transform" />
            <h3 className="text-xl font-bold mb-2">The Smuggler</h3>
            <p className="text-gray-400 text-sm leading-relaxed">
              Binary-to-Image injection allows you to hide <strong>PDFs, ZIPs, or Audio</strong> files inside innocent PNGs. Includes zlib compression and AES-256 encryption.
            </p>
          </div>
        </div>
      </section>

      {/* --- TOOLKIT GRID --- */}
      <section className="py-24 bg-gray-900/30 border-t border-gray-900">
        <div className="max-w-6xl mx-auto px-6">
          <h2 className="text-3xl font-bold mb-12 text-center tracking-widest">AVAILABLE MODULES</h2>
          
          <div className="grid md:grid-cols-2 gap-4">
            <Link href="/encode" className="block p-6 border border-gray-800 hover:bg-gray-800 hover:border-green-500 transition-all rounded flex items-center justify-between group">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-black rounded text-green-500 border border-gray-800">
                  <Lock size={24} />
                </div>
                <div>
                  <h4 className="font-bold text-white group-hover:text-green-400 transition-colors">ENCODE</h4>
                  <p className="text-xs text-gray-500">Inject payload into image carrier.</p>
                </div>
              </div>
              <ArrowRight className="text-gray-600 group-hover:text-white group-hover:translate-x-2 transition-all" />
            </Link>

            <Link href="/decode" className="block p-6 border border-gray-800 hover:bg-gray-800 hover:border-blue-500 transition-all rounded flex items-center justify-between group">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-black rounded text-blue-500 border border-gray-800">
                  <EyeOff size={24} />
                </div>
                <div>
                  <h4 className="font-bold text-white group-hover:text-blue-400 transition-colors">DECODE</h4>
                  <p className="text-xs text-gray-500">Extract and decrypt hidden data.</p>
                </div>
              </div>
              <ArrowRight className="text-gray-600 group-hover:text-white group-hover:translate-x-2 transition-all" />
            </Link>
            
             <Link href="/analyze" className="block p-6 border border-gray-800 hover:bg-gray-800 hover:border-purple-500 transition-all rounded flex items-center justify-between group md:col-span-2">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-black rounded text-purple-500 border border-gray-800">
                  <Activity size={24} />
                </div>
                <div>
                  <h4 className="font-bold text-white group-hover:text-purple-400 transition-colors">THE INSPECTOR</h4>
                  <p className="text-xs text-gray-500">Bit-plane slicing and noise visualization.</p>
                </div>
              </div>
              <ArrowRight className="text-gray-600 group-hover:text-white group-hover:translate-x-2 transition-all" />
            </Link>
          </div>
        </div>
      </section>

      {/* --- FOOTER --- */}
      <footer className="py-8 text-center border-t border-gray-900 text-gray-600 text-xs font-mono">
        <p>SECURE TRANSMISSION PROTOCOL v2.0</p>
        <p className="mt-2">BUILT FOR EDUCATIONAL PURPOSES</p>
      </footer>
    </main>
  );
}