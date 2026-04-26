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
    <div className="flex items-center gap-4">
      <div className="flex flex-col items-end">
        <span className="text-[10px] font-bold text-white uppercase tracking-wider">{session.user.name}</span>
        <span className="text-[8px] text-gray-500 font-mono">AUTHORIZED_PERSONNEL</span>
      </div>
      
      {session.user.image ? (
        <img src={session.user.image} alt="User Avatar" className="w-8 h-8 rounded-full border border-red-500/50 shadow-lg shadow-red-500/20" />
      ) : (
        <div className="w-8 h-8 rounded-full bg-red-600 flex items-center justify-center border border-white/20">
          <UserIcon size={16} />
        </div>
      )}

      <form action={async () => {
        "use server";
        await signOut();
      }}>
        <button type="submit" className="p-2 text-gray-500 hover:text-red-500 transition-colors" title="Sign Out">
          <LogOut size={16} />
        </button>
      </form>
    </div>
  );
}
