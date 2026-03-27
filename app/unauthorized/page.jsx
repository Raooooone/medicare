// app/unauthorized/page.jsx
export const dynamic = 'force-dynamic'; // Crucial pour ignorer cette page au build

export default function UnauthorizedPage() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-50 p-4">
      <div className="bg-white p-8 rounded-2xl shadow-xl text-center max-w-md border border-gray-100">
        <h1 className="text-4xl font-black text-rose-600 mb-4 uppercase tracking-tighter">
          Accès Refusé
        </h1>
        <p className="text-gray-600 font-medium mb-8">
          Désolé, vous n'avez pas les permissions nécessaires pour accéder à cet espace.
        </p>
        <a 
          href="/" 
          className="inline-block bg-blue-600 text-white font-bold px-8 py-3 rounded-xl hover:bg-blue-700 transition-all shadow-lg shadow-blue-200"
        >
          Retour à l'accueil
        </a>
      </div>
    </div>
  );
}