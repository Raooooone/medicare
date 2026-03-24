export default function Unauthorized() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen">
      <h1 className="text-4xl font-bold text-red-600">Accès Refusé</h1>
      <p className="text-gray-600 mt-2">Vous n'avez pas les permissions nécessaires pour voir cette page.</p>
      <a href="/" className="mt-4 text-blue-500 underline">Retour à l'accueil</a>
    </div>
  );
}