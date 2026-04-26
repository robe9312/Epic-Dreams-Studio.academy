'use client';

import React, { useEffect } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { useAcademyStore } from '@/store/useAcademyStore';
import { BookOpen, Play, Award, Clock, Users, Star, ChevronRight, Lock } from 'lucide-react';
import MentorChat from '@/components/academy/MentorChat';

const CourseCard = ({ course, progress }: { course: any; progress?: number }) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ scale: 1.02 }}
      className="bg-gradient-to-br from-gray-900/80 to-gray-800/80 backdrop-blur-sm rounded-xl overflow-hidden border border-gray-700/50 hover:border-purple-500/50 transition-all duration-300 group"
    >
      {/* Thumbnail */}
      <div className="relative h-48 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-t from-gray-900 via-transparent to-transparent z-10" />
        <div className="w-full h-full bg-gradient-to-br from-purple-600/20 to-blue-600/20 flex items-center justify-center">
          <BookOpen className="w-16 h-16 text-purple-400/50" />
        </div>
        
        {/* Badge de nivel */}
        <div className="absolute top-3 left-3 z-20">
          <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
            course.level === 'beginner' ? 'bg-green-500/20 text-green-400' :
            course.level === 'intermediate' ? 'bg-yellow-500/20 text-yellow-400' :
            'bg-red-500/20 text-red-400'
          }`}>
            {course.level === 'beginner' ? 'Principiante' :
             course.level === 'intermediate' ? 'Intermedio' : 'Avanzado'}
          </span>
        </div>

        {/* Badge de precio */}
        <div className="absolute top-3 right-3 z-20">
          {course.isFree ? (
            <span className="px-3 py-1 rounded-full text-xs font-semibold bg-green-500/20 text-green-400">
              GRATIS
            </span>
          ) : (
            <span className="px-3 py-1 rounded-full text-xs font-semibold bg-purple-500/20 text-purple-400">
              ${course.price}
            </span>
          )}
        </div>
      </div>

      {/* Contenido */}
      <div className="p-5">
        <h3 className="text-xl font-bold text-white mb-2 group-hover:text-purple-400 transition-colors">
          {course.title}
        </h3>
        
        <p className="text-gray-400 text-sm mb-4 line-clamp-2">
          {course.description}
        </p>

        {/* Instructor */}
        <div className="flex items-center gap-3 mb-4">
          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-purple-500 to-blue-500 flex items-center justify-center text-white text-sm font-bold">
            {course.instructor.name.charAt(0)}
          </div>
          <span className="text-gray-300 text-sm">{course.instructor.name}</span>
        </div>

        {/* Metadatos */}
        <div className="flex items-center gap-4 text-xs text-gray-400 mb-4">
          <div className="flex items-center gap-1">
            <Clock className="w-4 h-4" />
            <span>{course.estimatedDuration}h</span>
          </div>
          <div className="flex items-center gap-1">
            <Users className="w-4 h-4" />
            <span>{course.enrolledCount}</span>
          </div>
          <div className="flex items-center gap-1">
            <Star className="w-4 h-4 text-yellow-400 fill-yellow-400" />
            <span>{course.rating}</span>
          </div>
        </div>

        {/* Barra de progreso o CTA */}
        {progress !== undefined && progress > 0 ? (
          <div className="space-y-2">
            <div className="flex justify-between text-xs">
              <span className="text-gray-400">Progreso</span>
              <span className="text-purple-400 font-semibold">{progress}%</span>
            </div>
            <div className="h-2 bg-gray-700 rounded-full overflow-hidden">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${progress}%` }}
                transition={{ duration: 0.5, delay: 0.2 }}
                className="h-full bg-gradient-to-r from-purple-500 to-blue-500"
              />
            </div>
            <Link
              href={`/academy/courses/${course.id}`}
              className="block w-full py-2 px-4 bg-purple-600 hover:bg-purple-700 text-white text-center rounded-lg font-medium transition-colors mt-3"
            >
              Continuar aprendiendo
            </Link>
          </div>
        ) : (
          <Link
            href={`/academy/courses/${course.id}`}
            className="flex items-center justify-center gap-2 w-full py-2 px-4 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white rounded-lg font-medium transition-all group/btn"
          >
            <Play className="w-4 h-4" />
            <span>Comenzar curso</span>
            <ChevronRight className="w-4 h-4 group-hover/btn:translate-x-1 transition-transform" />
          </Link>
        )}
      </div>
    </motion.div>
  );
};

