import Link from "next/link";

export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-black text-green-500 p-24">
      <h1 className="text-6xl font-bold mb-8 tracking-tighter">MIRAGE</h1>
      <p className="text-xl mb-12 opacity-80">Secure. Hidden. Ephemeral.</p>
      
      <div className="flex gap-6">
        <Link href="/encode">
          <button className="px-8 py-4 border border-green-500 hover:bg-green-500 hover:text-black transition-all font-mono text-lg rounded">
            ENCODE
          </button>
        </Link>
        
        <Link href="/decode">
          <button className="px-8 py-4 border border-red-500 text-red-500 hover:bg-red-500 hover:text-black transition-all font-mono text-lg rounded">
            DECODE
          </button>
        </Link>
      </div>
    </main>
  );
}