export function Hero() {
  // Get today's date
  const today = new Date();
  const dayName = today.toLocaleDateString('es-ES', { weekday: 'long' }).toUpperCase();
  const dayNumber = today.getDate();
  const monthName = today.toLocaleDateString('es-ES', { month: 'long' }).toUpperCase();

  return (
    <div className="bg-white border-b border-gray-200 py-12 text-center">
      <div className="max-w-4xl mx-auto px-4">
        <h1 className="text-5xl mb-3 tracking-tight">Tu Debate Diario</h1>
        <p className="text-xl text-gray-600 mb-8">
          Cinco debates sobre la actualidad. Opiniones con criterio.
        </p>
        
        <div className="mt-12">
          <div className="text-7xl tracking-tight text-gray-900 mb-2">
            {dayNumber} DE {monthName}
          </div>
          <div className="text-6xl tracking-tight text-gray-900">
            {dayName}
          </div>
        </div>
      </div>
    </div>
  );
}