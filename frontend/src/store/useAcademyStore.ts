import { create } from 'zustand';
import type { 
  AcademyState, 
  Course, 
  UserProgress, 
  Lesson,
  MentorSession,
  MentorMessage 
} from '@/types/academy';

// Datos de ejemplo para cursos iniciales
const SAMPLE_COURSES: Course[] = [
  {
    id: 'intro-filmmaking',
    title: 'Introducción al Cine con IA',
    slug: 'intro-filmmaking',
    description: 'Aprende los fundamentos del cine y cómo potenciarlos con inteligencia artificial.',
    thumbnail: '/images/courses/intro-filmmaking.jpg',
    instructor: {
      name: 'Ana García',
      avatar: '/images/instructors/ana.jpg',
      bio: 'Directora de cine con 15 años de experiencia y pionera en el uso de IA.'
    },
    modules: [
      {
        id: 'mod-1',
        title: 'Fundamentos del Lenguaje Cinematográfico',
        description: 'Entiende los básicos de la narrativa visual.',
        order: 1,
        lessons: [
          {
            id: 'lesson-1-1',
            title: '¿Qué es el lenguaje cinematográfico?',
            description: 'Introducción a los elementos visuales del cine.',
            type: 'video',
            duration: 15,
            videoUrl: 'https://example.com/video1.mp4',
            order: 1,
            isCompleted: false,
            isLocked: false
          },
          {
            id: 'lesson-1-2',
            title: 'Planos y ángulos de cámara',
            description: 'Domina los diferentes tipos de planos.',
            type: 'interactive',
            duration: 20,
            content: '# Planos y Ángulos\n\nContenido interactivo sobre planos...',
            order: 2,
            isCompleted: false,
            isLocked: true
          },
          {
            id: 'lesson-1-3',
            title: 'Quiz: Elementos Visuales',
            description: 'Pon a prueba tu conocimiento.',
            type: 'quiz',
            duration: 10,
            quizQuestions: [
              {
                id: 'q1',
                question: '¿Qué plano muestra el rostro completo del personaje?',
                options: ['Primer plano', 'Plano medio', 'Plano general', 'Plano detalle'],
                correctAnswer: 1,
                explanation: 'El plano medio muestra desde la cintura hacia arriba.'
              }
            ],
            order: 3,
            isCompleted: false,
            isLocked: true
          }
        ]
      },
      {
        id: 'mod-2',
        title: 'IA en Pre-producción',
        description: 'Usa IA para generar ideas y guiones.',
        order: 2,
        lessons: []
      }
    ],
    level: 'beginner',
    estimatedDuration: 8,
    enrolledCount: 1250,
    rating: 4.8,
    tags: ['cine', 'ia', 'principiantes', 'narrativa'],
    isFree: true,
    learningObjectives: [
      'Comprender los fundamentos del lenguaje cinematográfico',
      'Aplicar técnicas de narrativa visual',
      'Utilizar herramientas de IA en pre-producción'
    ]
  },
  {
    id: 'advanced-color-grading',
    title: 'Color Grading Profesional',
    slug: 'advanced-color-grading',
    description: 'Domina el arte del color grading con DaVinci Resolve y IA.',
    thumbnail: '/images/courses/color-grading.jpg',
    instructor: {
      name: 'Carlos Mendoza',
      avatar: '/images/instructors/carlos.jpg',
      bio: 'Colorista premiado en festivales internacionales.'
    },
    modules: [],
    level: 'advanced',
    estimatedDuration: 12,
    enrolledCount: 680,
    rating: 4.9,
    tags: ['color', 'davinci', 'postproducción', 'avanzado'],
    isFree: false,
    price: 49.99,
    learningObjectives: []
  }
];

interface AcademyActions {
  // Cursos
  loadCourses: () => Promise<void>;
  getCourseById: (courseId: string) => Course | undefined;
  
  // Progreso
  enrollInCourse: (courseId: string) => void;
  markLessonComplete: (courseId: string, lessonId: string) => void;
  updateQuizScore: (courseId: string, lessonId: string, score: number) => void;
  setCurrentLesson: (courseId: string, lessonId: string) => void;
  getCourseProgress: (courseId: string) => number; // porcentaje
  
  // Mentor
  startMentorSession: (courseId: string) => void;
  addMentorMessage: (sessionId: string, message: Omit<MentorMessage, 'id' | 'timestamp'>) => void;
  sendMessageToMentor: (courseId: string, message: string, role: MentorRole) => Promise<void>;
  getActiveMentorSession: (courseId: string) => MentorSession | null;
  
  // Utilidades
  resetProgress: (courseId: string) => void;
}

type AcademyStore = AcademyState & AcademyActions;

