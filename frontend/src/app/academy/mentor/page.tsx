'use client';

import React, { useState, useRef, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Send, Bot, User, Sparkles, X } from 'lucide-react';
import { useAcademyStore } from '@/store/useAcademyStore';

interface Message {
  id: string;
  sender: 'user' | 'ai';
  content: string;
  timestamp: Date;
}

export default function MentorPage() {
  const { 
    mentorSessions, 
    startMentorSession, 
    sendMessageToMentor,
    isLoading 
  } = useAcademyStore();
  
  const [inputValue, setInputValue] = useState('');
  const [activeRole, setActiveRole] = useState<'director' | 'writer' | 'dp' | 'editor'>('director');
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Initialize session if needed
  useEffect(() => {
    if (!mentorSessions['global']?.[activeRole]) {
      startMentorSession('global', activeRole);
    }
  }, [activeRole, mentorSessions, startMentorSession]);

  const currentSession = mentorSessions['global']?.[activeRole] || { messages: [], status: 'idle' };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [currentSession.messages]);

  const handleSend = async () => {
    if (!inputValue.trim() || currentSession.status === 'thinking') return;

    const message = inputValue.trim();
    setInputValue('');
    
    await sendMessageToMentor('global', activeRole, message);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const quickQuestions = [
    '¿Qué es un plano secuencia?',
    '¿Cómo ilumino una escena dramática?',
    '¿Estructura de un guión?',
    '¿Consejos de edición?',
    '¿Cómo usar IA en mi proyecto?'
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-950 via-purple-950 to-gray-950 flex flex-col">
      {/* Header with Role Switcher */}
      <div className="border-b border-gray-800/50 backdrop-blur-sm sticky top-0 z-50 bg-gray-950/80">
        <div className="max-w-5xl mx-auto px-6 py-4">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-purple-500 to-blue-500 flex items-center justify-center">
                <Bot className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-white">Mentor IA</h1>
                <p className="text-sm text-gray-400">Tu guía personal de cine</p>
              </div>
            </div>

            {/* Role Switcher */}
            <div className="flex bg-gray-900/50 p-1 rounded-lg border border-gray-800">
              {(['director', 'writer', 'dp', 'editor'] as const).map((role) => (
                <button
                  key={role}
                  onClick={() => setActiveRole(role)}
                  className={`px-3 py-1.5 rounded-md text-xs font-medium transition-all ${
                    activeRole === role
                      ? 'bg-purple-600 text-white shadow-lg'
                      : 'text-gray-400 hover:text-gray-200'
                  }`}
                >
                  {role.toUpperCase()}
                </button>
              ))}
            </div>
            
            <a
              href="/academy"
              className="px-4 py-2 text-gray-300 hover:text-white transition-colors flex items-center gap-2"
            >
              <X className="w-5 h-5" />
              <span className="hidden sm:inline">Cerrar</span>
            </a>
          </div>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto">
        <div className="max-w-5xl mx-auto px-6 py-8">
          <div className="space-y-6">
            {currentSession.messages.map((message) => (
              <motion.div
                key={message.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className={`flex items-start gap-4 ${
                  message.sender === 'user' ? 'flex-row-reverse' : ''
                }`}
              >
                {/* Avatar */}
                <div className={`w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0 ${
                  message.sender === 'ai' 
                    ? 'bg-gradient-to-br from-purple-500 to-blue-500' 
                    : 'bg-gradient-to-br from-gray-600 to-gray-700'
                }`}>
                  {message.sender === 'ai' ? (
                    <Bot className="w-5 h-5 text-white" />
                  ) : (
                    <User className="w-5 h-5 text-white" />
                  )}
                </div>

                {/* Mensaje */}
                <div className={`max-w-[80%] ${
                  message.sender === 'user' ? 'text-right' : ''
                }`}>
                  <div className={`inline-block px-5 py-3 rounded-2xl ${
                    message.sender === 'ai'
                      ? 'bg-gray-800/80 backdrop-blur-sm text-gray-100 rounded-tl-none border border-gray-700/50'
                      : 'bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-tr-none'
                  }`}>
                    <p className="whitespace-pre-wrap text-sm leading-relaxed">
                      {message.content}
                    </p>
                  </div>
                  <p className="text-xs text-gray-500 mt-2 px-2">
                    {new Date(message.timestamp).toLocaleTimeString([], { 
                      hour: '2-digit', 
                      minute: '2-digit' 
                    })}
                  </p>
                </div>
              </motion.div>
            ))}

            {/* Indicador de escritura */}
            {currentSession.status === 'thinking' && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex items-start gap-4"
              >
                <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-purple-500 to-blue-500 flex items-center justify-center">
                  <Bot className="w-5 h-5 text-white" />
                </div>
                <div className="bg-gray-800/80 backdrop-blur-sm px-5 py-3 rounded-2xl rounded-tl-none">
                  <div className="flex gap-2">
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                  </div>
                </div>
              </motion.div>
            )}

            <div ref={messagesEndRef} />
          </div>
        </div>
      </div>

      {/* Preguntas Rápidas */}
      {messages.length <= 2 && (
        <div className="px-6 pb-4">
          <div className="max-w-5xl mx-auto">
            <p className="text-sm text-gray-400 mb-3 flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-purple-400" />
              Preguntas frecuentes:
            </p>
            <div className="flex flex-wrap gap-2">
              {quickQuestions.map((question, index) => (
                <button
                  key={index}
                  onClick={() => {
                    setInputValue(question);
                    inputRef.current?.focus();
                  }}
                  className="px-4 py-2 bg-gray-800/50 hover:bg-gray-700/50 border border-gray-700 hover:border-purple-500/50 rounded-lg text-sm text-gray-300 hover:text-white transition-all"
                >
                  {question}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Input Area */}
      <div className="border-t border-gray-800/50 backdrop-blur-sm bg-gray-950/80 sticky bottom-0">
        <div className="max-w-5xl mx-auto px-6 py-4">
          <div className="flex items-center gap-4">
            <input
              ref={inputRef}
              type="text"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Escribe tu pregunta sobre cine..."
              className="flex-1 bg-gray-800/50 border border-gray-700 focus:border-purple-500 rounded-xl px-5 py-3 text-white placeholder-gray-500 outline-none transition-colors"
              disabled={isTyping}
            />
            <button
              onClick={handleSend}
              disabled={!inputValue.trim() || currentSession.status === 'thinking'}
              className="px-6 py-3 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 disabled:from-gray-700 disabled:to-gray-800 disabled:cursor-not-allowed text-white rounded-xl font-medium transition-all flex items-center gap-2"
            >
              <Send className="w-5 h-5" />
              <span className="hidden sm:inline">Enviar</span>
            </button>
          </div>
          <p className="text-xs text-gray-500 mt-3 text-center">
            El mentor IA puede cometer errores. Verifica información importante.
          </p>
        </div>
      </div>
    </div>
  );
}
