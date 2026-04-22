# 🎓 Epic Dreams Academy - Documentación

## Visión General

La **Academy** es la plataforma educativa integrada de Epic Dreams Studio, diseñada para enseñar cine y producción audiovisual potenciado con inteligencia artificial.

## Estructura de Archivos

```
frontend/src/
├── app/
│   └── academy/
│       ├── page.tsx                          # Dashboard principal
│       ├── courses/
│       │   └── [courseId]/
│       │       └── page.tsx                  # Detalle de curso
│       └── mentor/
│           └── page.tsx                      # Chat con Mentor IA
├── components/
│   └── academy/
│       └── CourseList.tsx                    # Lista de cursos
├── stores/
│   └── useAcademyStore.ts                    # Estado global (Zustand)
└── types/
    └── academy.ts                            # Tipos TypeScript
```

## Características Implementadas

### ✅ Dashboard Principal (`/academy`)
- Catálogo de cursos disponibles
- Sección "Mis Cursos" con progreso
- Tarjetas de curso con:
  - Badge de nivel (principiante/intermedio/avanzado)
  - Precio o etiqueta GRATIS
  - Información del instructor
  - Duración, estudiantes, rating
  - Barra de progreso para cursos inscritos
- Estadísticas personales:
  - Cursos completados
  - Horas de aprendizaje
  - Puntuación promedio
- Navegación a Mentor IA

### ✅ Detalle de Curso (`/academy/courses/[courseId]`)
- Header con información completa del curso
- Módulos expandibles/colapsables
- Lecciones con estados:
  - 🔒 Bloqueadas (requieren completar anterior)
  - ▶️ Disponibles
  - ✅ Completadas
- Sistema de inscripción (gratis/pago)
- Sidebar con:
  - Progreso del curso
  - CTA de inscripción/compra
  - Objetivos de aprendizaje
- Integración con Mentor IA

### ✅ Mentor IA (`/academy/mentor`)
- Chat interactivo con respuestas contextuales
- Respuestas pre-programadas sobre:
  - Planos cinematográficos
  - Iluminación
  - Guion y estructura narrativa
  - Edición
  - Color grading
  - Uso de IA en cine
- Preguntas rápidas sugeridas
- Indicador de "escribiendo..."
- Historial de conversación en sesión

### ✅ Store de Estado (Zustand)
- Gestión de cursos y progreso
- Acciones principales:
  - `loadCourses()` - Cargar catálogo
  - `enrollInCourse(courseId)` - Inscribirse
  - `markLessonComplete(courseId, lessonId)` - Marcar completada
  - `updateQuizScore(courseId, lessonId, score)` - Guardar puntuación
  - `getCourseProgress(courseId)` - Obtener % de progreso
  - `startMentorSession(courseId)` - Iniciar sesión de mentoría
- Datos de ejemplo incluidos

### ✅ Tipos TypeScript
- `Course` - Estructura completa de curso
- `Module` - Módulos dentro de cursos
- `Lesson` - Lecciones con múltiples tipos (video, texto, quiz, proyecto)
- `UserProgress` - Seguimiento individual
- `QuizQuestion` - Sistema de evaluaciones
- `MentorMessage` - Mensajes del chat

## Tipos de Lecciones Soportadas

| Tipo | Descripción | Icono |
|------|-------------|-------|
| `video` | Contenido en video | ▶️ |
| `text` | Artículo/lectura | 📄 |
| `quiz` | Evaluación interactiva | ❓ |
| `project` | Ejercicio práctico | 🎬 |
| `interactive` | Contenido interactivo | ⚡ |

## Flujo de Usuario Típico

1. **Explorar** → Usuario visita `/academy`
2. **Seleccionar** → Elige un curso del catálogo
3. **Inscribirse** → Click en "Comenzar Gratis" o "Comprar"
4. **Aprender** → Completa lecciones secuencialmente
5. **Evaluar** → Realiza quizzes para validar conocimiento
6. **Consultar** → Usa Mentor IA para dudas específicas
7. **Completar** → Obtiene certificado al finalizar

## Próximas Mejoras (Roadmap)

### Corto Plazo
- [ ] Integración con backend real (actualmente datos mock)
- [ ] Sistema de autenticación para guardar progreso
- [ ] Reproductor de video integrado para lecciones
- [ ] Sistema de quizzes funcional con validación

### Medio Plazo
- [ ] Certificados descargables en PDF
- [ ] Gamificación (badges, puntos, leaderboard)
- [ ] Foros de discusión por curso
- [ ] Sesiones en vivo con instructores

### Largo Plazo
- [ ] Ruta de aprendizaje personalizada con IA
- [ ] Proyectos colaborativos entre estudiantes
- [ ] Integración directa con Epic Dreams Studio
- [ ] Marketplace de cursos de creadores externos

## Integración con el Studio

La Academy está diseñada para integrarse perfectamente con el editor de video:

```typescript
// Ejemplo: Desde una lección, abrir proyecto en Studio
const openInStudio = () => {
  router.push(`/studio?template=${lesson.projectTemplate}`);
};
```

## Consideraciones Técnicas

### Rendimiento
- Componentes lazy-loaded cuando sea necesario
- Virtualización para listas largas de lecciones
- Caché de datos de cursos

### Accesibilidad
- Navegación por teclado
- Atributos ARIA en componentes interactivos
- Contraste de colores verificado

### Responsive
- Mobile-first design
- Grid adaptable (1-3 columnas)
- Menús colapsables en móvil

## API Futura (Backend)

Endpoints planeados:

```
GET    /api/academy/courses          # Listar cursos
GET    /api/academy/courses/:id      # Detalle de curso
POST   /api/academy/enroll           # Inscribirse en curso
PUT    /api/academy/progress         # Actualizar progreso
POST   /api/academy/quiz/submit      # Enviar quiz
POST   /api/academy/mentor/chat      # Chat con IA
GET    /api/academy/certificate/:id  # Generar certificado
```

## Contribuir

Para añadir nuevos cursos, editar `SAMPLE_COURSES` en `useAcademyStore.ts`:

```typescript
const SAMPLE_COURSES: Course[] = [
  {
    id: 'nuevo-curso',
    title: 'Título del Curso',
    // ... resto de propiedades
  }
];
```

---

**Estado**: ✅ Base implementada  
**Próximo Sprint**: Integración con backend y reproductor de video
