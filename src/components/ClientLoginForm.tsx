import React, { useState } from 'react';
import { motion } from 'motion/react';
import { Mail, Lock, User, ArrowLeft, CheckCircle2 } from 'lucide-react';

interface ClientLoginFormProps {
  onLoginSuccess: (email: string, name: string) => void;
  onCancel: () => void;
  initialEmail?: string;
}

export default function ClientLoginForm({
  onLoginSuccess,
  onCancel,
  initialEmail = ''
}: ClientLoginFormProps) {
  const [formMode, setFormMode] = useState<'login' | 'register'>('login');
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState(initialEmail || '');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccessMsg(null);

    if (formMode === 'login') {
      // Simulate client verification
      if (!email.includes('@')) {
        setError('Format alamat email tidak valid.');
        return;
      }
      if (password.length < 4) {
        setError('Sandi harus terdiri dari minimum 4 karakter.');
        return;
      }

      // Default nickname fallback from email before @
      const generatedName = email.split('@')[0];
      const displayName = generatedName.charAt(0).toUpperCase() + generatedName.slice(1);

      onLoginSuccess(email, displayName);
    } else {
      // Sign Up simulation
      if (fullName.trim().length < 2) {
        setError('Nama lengkap Anda kosong atau terlalu pendek.');
        return;
      }
      if (!email.includes('@')) {
        setError('Masukkan email yang valid.');
        return;
      }
      if (password.length < 6) {
        setError('Sandi baru minimal harus 6 karakter untuk keamanan.');
        return;
      }

      setSuccessMsg('Pendaftaran Berhasil! Sekarang Anda dapat masuk.');
      setTimeout(() => {
        setFormMode('login');
        setSuccessMsg(null);
      }, 1800);
    }
  };

  const handleQuickDemoFill = () => {
    setEmail('customer@email.com');
    setPassword('customer123');
    setError(null);
  };

  return (
    <div className="fixed inset-0 z-50 bg-[#E1D9CD] flex items-center justify-center p-4 overflow-y-auto">
      {/* Outer elegant container */}
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: 'easeOut' }}
        className="bg-[#FAF8F5] max-w-4xl w-full h-auto min-h-[500px] md:h-[580px] rounded-[2rem] overflow-hidden shadow-2xl grid grid-cols-1 md:grid-cols-2 relative border border-[#D2C7BA]/40"
      >
        {/* Absolute floating Back option */}
        <button
          onClick={onCancel}
          className="absolute top-5 left-5 z-20 flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-white/80 hover:bg-white text-[#2B1E17] border border-[#D2C7BA]/40 text-xs font-semibold cursor-pointer transition shadow-xs"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Kembali ke Menu</span>
        </button>

        {/* Left Column: Authentic Login Form */}
        <div className="p-8 md:p-12 flex flex-col justify-between h-full bg-[#FAF8F5]">
          {/* Logo Brand "OUTPOST" */}
          <div className="mt-6 md:mt-0">
            <h1 className="font-sans text-xl font-black tracking-[0.35em] text-[#2B1E17] uppercase select-none">
              OUTPOST
            </h1>
          </div>

          {/* Core dynamic body fields */}
          <div className="my-auto py-6 space-y-6">
            <div className="space-y-1.5">
              <h2 className="font-serif text-3xl font-semibold tracking-tight text-[#2B1E17]">
                {formMode === 'login' ? 'Welcome Back' : 'Daftar Sekarang'}
              </h2>
              <p className="text-xs text-[#5A4D41]/80 leading-relaxed">
                {formMode === 'login'
                  ? 'Masuk menggunakan akun Anda untuk mengelola pembelian produk.'
                  : 'Buat akun pelanggan baru untuk melacak struk dan reservasi meja otomatis.'}
              </p>
            </div>

            {error && (
              <div className="p-3 rounded-xl bg-red-50 border border-red-200 text-xs text-red-700">
                {error}
              </div>
            )}

            {successMsg && (
              <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-250 text-xs text-emerald-800 flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>{successMsg}</span>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              {formMode === 'register' && (
                <div className="space-y-1.5">
                  <label className="block text-[10px] font-bold font-mono uppercase tracking-wider text-[#5A4D41]/90">
                    FULL NAME
                  </label>
                  <div className="relative">
                    <span className="absolute inset-y-0 left-0 flex items-center pl-3.5 text-[#5A4D41]/60">
                      <User className="w-4 h-4" />
                    </span>
                    <input
                      type="text"
                      required
                      placeholder="Masukkan nama lengkap..."
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      className="w-full bg-[#F3EDE5] border border-transparent hover:border-[#D2C7BA]/60 focus:border-[#2B1E17] rounded-xl pl-10 pr-4 py-3 text-xs font-medium text-[#2B1E17] placeholder-[#5A4D41]/40 focus:outline-none transition-all"
                    />
                  </div>
                </div>
              )}

              <div className="space-y-1.5">
                <label className="block text-[10px] font-bold font-mono uppercase tracking-wider text-[#5A4D41]/90">
                  EMAIL ADDRESS
                </label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 flex items-center pl-3.5 text-[#5A4D41]/60">
                    <Mail className="w-4 h-4" />
                  </span>
                  <input
                    type="email"
                    required
                    placeholder="customer@email.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full bg-[#F3EDE5] border border-transparent hover:border-[#D2C7BA]/60 focus:border-[#2B1E17] rounded-xl pl-10 pr-4 py-3 text-xs font-medium text-[#2B1E17] placeholder-[#5A4D41]/40 focus:outline-none transition-all"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="block text-[10px] font-bold font-mono uppercase tracking-wider text-[#5A4D41]/90">
                  PASSWORD
                </label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 flex items-center pl-3.5 text-[#5A4D41]/60">
                    <Lock className="w-4 h-4" />
                  </span>
                  <input
                    type="password"
                    required
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full bg-[#F3EDE5] border border-transparent hover:border-[#D2C7BA]/60 focus:border-[#2B1E17] rounded-xl pl-10 pr-4 py-3 text-xs font-medium text-[#2B1E17] placeholder-[#5A4D41]/40 focus:outline-none transition-all"
                  />
                </div>
              </div>

              <button
                type="submit"
                className="w-full bg-[#231F1C] hover:bg-[#4A533C] text-white py-3.5 rounded-xl text-xs font-bold uppercase tracking-[0.1em] transition-all shadow-md cursor-pointer mt-2"
              >
                {formMode === 'login' ? 'SIGN IN' : 'REGISTER NOW'}
              </button>
            </form>
          </div>

          {/* Footer Switching */}
          <div className="flex flex-col gap-2 border-t border-[#D2C7BA]/30 pt-4 text-xs">
            <div className="text-left text-[#5A4D41]/80">
              {formMode === 'login' ? (
                <span>
                  Belum memiliki akun?{' '}
                  <button
                    type="button"
                    onClick={() => {
                      setFormMode('register');
                      setError(null);
                    }}
                    className="text-[#2B1E17] font-bold hover:underline bg-[#E1D9CD]/40 px-1 py-0.5 rounded cursor-pointer"
                  >
                    Daftar Sekarang
                  </button>
                </span>
              ) : (
                <span>
                  Sudah memiliki akun?{' '}
                  <button
                    type="button"
                    onClick={() => {
                      setFormMode('login');
                      setError(null);
                    }}
                    className="text-[#2B1E17] font-bold hover:underline bg-[#E1D9CD]/40 px-1 py-0.5 rounded cursor-pointer"
                  >
                    Masuk Sekarang
                  </button>
                </span>
              )}
            </div>

            {/* Quick Demo Assist */}
            {formMode === 'login' && (
              <button
                onClick={handleQuickDemoFill}
                type="button"
                className="text-left text-[11px] text-[#4A533C] hover:underline font-mono"
              >
                💡 Gunakan Akun Demo (customer@email.com)
              </button>
            )}
          </div>
        </div>

        {/* Right Column: Visual Coffee & Plants ambience illustration */}
        <div className="hidden md:block relative h-full">
          <img
            src="https://images.unsplash.com/photo-1501339847302-ac426a4a7cbb?auto=format&fit=crop&q=80&w=1200"
            alt="OUTPOST premium espresso bar"
            className="w-full h-full object-cover"
            referrerPolicy="no-referrer"
          />
          {/* Subtle shade gradient overlay */}
          <div className="absolute inset-0 bg-gradient-to-t from-[#2B1E17]/30 to-transparent pointer-events-none" />
          
          <div className="absolute bottom-6 right-6 text-right bg-black/35 backdrop-blur-xs p-3.5 rounded-2xl text-white font-mono text-[10px] space-y-0.5 max-w-xs">
            <p className="font-bold">OUTPOST Coffee & Co.</p>
            <p className="opacity-75">Suhu Seduh Presisi 94°C</p>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
