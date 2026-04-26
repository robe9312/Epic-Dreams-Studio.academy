'use client';

import { motion } from 'framer-motion';
import { signIn } from 'next-auth/react';
import { Github, Mail, Clapperboard, Sparkles } from 'lucide-react';
import Link from 'next/link';

export default function LoginPage() {
  return (
    <div className="min-h-screen bg-[#050505] text-white flex items-center justify-center p-6 relative overflow-hidden selection:bg-red-500/30">
      {/* Background Cinematic Effects */}
      <div className="absolute inset-0 z-0">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-red-900/10 blur-[120px] rounded-full animate-pulse" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[30%] h-[30%] bg-blue-900/10 blur-[100px] rounded-full" />
        <div 
          className="absolute inset-0 opacity-[0.03]"
          style={{ 
            backgroundImage: 'radial-gradient(circle at 2px 2px, white 1px, transparent 0)',
            backgroundSize: '40px 40px'
          }} 
        />
      </div>

      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, ease: "easeOut" }}
        className="w-full max-w-md bg-[#0a0a0a]/80 backdrop-blur-2xl border border-white/5 p-8 rounded-3xl shadow-2xl relative z-10"
      >
        <div className="text-center mb-10">
          <motion.div 
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="w-16 h-16 bg-red-600 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-lg shadow-red-600/20 rotate-3"
          >
            <Clapperboard className="text-white w-8 h-8" />
          </motion.div>
          
          <h1 className="text-3xl font-serif italic tracking-tight mb-2">
            Epic <span className="text-gray-500">Dreams</span>
          </h1>
          <p className="text-xs text-gray-400 uppercase tracking-[0.3em] font-medium">
            Acceso al Estudio Soberano
          </p>
        </div>

        <div className="space-y-4">
          <motion.button
            whileHover={{ scale: 1.02, backgroundColor: '#111' }}
            whileTap={{ scale: 0.98 }}
            onClick={() => signIn('github', { callbackUrl: '/studio' })}
            className="w-full flex items-center justify-center gap-3 bg-[#0f0f0f] border border-white/10 py-3.5 rounded-xl text-sm font-semibold hover:border-red-500/50 transition-all group"
          >
            <Github className="w-5 h-5 group-hover:text-red-500 transition-colors" />
            Continuar con GitHub
          </motion.button>

          <motion.button
            whileHover={{ scale: 1.02, backgroundColor: '#111' }}
            whileTap={{ scale: 0.98 }}
            onClick={() => signIn('google', { callbackUrl: '/studio' })}
            className="w-full flex items-center justify-center gap-3 bg-[#0f0f0f] border border-white/10 py-3.5 rounded-xl text-sm font-semibold hover:border-red-500/50 transition-all group"
          >
            <svg className="w-5 h-5 group-hover:text-red-500 transition-colors" viewBox="0 0 24 24" fill="currentColor">
               <path d="M12.48 10.92v3.28h7.84c-.24 1.84-1.96 5.4-7.84 5.4-5.08 0-9.24-4.2-9.24-9.36s4.16-9.36 9.24-9.36c2.88 0 4.8 1.2 5.92 2.28l2.6-2.52C19.44 1.92 16.24 0 12.48 0 5.6 0 0 5.6 0 12.48s5.6 12.48 12.48 12.48c7.16 0 11.92-5.04 11.92-12.12 0-.84-.08-1.48-.2-2.12h-11.72z"/>
            </svg>
            Continuar con Google
          </motion.button>

          <div className="relative my-8">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-white/5"></div>
            </div>
            <div className="relative flex justify-center text-[10px] uppercase tracking-widest text-gray-600 bg-[#0a0a0a]/80 px-2">
              O con acceso de invitado
            </div>
          </div>

          <Link href="/studio">
            <motion.button
              whileHover={{ scale: 1.02, color: '#ef4444' }}
              whileTap={{ scale: 0.98 }}
              className="w-full py-3.5 rounded-xl text-[10px] uppercase font-bold tracking-[0.2em] text-gray-500 border border-transparent hover:border-white/5 transition-all"
            >
              Entrar como Invitado (Modo Lectura)
            </motion.button>
          </Link>
        </div>

        <div className="mt-10 text-center">
          <p className="text-[10px] text-gray-600 font-mono flex items-center justify-center gap-2">
            <Sparkles className="w-3 h-3 text-red-500" />
            V2.0 AI CINEMA ECOSYSTEM
          </p>
        </div>
      </motion.div>
      
      {/* Aesthetic Accents */}
      <div className="absolute bottom-10 left-10 text-[9px] text-gray-700 font-mono tracking-tighter hidden md:block">
        CORE_SYSTEM_ACCESS: SECURED<br />
        ENCRYPTION_LAYER: ACTIVE<br />
        AGENT_ORCHESTRATION: READY
      </div>
    </div>
  );
}
