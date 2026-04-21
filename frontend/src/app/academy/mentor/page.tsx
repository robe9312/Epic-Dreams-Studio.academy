'use client';

import React, { useState, useRef, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Send, Bot, User, Sparkles, X } from 'lucide-react';
import { useAcademyStore } from '@/stores/useAcademyStore';

interface Message {
  id: string;
  sender: 'user' | 'ai';
  content: string;
  timestamp: Date;
}

export default function MentorPage() {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      sender: 'ai',
      content: '¡Hola! Soy tu mentor IA de Epic Dreams Academy. ¿En qué puedo ayudarte hoy con tu aprendizaje de cine?',
      timestamp: new Date()
    }
  ]);
  const [inputValue, setInputValue] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const simulateAIResponse = async (userMessage: string) => {
    setIsTyping(true);
    
    // Simular tiempo de "pensamiento" de la IA
    await new Promise(resolve => setTimeout(resolve, 1000 + Math.random() * 1000));
    
    // Respuestas contextuales básicas (en producción esto iría a la API de IA)
    let response = '';
    const lowerMessage = userMessage.toLowerCase();
    
    if (lowerMessage.includes('plano') || lowerMessage.includes('cámara')) {
      response = 'Los planos cinematográficos son fundamentales para contar historias. Te recomiendo:\n\n1. **Plano General**: Muestra el entorno completo\n2. **Plano Medio**: Desde la cintura hacia arriba\n3. **Primer Plano**: Rostro completo\n4. **Plano Detalle**: Parte específica del cuerpo u objeto\n\n¿Te gustaría que profundicemos en alguno?';
    } else if (lowerMessage.includes('iluminación') || lowerMessage.includes('luz')) {
      response = 'La iluminación es clave en el cine. Los tres puntos básicos son:\n\n🎬 **Luz Principal (Key Light)**: La fuente principal\n💡 **Luz de Relleno (Fill Light)**: Suaviza sombras\n✨ **Luz Trasera (Back Light)**: Separa al sujeto del fondo\n\n¿Quieres aprender sobre esquemas de iluminación específicos?';
    } else if (lowerMessage.includes('guión') || lowerMessage.includes('historia')) {
      response = 'Para escribir un buen guión, sigue esta estructura:\n\n**Acto 1** - Presentación (25%)\n- Presenta personajes y mundo\n- Incidente incitador\n\n**Acto 2** - Confrontación (50%)\n- Obstáculos crecientes\n- Punto medio\n\n**Acto 3** - Resolución (25%)\n- Clímax\n- Desenlace\n\n¿Te ayudo con alguna escena específica?';
    } else if (lowerMessage.includes('edición') || lowerMessage.includes('cortar')) {
      response = 'La edición es donde la película realmente se hace. Consejos clave:\n\n✂️ **Ritmo**: Varía la duración de planos\n🎯 **Continuidad**: Mantén coherencia visual\n🎵 **Música y sonido**: Guía las emociones\n⚡ **Transiciones**: Úsalas con propósito\n\n¿Hay alguna técnica de edición que quieras dominar?';
    } else if (lowerMessage.includes('color') || lowerMessage.includes('grading')) {
      response = 'El color grading transforma completamente una película:\n\n🎨 **Corrección de color**: Balance y exposición\n🌈 **Grading creativo**: Estilo y atmósfera\n📊 **Curvas y ruedas**: Herramientas principales\n\nRecursos recomendados:\n- DaVinci Resolve (gratis)\n- Tutoriales de Color Grading Central\n\n¿Quieres ejercicios prácticos?';
    } else if (lowerMessage.includes('ia') || lowerMessage.includes('inteligencia artificial')) {
      response = '¡La IA está revolucionando el cine! En Epic Dreams Studio puedes:\n\n🤖 **Generar storyboards** con FLUX.1\n🎵 **Crear música** con MusicGen\n📝 **Desarrollar guiones** con Llama 3.3\n🎬 **Producir videos** con modelos de video IA\n\n¿Quieres que te muestre cómo usar alguna herramienta específica?';
    } else if (lowerMessage.includes('gracias') || lowerMessage.includes('ayuda')) {
      response = '¡Es un placer ayudarte! 🎬\n\nRecuerda que estoy aquí para:\n- Resolver dudas de teoría cinematográfica\n- Explicar técnicas específicas\n- Recomendarte recursos\n- Guiarte en tus proyectos\n\n¿En qué más puedo asistirte?';
    } else {
      response = 'Interesante pregunta. Déjame darte una respuesta útil:\n\nEn cine, cada decisión creativa debe servir a la historia. Ya sea elección de planos, iluminación, edición o color, pregúntate siempre:\n\n❓ **¿Esto ayuda a contar mejor la historia?**\n❓ **¿Esto transmite la emoción correcta?**\n❓ **¿Esto mantiene la coherencia visual?**\n\n¿Puedes contarme más sobre qué estás trabajando específicamente?';
    }
    
    setIsTyping(false);
    
    setMessages(prev => [...prev, {
      id: Date.now().toString(),
      sender: 'ai',
      content: response,
      timestamp: new Date()
    }]);
  };

  const handleSend = async () => {
    if (!inputValue.trim()) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      sender: 'user',
      content: inputValue.trim(),
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInputValue('');
    
    await simulateAIResponse(userMessage.content);
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
      {/* Header */}
      <div className="border-b border-gray-800/50 backdrop-blur-sm sticky top-0 z-50 bg-gray-950/80">
        <div className="max-w-5xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-purple-500 to-blue-500 flex items-center justify-center">
                <Bot className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-white">Mentor IA</h1>
                <p className="text-sm text-gray-400">Tu guía personal de cine</p>
              </div>
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

      {/* Área de Mensajes */}
      <div className="flex-1 overflow-y-auto">
        <div className="max-w-5xl mx-auto px-6 py-8">
          <div className="space-y-6">
            {messages.map((message) => (
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
                      ? 'bg-gray-800/80 backdrop-blur-sm text-gray-100 rounded-tl-none'
                      : 'bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-tr-none'
                  }`}>
                    <p className="whitespace-pre-wrap text-sm leading-relaxed">
                      {message.content}
                    </p>
                  </div>
                  <p className="text-xs text-gray-500 mt-2 px-2">
                    {message.timestamp.toLocaleTimeString([], { 
                      hour: '2-digit', 
                      minute: '2-digit' 
                    })}
                  </p>
                </div>
              </motion.div>
            ))}

            {/* Indicador de escritura */}
            {isTyping && (
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
              disabled={!inputValue.trim() || isTyping}
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
