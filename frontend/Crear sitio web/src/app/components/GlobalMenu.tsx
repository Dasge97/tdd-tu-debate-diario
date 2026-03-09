import { Home, Clock, TrendingUp, MessageSquare, Bookmark, Menu, X } from "lucide-react";

const menuItems = [
  { icon: Home, label: "Debates de hoy", active: true },
  { icon: Clock, label: "Debates recientes" },
  { icon: TrendingUp, label: "Tendencias" },
  { icon: MessageSquare, label: "Mis comentarios" },
  { icon: Bookmark, label: "Guardados" },
];

interface GlobalMenuProps {
  isOpen: boolean;
  onToggle: () => void;
}

export function GlobalMenu({ isOpen, onToggle }: GlobalMenuProps) {
  return (
    <>
      {/* Menu toggle button */}
      <button
        onClick={onToggle}
        className="fixed left-4 top-20 z-50 p-2.5 bg-transparent border border-gray-300 rounded-full hover:bg-gray-50 hover:border-gray-400 transition-all"
        aria-label="Toggle menu"
      >
        {isOpen ? (
          <X className="w-4 h-4 text-gray-500" strokeWidth={1.5} />
        ) : (
          <Menu className="w-4 h-4 text-gray-500" strokeWidth={1.5} />
        )}
      </button>

      {/* Sidebar menu */}
      <div
        className={`fixed left-0 top-0 h-full w-64 bg-white border-r border-gray-200 shadow-xl z-40 transform transition-transform duration-300 ${
          isOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="p-6 pt-20">
          <h2 className="text-2xl mb-8 tracking-tight">TDD</h2>
          <nav className="space-y-2">
            {menuItems.map((item) => {
              const Icon = item.icon;
              return (
                <button
                  key={item.label}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                    item.active
                      ? "bg-blue-50 text-blue-600"
                      : "text-gray-700 hover:bg-gray-50"
                  }`}
                >
                  <Icon className="w-5 h-5" />
                  <span>{item.label}</span>
                </button>
              );
            })}
          </nav>
        </div>
      </div>
    </>
  );
}