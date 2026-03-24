"use client";
import { signIn, useSession } from "next-auth/react";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function LoginPage() {
  const router = useRouter();
  const { data: session, status } = useSession();
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  // --- REDIRECTION AUTOMATIQUE (Pour OAuth Google/GitHub) ---
// --- REDIRECTION AUTOMATIQUE DANS LoginPage.jsx ---
  useEffect(() => {
    if (status === "authenticated" && session?.user?.role) {
      const role = session.user.role;
      if (role === "ADMIN") window.location.href = "/admin";
      else if (role === "MEDECIN") window.location.href = "/medecin";
      else window.location.href = "/patient";
    }
  }, [session, status]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    const email = e.target.email.value;
    const password = e.target.password.value;

    const res = await signIn("credentials", {
      email,
      password,
      redirect: false, // On garde le contrôle pour forcer le refresh
    });

    if (res?.error) {
      setError("Email ou mot de passe incorrect");
      setLoading(false);
    } else {
      // SOLUTION : Rafraîchir les composants serveurs AVANT la redirection
      router.refresh(); 
      // Le useEffect se chargera de la redirection dès que la session est injectée
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      <div className="bg-white p-8 rounded-lg shadow-md w-full max-w-md border border-gray-100">
        <h1 className="text-2xl font-bold text-center mb-6 text-gray-800">Connexion à MediCare</h1>

        {error && (
          <div className="bg-red-50 border-l-4 border-red-500 p-3 mb-4 animate-shake">
            <p className="text-red-700 text-sm text-center font-medium">{error}</p>
          </div>
        )}

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div className="space-y-1">
            <label className="text-xs font-semibold text-gray-500 ml-1">ADRESSE EMAIL</label>
            <input 
              type="email" 
              name="email" 
              placeholder="votre@email.com" 
              required 
              className="w-full border p-3 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none text-black transition-all" 
            />
          </div>
          <div className="space-y-1">
            <label className="text-xs font-semibold text-gray-500 ml-1">MOT DE PASSE</label>
            <input 
              type="password" 
              name="password" 
              placeholder="••••••••" 
              required 
              className="w-full border p-3 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none text-black transition-all" 
            />
          </div>
          
          <button 
            type="submit" 
            disabled={loading || status === "loading"}
            className="bg-blue-600 text-white py-3 rounded-lg font-bold hover:bg-blue-700 disabled:bg-blue-300 transition-all shadow-lg shadow-blue-200 mt-2"
          >
            {loading || status === "loading" ? (
              <span className="flex items-center justify-center gap-2">
                <svg className="animate-spin h-5 w-5 text-white" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Chargement...
              </span>
            ) : "Se connecter"}
          </button>
        </form>

        <div className="my-6 flex items-center gap-2">
          <hr className="flex-1 border-gray-200" />
          <span className="text-gray-400 text-[10px] font-black tracking-widest uppercase">OU</span>
          <hr className="flex-1 border-gray-200" />
        </div>

        <div className="flex flex-col gap-3">
          <button 
            type="button"
            onClick={() => signIn("google")} 
            className="border border-gray-200 py-2.5 rounded-lg font-medium hover:bg-gray-50 flex justify-center items-center gap-3 transition-colors text-gray-700"
          >
          <img src="https://cdn.jsdelivr.net/gh/devicons/devicon/icons/google/google-original.svg" className="w-5 h-5" alt="Google" />Continuer avec Google
          </button>
          <button 
            type="button"
            onClick={() => signIn("github")} 
            className="bg-gray-900 text-white py-2.5 rounded-lg font-medium hover:bg-gray-800 flex justify-center items-center gap-3 transition-colors shadow-md"
          >
            <img src="https://www.svgrepo.com/show/512317/github-142.svg" className="w-5 h-5 invert" alt="Github" />
            Continuer avec GitHub
          </button>
        </div>

        <p className="text-center text-sm text-gray-500 mt-8">
          Pas encore de compte ? <Link href="/auth/register" className="text-blue-600 font-bold hover:underline">S'inscrire gratuitement</Link>
        </p>
      </div>
    </div>
  );
}