'use client';

import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MessageSquare, Send, X, Bot, User, Sparkles, Minus } from 'lucide-react';
import { useAcademyStore } from '@/store/useAcademyStore';
import { AcademyMentor } from '@/types/academy';

interface MentorChatProps {
  courseId: string;
  mentor: AcademyMentor;
}

export default function MentorChat({ courseId, mentor }: MentorChatProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [message, setMessage] = useState('');
  const { getActiveMentorSession, sendMessageToMentor, startMentorSession } = useAcademyStore();
  const session = getActiveMentorSession(courseId, mentor.role);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isOpen && !session) {
      startMentorSession(courseId, mentor.role);
    }
  }, [isOpen, session, courseId, startMentorSession]);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [session?.messages]);

  const handleSend = async () => {
    if (!message.trim()) return;
    const currentMsg = message;
    setMessage('');
    await sendMessageToMentor(courseId, currentMsg, mentor.role);
  };

  return (
    <div className="fixed bottom-6 right-6 z-[100]">
      <AnimatePresence>
        {isOpen ? (
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            className="w-96 h-[500px] bg-gray-950 border border-gray-800 rounded-2xl shadow-2xl flex flex-col overflow-hidden"
          >
            {/* Header */}
            <div className="p-4 bg-gradient-to-r from-purple-900/50 to-blue-900/50 border-b border-gray-800 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="relative">
                  <div className="w-10 h-10 rounded-full bg-purple-500 flex items-center justify-center text-white font-bold overflow-hidden">
                    {mentor.avatar ? (
                        <img src={mentor.avatar} alt={mentor.name} className="w-full h-full object-cover" />
                    ) : (
                        mentor.name.charAt(0)
                    )}
                  </div>
                  <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-green-500 border-2 border-gray-950 rounded-full" />
                </div>
                <div>
                  <h4 className="text-sm font-bold text-white">{mentor.name}</h4>
                  <p className="text-[10px] text-purple-300 uppercase tracking-wider">{mentor.role} Mentor</p>
                </div>
              </div>
              <button 
                onClick={() => setIsOpen(false)}
                className="p-2 hover:bg-white/10 rounded-full transition-colors text-gray-400 hover:text-white"
              >
                <Minus className="w-4 h-4" />
              </button>
            </div>

            {/* Messages */}
            <div 
              ref={scrollRef}
              className="flex-1 overflow-y-auto p-4 space-y-4 scrollbar-hide bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] bg-fixed"
            >
              {session?.messages.map((msg) => (
                <motion.div 
                  initial={{ opacity: 0, x: msg.sender === 'user' ? 20 : -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  key={msg.id}
                  className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  <div className={`max-w-[85%] p-3 rounded-2xl text-sm ${
                    msg.sender === 'user' 
                      ? 'bg-purple-600 text-white rounded-tr-none shadow-lg shadow-purple-500/10' 
                      : 'bg-gray-800/90 backdrop-blur-sm text-gray-200 rounded-tl-none border border-gray-700 shadow-xl'
                  }`}>
                    {msg.content}
                    <div className={`text-[9px] mt-1 opacity-50 ${msg.sender === 'user' ? 'text-right' : 'text-left'}`}>
                        {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>

            {/* Input */}
            <div className="p-4 border-t border-gray-800 bg-gray-900/80 backdrop-blur-md">
              <div className="relative">
                <input
                  type="text"
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleSend()}
                  placeholder="Escribe un mensaje..."
                  className="w-full bg-gray-800 border border-gray-700 rounded-xl py-3 pl-4 pr-12 text-sm text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-500/50 transition-all border-opacity-50"
                />
                <button 
                  onClick={handleSend}
                  disabled={!message.trim()}
                  className="absolute right-2 top-1/2 -translate-y-1/2 p-2 bg-gradient-to-br from-purple-600 to-blue-600 hover:from-purple-500 hover:to-blue-500 disabled:opacity-50 disabled:grayscale rounded-lg text-white transition-all shadow-lg"
                >
                  <Send className="w-4 h-4" />
                </button>
              </div>
            </div>
          </motion.div>
        ) : (
          <motion.button
            whileHover={{ scale: 1.1, rotate: 5 }}
            whileTap={{ scale: 0.9 }}
            onClick={() => setIsOpen(true)}
            className="w-16 h-16 bg-gradient-to-br from-purple-600 to-blue-600 rounded-full flex items-center justify-center text-white shadow-2xl shadow-purple-500/40 group relative"
          >
            <div className="absolute inset-0 rounded-full bg-purple-500 animate-ping opacity-20 group-hover:hidden" />
            <MessageSquare className="w-8 h-8" />
            <div className="absolute -top-1 -right-1 bg-pink-500 w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold border-2 border-gray-950 animate-bounce">
                1
            </div>
          </motion.button>
        )}
      </AnimatePresence>
    </div>
  );
}
