import { Home, Clock, TrendingUp, MessageSquare, Bookmark, Award } from "lucide-react";

const menuItems = [
  { icon: Home, label: "Debates de hoy", active: true },
  { icon: Clock, label: "Debates recientes" },
  { icon: TrendingUp, label: "Tendencias" },
  { icon: MessageSquare, label: "Mis comentarios" },
  { icon: Bookmark, label: "Guardados" },
];

const topVoices = [
  { username: "@ana_debate", score: 94, debates: 127 },
  { username: "@carlos_opinion", score: 91, debates: 98 },
  { username: "@maria_criterio", score: 89, debates: 156 },
  { username: "@pedro_razon", score: 87, debates: 84 },
];

const todayStats = [
  { label: "Comentarios hoy", value: "1,234" },
  { label: "Participantes hoy", value: "487" },
  { label: "Debates activos", value: "5" },
  { label: "Votos emitidos", value: "3,421" },
];

export function Sidebar() {
  return (
    <div className="space-y-6">
      {/* Voces con criterio */}
      <div className="bg-white border border-gray-200 rounded-lg p-4">
        <h3 className="text-sm uppercase tracking-wide text-gray-500 mb-4">Voces con criterio</h3>
        <div className="space-y-3">
          {topVoices.map((voice) => (
            <div key={voice.username} className="pb-3 border-b border-gray-100 last:border-0 last:pb-0">
              <div className="text-sm mb-1">{voice.username}</div>
              <div className="text-xs text-gray-500">
                Índice de criterio: {voice.score}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Actividad de hoy */}
      <div className="bg-white border border-gray-200 rounded-lg p-4">
        <h3 className="text-sm uppercase tracking-wide text-gray-500 mb-4">Actividad de hoy</h3>
        <div className="space-y-3">
          {todayStats.map((stat) => (
            <div key={stat.label} className="flex justify-between items-center">
              <span className="text-sm text-gray-600">{stat.label}</span>
              <span className="text-lg text-gray-900">{stat.value}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}