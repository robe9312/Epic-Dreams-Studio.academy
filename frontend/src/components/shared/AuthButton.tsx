import { auth, signIn, signOut } from "../../../auth";
import Link from "next/link";
import { LogIn, LogOut, User as UserIcon } from "lucide-react";

export default async function AuthButton() {
  const session = await auth();

  if (!session?.user) {
    return (
      <Link href="/login">
        <button className="flex items-center gap-2 px-4 py-2 bg-white/5 border border-white/10 rounded-full text-[10px] font-bold tracking-widest uppercase hover:bg-red-600 hover:border-red-600 transition-all">
          <LogIn size={14} />
          Sign In
        </button>
      </Link>
    );
  }

  return (
    <div className="flex items-center gap-3 bg-white/5 backdrop-blur-md border border-white/10 p-1.5 pr-3 rounded-full hover:bg-white/10 transition-all group">
      <div className="relative">
        {session.user.image ? (
          <img src={session.user.image} alt="User Avatar" className="w-8 h-8 rounded-full border border-red-500/50" />
        ) : (
          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-red-600 to-purple-700 flex items-center justify-center border border-white/20">
            <UserIcon size={14} className="text-white" />
          </div>
        )}
        <div className="absolute -bottom-1 -right-1 w-3 h-3 bg-green-500 border-2 border-[#050505] rounded-full" />
      </div>

      <div className="flex flex-col">
        <span className="text-[9px] font-bold text-white uppercase tracking-wider leading-none">{session.user.name}</span>
        <span className="text-[7px] text-red-500 font-mono font-bold tracking-[0.2em] mt-0.5">STUDIO_STAFF</span>
      </div>
      
      <form action={async () => {
        "use server";
        await signOut();
      }} className="ml-2 pl-2 border-l border-white/10">
        <button type="submit" className="p-1 text-gray-500 hover:text-red-500 transition-colors" title="Cerrar Sesión">
          <LogOut size={14} />
        </button>
      </form>
    </div>
  );
}
