import { MessageCircle } from "lucide-react";

interface DebateCardProps {
  title: string;
  context: string;
  positions: {
    favor: number;
    contra: number;
    neutral: number;
  };
  commentCount: number;
}

export function DebateCard({ title, context, positions, commentCount }: DebateCardProps) {
  return (
    <div className="bg-white border border-gray-200 rounded-lg p-6 hover:border-gray-300 transition-colors mb-4">
      <h2 className="text-2xl mb-3">{title}</h2>
      <p className="text-gray-600 mb-4 leading-relaxed">{context}</p>
      
      {/* Position indicator bar */}
      <div className="mb-4">
        <div className="flex items-center gap-2 text-sm mb-2">
          <span className="text-gray-600">Posición de la comunidad:</span>
        </div>
        <div className="flex h-3 rounded-full overflow-hidden bg-gray-200">
          <div 
            className="bg-green-500 hover:bg-green-600 transition-colors" 
            style={{ width: `${positions.favor}%` }}
            title={`A favor: ${positions.favor}%`}
          />
          <div 
            className="bg-red-500 hover:bg-red-600 transition-colors" 
            style={{ width: `${positions.contra}%` }}
            title={`En contra: ${positions.contra}%`}
          />
          <div 
            className="bg-gray-400 hover:bg-gray-500 transition-colors" 
            style={{ width: `${positions.neutral}%` }}
            title={`Neutral: ${positions.neutral}%`}
          />
        </div>
        <div className="flex justify-between text-xs text-gray-500 mt-2">
          <span className="flex items-center gap-1">
            <span className="w-3 h-3 bg-green-500 rounded-full inline-block"></span>
            A favor {positions.favor}%
          </span>
          <span className="flex items-center gap-1">
            <span className="w-3 h-3 bg-red-500 rounded-full inline-block"></span>
            En contra {positions.contra}%
          </span>
          <span className="flex items-center gap-1">
            <span className="w-3 h-3 bg-gray-400 rounded-full inline-block"></span>
            Neutral {positions.neutral}%
          </span>
        </div>
      </div>

      {/* Bottom section */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2 text-gray-500">
          <MessageCircle className="w-5 h-5" />
          <span>{commentCount} comentarios</span>
        </div>
        <button className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
          Entrar al debate
        </button>
      </div>
    </div>
  );
}
