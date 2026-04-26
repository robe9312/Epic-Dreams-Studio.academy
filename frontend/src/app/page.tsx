'use client';

import { motion } from 'framer-motion';
import Link from 'next/link';

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-[#050505] text-white selection:bg-red-500/30 font-sans overflow-hidden relative">
      {/* Cinematic Background */}
      <div className="absolute inset-0 z-0">
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-[#050505]/80 to-[#050505]" />
        <div 
          className="absolute inset-0 opacity-20"
          style={{ 
            backgroundImage: 'radial-gradient(circle at 50% 50%, #333 1px, transparent 1px)',
            backgroundSize: '40px 40px'
          }} 
        />
        {/* Anamorphic Flare Effect */}
        <div className="absolute top-1/4 -left-20 w-[150%] h-[1px] bg-gradient-to-r from-transparent via-red-500/20 to-transparent blur-sm rotate-12" />
      </div>

      <main className="relative z-10 container mx-auto px-6 pt-32 pb-20 flex flex-col items-center justify-center min-h-screen text-center">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          className="space-y-6 max-w-4xl"
        >
          <motion.span 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
            className="text-[10px] uppercase tracking-[0.4em] text-red-500 font-bold mb-4 block"
          >
            V2.0 Cinematic Intelligence
          </motion.span>
          
          <h1 className="text-6xl md:text-8xl font-serif italic tracking-tighter leading-none mb-8">
            Epic <span className="text-gray-500">Dreams</span> Studio
          </h1>
          
          <p className="text-lg md:text-xl text-gray-400 max-w-2xl mx-auto leading-relaxed mb-12 font-light">
            Donde la inteligencia artificial se encuentra con la dirección cinematográfica. 
            Crea, orquesta y visualiza tus ideas con precisión técnica de producción.
          </p>

          <div className="flex flex-col md:flex-row gap-6 justify-center items-center">
            <Link href="/studio">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="group relative px-10 py-4 bg-white text-black font-bold text-xs tracking-widest uppercase rounded-full overflow-hidden transition-all hover:bg-red-500 hover:text-white"
              >
                Enter the Studio
                <span className="absolute inset-0 bg-red-500 translate-y-full group-hover:translate-y-0 transition-transform duration-300 -z-10" />
              </motion.button>
            </Link>

            <Link href="/academy">
              <motion.button
                whileHover={{ scale: 1.05, borderColor: '#ef4444' }}
                whileTap={{ scale: 0.95 }}
                className="px-10 py-4 border border-white/20 text-white font-bold text-xs tracking-widest uppercase rounded-full transition-all"
              >
                Learn in Academy
              </motion.button>
            </Link>
          </div>
        </motion.div>

        {/* Footer info */}
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1 }}
          className="absolute bottom-12 flex space-x-12 text-[10px] text-gray-600 font-mono tracking-widest uppercase"
        >
          <div className="flex flex-col items-center">
            <span className="text-gray-400">Status</span>
            <span>Production Ready</span>
          </div>
          <div className="flex flex-col items-center">
            <span className="text-gray-400">Node</span>
            <span>Global Edge</span>
          </div>
          <div className="flex flex-col items-center">
            <span className="text-gray-400">Orchestrator</span>
            <span>Director v2</span>
          </div>
        </motion.div>
      </main>
    </div>
  );
}
