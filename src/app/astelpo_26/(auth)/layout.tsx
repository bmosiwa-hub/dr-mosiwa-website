export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 via-slate-800 to-indigo-950 p-4 py-8">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-12 h-12 bg-indigo-600 rounded-xl mb-4">
            <span className="text-white font-black text-lg">AP</span>
          </div>
          <h1 className="text-2xl font-bold text-white">AstelPO</h1>
          <p className="text-slate-400 text-sm mt-1">Astellic Project Office</p>
        </div>
        {children}
      </div>
    </div>
  );
}