export const useAcademyStore = create<AcademyStore>((set, get) => ({
  // Estado inicial
  courses: [],
  userProgress: {},
  mentorSessions: {},
  activeCourseId: null,
  activeLessonId: null,
  isLoading: false,
  error: null,

  // Acciones - Cursos
  loadCourses: async () => {
    set({ isLoading: true, error: null });
    try {
      await new Promise(resolve => setTimeout(resolve, 500));
      set({ 
        courses: SAMPLE_COURSES,
        isLoading: false 
      });
    } catch (error) {
      set({ 
        error: 'Error al cargar cursos',
        isLoading: false 
      });
    }
  },

  getCourseById: (courseId: string) => {
    return get().courses.find(c => c.id === courseId);
  },

  // Acciones - Progreso
  enrollInCourse: (courseId: string) => {
    const course = get().getCourseById(courseId);
    if (!course) return;

    const progress: UserProgress = {
      courseId,
      completedLessons: [],
      currentLessonId: course.modules[0]?.lessons[0]?.id || '',
      quizScores: {},
      startedAt: new Date(),
      lastAccessedAt: new Date()
    };

    set((state) => ({
      userProgress: {
        ...state.userProgress,
        [courseId]: progress
      },
      activeCourseId: courseId
    }));
  },

  markLessonComplete: (courseId: string, lessonId: string) => {
    set((state) => {
      const progress = state.userProgress[courseId];
      if (!progress) return state;

      const completedLessons = Array.from(new Set([
        ...progress.completedLessons,
        lessonId
      ]));

      return {
        userProgress: {
          ...state.userProgress,
          [courseId]: {
            ...progress,
            completedLessons,
            lastAccessedAt: new Date()
          }
        }
      };
    });
  },

  updateQuizScore: (courseId: string, lessonId: string, score: number) => {
    set((state) => {
      const progress = state.userProgress[courseId];
      if (!progress) return state;

      return {
        userProgress: {
          ...state.userProgress,
          [courseId]: {
            ...progress,
            quizScores: {
              ...progress.quizScores,
              [lessonId]: score
            },
            lastAccessedAt: new Date()
          }
        }
      };
    });
  },

  setCurrentLesson: (courseId: string, lessonId: string) => {
    set({
      activeCourseId: courseId,
      activeLessonId: lessonId,
      userProgress: {
        ...get().userProgress,
        [courseId]: {
          ...get().userProgress[courseId],
          currentLessonId: lessonId,
          lastAccessedAt: new Date()
        }
      }
    });
  },

  getCourseProgress: (courseId: string) => {
    const progress = get().userProgress[courseId];
    const course = get().getCourseById(courseId);
    
    if (!progress || !course) return 0;

    const totalLessons = course.modules.reduce(
      (sum, module) => sum + module.lessons.length, 
      0
    );

    if (totalLessons === 0) return 0;

    return Math.round((progress.completedLessons.length / totalLessons) * 100);
  },

  // Acciones - Mentor
  startMentorSession: (courseId: string) => {
    const existing = get().mentorSessions[courseId];
    if (existing) return;

    const session: MentorSession = {
      id: `session-${Date.now()}`,
      courseId,
      messages: [
        {
          id: 'welcome',
          sender: 'mentor',
          content: '¡Hola! Soy tu mentor para este curso. ¿En qué puedo ayudarte hoy?',
          timestamp: new Date()
        }
      ],
      isActive: true,
      createdAt: new Date()
    };

    set((state) => ({
      mentorSessions: {
        ...state.mentorSessions,
        [courseId]: session
      }
    }));
  },

  addMentorMessage: (sessionId: string, message: Omit<MentorMessage, 'id' | 'timestamp'>) => {
    const newMessage: MentorMessage = {
      ...message,
      id: `msg-${Date.now()}`,
      timestamp: new Date()
    };

    set((state) => {
      const newSessions = { ...state.mentorSessions };
      for (const courseId in newSessions) {
        if (newSessions[courseId].id === sessionId) {
          newSessions[courseId] = {
            ...newSessions[courseId],
            messages: [...newSessions[courseId].messages, newMessage]
          };
        }
      }
      return { mentorSessions: newSessions };
    });
  },

  sendMessageToMentor: async (courseId: string, message: string, role: string) => {
    const session = get().mentorSessions[courseId];
    if (!session) return;

    // 1. Añadir mensaje del usuario localmente
    get().addMentorMessage(session.id, {
      sender: 'user',
      content: message
    });

    try {
      // 2. Llamar al backend
      const apiBase = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';
      const response = await fetch(`${apiBase}/api/v1/academy/mentor/chat`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message,
          role,
          history: session.messages.map(m => ({
            role: m.sender === 'user' ? 'user' : 'assistant',
            content: m.content
          })),
          user_id: 'guest'
        })
      });

      if (!response.ok) throw new Error('Error en la respuesta del mentor');

      const data = await response.json();

      // 3. Añadir respuesta del mentor
      get().addMentorMessage(session.id, {
        sender: 'mentor',
        content: data.response
      });
    } catch (error) {
      console.error('Error enviando mensaje al mentor:', error);
      get().addMentorMessage(session.id, {
        sender: 'mentor',
        content: 'Perdona, he tenido un problema técnico. ¿Podrías repetirme eso?'
      });
    }
  },

  getActiveMentorSession: (courseId: string) => {
    return get().mentorSessions[courseId] || null;
  },

  // Utilidades
  resetProgress: (courseId: string) => {
    set((state) => {
      const newProgress = { ...state.userProgress };
      delete newProgress[courseId];
      return { userProgress: newProgress };
    });
  }
}));