export default function AcademyDashboard() {
  const { courses, userProgress, loadCourses, isLoading } = useAcademyStore();

  useEffect(() => {
    loadCourses();
  }, [loadCourses]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-950 via-purple-950 to-gray-950 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-purple-500 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-gray-400">Cargando cursos...</p>
        </div>
      </div>
    );
  }

  const myCourses = Object.keys(userProgress).map(courseId => ({
    courseId,
    progress: courses.find(c => c.id === courseId) 
      ? useAcademyStore.getState().getCourseProgress(courseId)
      : 0
  }));

  const availableCourses = courses.filter(c => !userProgress[c.id]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-950 via-purple-950 to-gray-950">
      {/* Header */}
      <div className="border-b border-gray-800/50 backdrop-blur-sm sticky top-0 z-50 bg-gray-950/80">
        <div className="max-w-7xl mx-auto px-6 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-4xl font-bold bg-gradient-to-r from-purple-400 via-pink-400 to-blue-400 bg-clip-text text-transparent">
                Epic Dreams Academy
              </h1>
              <p className="text-gray-400 mt-2">
                Domina el arte del cine con inteligencia artificial
              </p>
            </div>
            
            <div className="flex items-center gap-4">
              <Link
                href="/studio"
                className="px-4 py-2 text-gray-300 hover:text-white transition-colors"
              >
                Ir al Studio
              </Link>
              <Link
                href="/academy/mentor"
                className="px-6 py-2 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white rounded-lg font-medium transition-all"
              >
                Mentor IA
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Contenido Principal */}
      <div className="max-w-7xl mx-auto px-6 py-12">
        {/* Mis Cursos */}
        {myCourses.length > 0 && (
          <section className="mb-16">
            <div className="flex items-center gap-3 mb-6">
              <Award className="w-6 h-6 text-purple-400" />
              <h2 className="text-2xl font-bold text-white">Mis Cursos</h2>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {myCourses.map(({ courseId, progress }) => {
                const course = courses.find(c => c.id === courseId);
                if (!course) return null;
                return (
                  <CourseCard 
                    key={courseId} 
                    course={course} 
                    progress={progress} 
                  />
                );
              })}
            </div>
          </section>
        )}

        {/* Todos los Cursos */}
        <section>
          <div className="flex items-center gap-3 mb-6">
            <BookOpen className="w-6 h-6 text-blue-400" />
            <h2 className="text-2xl font-bold text-white">Explorar Cursos</h2>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {availableCourses.map((course) => {
              const progress = userProgress[course.id] 
                ? useAcademyStore.getState().getCourseProgress(course.id)
                : undefined;
              
              return (
                <CourseCard 
                  key={course.id} 
                  course={course} 
                  progress={progress}
                />
              );
            })}
          </div>

          {availableCourses.length === 0 && (
            <div className="text-center py-16">
              <BookOpen className="w-16 h-16 text-gray-600 mx-auto mb-4" />
              <p className="text-gray-400 text-lg">
                ¡Has explorado todos los cursos disponibles!
              </p>
              <p className="text-gray-500 mt-2">
                Vuelve pronto para nuevos contenidos.
              </p>
            </div>
          )}
        </section>

        {/* Estadísticas */}
        <section className="mt-16 grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-gradient-to-br from-purple-900/30 to-purple-800/30 backdrop-blur-sm rounded-xl p-6 border border-purple-500/20">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-lg bg-purple-500/20 flex items-center justify-center">
                <Award className="w-6 h-6 text-purple-400" />
              </div>
              <div>
                <p className="text-gray-400 text-sm">Cursos Completados</p>
                <p className="text-3xl font-bold text-white">
                  {myCourses.filter(c => c.progress === 100).length}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-gradient-to-br from-blue-900/30 to-blue-800/30 backdrop-blur-sm rounded-xl p-6 border border-blue-500/20">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-lg bg-blue-500/20 flex items-center justify-center">
                <Clock className="w-6 h-6 text-blue-400" />
              </div>
              <div>
                <p className="text-gray-400 text-sm">Horas de Aprendizaje</p>
                <p className="text-3xl font-bold text-white">
                  {myCourses.reduce((acc, c) => {
                    const course = courses.find(cs => cs.id === c.courseId);
                    return acc + (course ? (course.estimatedDuration * c.progress / 100) : 0);
                  }, 0).toFixed(1)}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-gradient-to-br from-pink-900/30 to-pink-800/30 backdrop-blur-sm rounded-xl p-6 border border-pink-500/20">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-lg bg-pink-500/20 flex items-center justify-center">
                <Star className="w-6 h-6 text-pink-400" />
              </div>
              <div>
                <p className="text-gray-400 text-sm">Puntuación Promedio</p>
                <p className="text-3xl font-bold text-white">4.8</p>
              </div>
            </div>
          </div>
        </section>
      </div>

      {/* Global Mentor Chat */}
      <MentorChat 
        courseId="global" 
        mentor={{
          id: 'global-mentor',
          name: 'Directora Ana García',
          role: 'director',
          avatar: '/images/instructors/ana.jpg',
          bio: 'Directora con 20 años de experiencia.',
          agentId: 'director-agent',
          status: 'idle'
        }} 
      />
    </div>
  );
}
