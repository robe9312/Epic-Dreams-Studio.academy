'use client';

import React, { useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { useAcademyStore } from '@/store/useAcademyStore';
// Bulletproof relative path as fallback if alias fails during build
// import { useAcademyStore } from '../../../../store/useAcademyStore';
import { 
  Play, CheckCircle, Lock, ChevronDown, ChevronRight, 
  FileText, HelpCircle, Film, ArrowLeft, Award 
} from 'lucide-react';
import MentorChat from '@/components/academy/MentorChat';
import { AcademyMentor } from '@/types/academy';

const LessonIcon = ({ type }: { type: string }) => {
  switch (type) {
    case 'video':
      return <Play className="w-4 h-4" />;
    case 'text':
      return <FileText className="w-4 h-4" />;
    case 'quiz':
      return <HelpCircle className="w-4 h-4" />;
    case 'project':
      return <Film className="w-4 h-4" />;
    default:
      return <Play className="w-4 h-4" />;
  }
};

export default function CourseDetailPage() {
  const params = useParams();
  const router = useRouter();
  const courseId = params.courseId as string;
  
  const { 
    getCourseById, 
    userProgress, 
    enrollInCourse, 
    markLessonComplete,
    setCurrentLesson,
    getCourseProgress
  } = useAcademyStore();

  const course = getCourseById(courseId);
  const progress = userProgress[courseId];
  const [expandedModule, setExpandedModule] = useState<string | null>('mod-1');
  const [activeLesson, setActiveLesson] = useState<string | null>(null);

  if (!course) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-950 via-purple-950 to-gray-950 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-white mb-4">Curso no encontrado</h2>
          <button
            onClick={() => router.push('/academy')}
            className="px-6 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg"
          >
            Volver a la Academy
          </button>
        </div>
      </div>
    );
  }

  const isEnrolled = !!progress;
  const courseProgress = isEnrolled ? getCourseProgress(courseId) : 0;

  const handleEnroll = () => {
    enrollInCourse(courseId);
  };

  const handleLessonClick = (lessonId: string, isLocked: boolean) => {
    if (isLocked || !isEnrolled) return;
    
    setCurrentLesson(courseId, lessonId);
    setActiveLesson(lessonId);
  };

  const toggleModule = (moduleId: string) => {
    setExpandedModule(expandedModule === moduleId ? null : moduleId);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-950 via-purple-950 to-gray-950">
      {/* Header del Curso */}
      <div className="relative h-80 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-purple-900/80 to-blue-900/80" />
        <div className="absolute inset-0 bg-gradient-to-t from-gray-950 via-transparent to-transparent" />
        
        <div className="relative max-w-7xl mx-auto px-6 h-full flex items-end pb-12">
          <button
            onClick={() => router.push('/academy')}
            className="absolute top-6 left-6 flex items-center gap-2 text-gray-300 hover:text-white transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
            <span>Volver</span>
          </button>

          <div className="flex-1">
            <div className="flex items-center gap-3 mb-4">
              <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                course.level === 'beginner' ? 'bg-green-500/20 text-green-400' :
                course.level === 'intermediate' ? 'bg-yellow-500/20 text-yellow-400' :
                'bg-red-500/20 text-red-400'
              }`}>
                {course.level === 'beginner' ? 'Principiante' :
                 course.level === 'intermediate' ? 'Intermedio' : 'Avanzado'}
              </span>
              
              {course.isFree && (
                <span className="px-3 py-1 rounded-full text-xs font-semibold bg-green-500/20 text-green-400">
                  GRATIS
                </span>
              )}
            </div>

            <h1 className="text-5xl font-bold text-white mb-4">
              {course.title}
            </h1>
            
            <p className="text-xl text-gray-300 mb-6 max-w-3xl">
              {course.description}
            </p>

            <div className="flex items-center gap-6 text-gray-400">
              <div className="flex items-center gap-2">
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-purple-500 to-blue-500 flex items-center justify-center text-white font-bold">
                  {course.instructor.name.charAt(0)}
                </div>
                <div>
                  <p className="text-white font-medium">{course.instructor.name}</p>
                  <p className="text-sm">Instructor</p>
                </div>
              </div>

              <div className="h-12 w-px bg-gray-700" />

              <div>
                <p className="text-2xl font-bold text-white">{course.estimatedDuration}h</p>
                <p className="text-sm">Duración</p>
              </div>

              <div>
                <p className="text-2xl font-bold text-white">{course.modules.length} módulos</p>
                <p className="text-sm">Contenido</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Contenido Principal */}
      <div className="max-w-7xl mx-auto px-6 py-12">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Módulos y Lecciones */}
          <div className="lg:col-span-2 space-y-6">
            <h2 className="text-2xl font-bold text-white mb-6">Contenido del Curso</h2>
            
            {course.modules.map((module, moduleIndex) => (
              <motion.div
                key={module.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: moduleIndex * 0.1 }}
                className="bg-gray-900/50 backdrop-blur-sm rounded-xl border border-gray-700/50 overflow-hidden"
              >
                <button
                  onClick={() => toggleModule(module.id)}
                  className="w-full px-6 py-4 flex items-center justify-between hover:bg-gray-800/50 transition-colors"
                >
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-purple-500 to-blue-500 flex items-center justify-center text-white font-bold">
                      {moduleIndex + 1}
                    </div>
                    <div className="text-left">
                      <h3 className="text-lg font-bold text-white">{module.title}</h3>
                      <p className="text-sm text-gray-400">{module.lessons.length} lecciones</p>
                    </div>
                  </div>
                  
                  {expandedModule === module.id ? (
                    <ChevronDown className="w-5 h-5 text-gray-400" />
                  ) : (
                    <ChevronRight className="w-5 h-5 text-gray-400" />
                  )}
                </button>

                {expandedModule === module.id && (
                  <div className="border-t border-gray-700/50">
                    {module.lessons.map((lesson, lessonIndex) => {
                      const isCompleted = progress?.completedLessons.includes(lesson.id);
                      const isLocked = !isEnrolled || (lessonIndex > 0 && !progress?.completedLessons.includes(module.lessons[lessonIndex - 1]?.id));
                      
                      return (
                        <div
                          key={lesson.id}
                          onClick={() => handleLessonClick(lesson.id, isLocked)}
                          className={`px-6 py-4 flex items-center gap-4 hover:bg-gray-800/30 transition-colors cursor-pointer ${
                            activeLesson === lesson.id ? 'bg-purple-900/20' : ''
                          } ${isLocked ? 'opacity-50 cursor-not-allowed' : ''}`}
                        >
                          <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${
                            isCompleted ? 'bg-green-500/20 text-green-400' :
                            isLocked ? 'bg-gray-700 text-gray-500' :
                            'bg-purple-500/20 text-purple-400'
                          }`}>
                            {isCompleted ? (
                              <CheckCircle className="w-4 h-4" />
                            ) : isLocked ? (
                              <Lock className="w-4 h-4" />
                            ) : (
                              <LessonIcon type={lesson.type} />
                            )}
                          </div>

                          <div className="flex-1">
                            <h4 className={`font-medium ${
                              isCompleted ? 'text-green-400' :
                              isLocked ? 'text-gray-500' :
                              'text-white'
                            }`}>
                              {lesson.title}
                            </h4>
                            <div className="flex items-center gap-3 text-xs text-gray-400 mt-1">
                              <span className="capitalize">{lesson.type}</span>
                              {lesson.duration && (
                                <>
                                  <span>•</span>
                                  <span>{lesson.duration} min</span>
                                </>
                              )}
                            </div>
                          </div>

                          {!isLocked && !isCompleted && (
                            <Play className="w-5 h-5 text-purple-400" />
                          )}
                        </div>
                      );
                    })}
                  </div>
                )}
              </motion.div>
            ))}
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Progreso */}
            {isEnrolled && (
              <div className="bg-gray-900/50 backdrop-blur-sm rounded-xl border border-gray-700/50 p-6 sticky top-6">
                <h3 className="text-lg font-bold text-white mb-4">Tu Progreso</h3>
                
                <div className="mb-4">
                  <div className="flex justify-between text-sm mb-2">
                    <span className="text-gray-400">Completado</span>
                    <span className="text-purple-400 font-bold">{courseProgress}%</span>
                  </div>
                  <div className="h-3 bg-gray-700 rounded-full overflow-hidden">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${courseProgress}%` }}
                      transition={{ duration: 0.5 }}
                      className="h-full bg-gradient-to-r from-purple-500 to-blue-500"
                    />
                  </div>
                </div>

                <div className="space-y-3 text-sm text-gray-400">
                  <div className="flex justify-between">
                    <span>Lecciones completadas</span>
                    <span className="text-white">
                      {progress?.completedLessons.length || 0}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span>Puntuación promedio</span>
                    <span className="text-white">
                      {Object.keys(progress?.quizScores || {}).length > 0 
                        ? Math.round(Object.values(progress!.quizScores).reduce((a, b) => a + b, 0) / Object.values(progress!.quizScores).length)
                        : 0}%
                    </span>
                  </div>
                </div>

                <button
                  onClick={() => router.push('/academy/mentor')}
                  className="w-full mt-6 py-3 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white rounded-lg font-medium transition-all"
                >
                  Consultar con Mentor IA
                </button>
              </div>
            )}

            {/* CTA de Inscripción */}
            {!isEnrolled && (
              <div className="bg-gray-900/50 backdrop-blur-sm rounded-xl border border-gray-700/50 p-6 sticky top-6">
                <div className="mb-6">
                  {course.isFree ? (
                    <p className="text-3xl font-bold text-white">GRATIS</p>
                  ) : (
                    <>
                      <p className="text-3xl font-bold text-white">${course.price}</p>
                      <p className="text-sm text-gray-400 mt-1">Pago único</p>
                    </>
                  )}
                </div>

                <button
                  onClick={handleEnroll}
                  className="w-full py-3 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white rounded-lg font-medium transition-all mb-4"
                >
                  {course.isFree ? 'Comenzar Gratis' : 'Comprar Curso'}
                </button>

                <div className="space-y-3 text-sm text-gray-400">
                  <div className="flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-green-400" />
                    <span>Acceso de por vida</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-green-400" />
                    <span>Certificado de completación</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-green-400" />
                    <span>Soporte de mentor IA</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-green-400" />
                    <span>Recursos descargables</span>
                  </div>
                </div>
              </div>
            )}

            {/* Objetivos de Aprendizaje */}
            <div className="bg-gray-900/50 backdrop-blur-sm rounded-xl border border-gray-700/50 p-6">
              <h3 className="text-lg font-bold text-white mb-4">Qué aprenderás</h3>
              <ul className="space-y-3">
                {course.learningObjectives.map((objective, index) => (
                  <li key={index} className="flex items-start gap-3 text-sm text-gray-300">
                    <Award className="w-4 h-4 text-purple-400 mt-0.5 flex-shrink-0" />
                    <span>{objective}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </div>

      {/* Mentor Chat */}
      {isEnrolled && (
        <MentorChat 
          courseId={courseId} 
          mentor={{
            id: 'mentor-1',
            name: course.instructor.name,
            role: 'director', // Default role for main instructor
            avatar: course.instructor.avatar,
            bio: course.instructor.bio,
            agentId: 'director-agent',
            status: 'idle'
          }} 
        />
      )}
    </div>
  );
}
