// auth.ts - VERSION TEMPORAL (AUTH DESACTIVADO)
// Esta versión no requiere variables de entorno y permite el acceso total.

export const handlers = { GET: () => new Response("OK"), POST: () => new Response("OK") };
export const signIn = async () => {};
export const signOut = async () => {};

// Mock del objeto auth para que siempre devuelva una sesión de invitado o null sin explotar
export const auth = async () => {
  return {
    user: {
      name: "Invitado (Modo Desarrollo)",
      email: "guest@epicdreams.ai",
      id: "guest",
      role: "admin",
      image: null // Añadido para evitar error de tipos
    },
    expires: new Date(Date.now() + 3600 * 1000).toISOString()
  };
};

export const NextAuth = () => ({
  handlers,
  auth,
  signIn,
  signOut
});
