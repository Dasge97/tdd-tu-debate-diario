import { Navbar } from "./components/Navbar";
import { Hero } from "./components/Hero";
import { DebateCarousel } from "./components/DebateCarousel";
import { DebateCard } from "./components/DebateCard";
import { Sidebar } from "./components/Sidebar";
import { GlobalMenu } from "./components/GlobalMenu";
import { useState } from "react";

const debates = [
  {
    id: 1,
    title: "¿Es viable la jornada laboral de 4 días?",
    context: "Varios países europeos están experimentando con jornadas laborales reducidas. Los datos preliminares muestran aumentos en productividad y bienestar, pero surgen dudas sobre su implementación universal.",
    positions: { favor: 58, contra: 24, neutral: 18 },
    commentCount: 234,
  },
  {
    id: 2,
    title: "¿La IA reemplazará a los programadores?",
    context: "El avance de herramientas como GPT-4 y GitHub Copilot plantea interrogantes sobre el futuro de la programación. Mientras algunos ven una amenaza, otros argumentan que estas herramientas amplificarán las capacidades humanas.",
    positions: { favor: 32, contra: 51, neutral: 17 },
    commentCount: 412,
  },
  {
    id: 3,
    title: "¿Debe limitarse Airbnb en grandes ciudades?",
    context: "El impacto de plataformas como Airbnb en el mercado de alquiler tradicional ha generado debate. Ciudades como Barcelona y Ámsterdam ya han implementado restricciones, argumentando protección del tejido residencial.",
    positions: { favor: 64, contra: 22, neutral: 14 },
    commentCount: 189,
  },
  {
    id: 4,
    title: "¿Es necesaria la energía nuclear para la transición energética?",
    context: "Mientras el mundo busca reducir emisiones, la energía nuclear emerge como opción controvertida. Sus defensores destacan su fiabilidad y baja emisión de carbono; sus críticos señalan riesgos y costes de residuos.",
    positions: { favor: 45, contra: 38, neutral: 17 },
    commentCount: 321,
  },
  {
    id: 5,
    title: "¿Deben regularse las redes sociales?",
    context: "La desinformación, adicción y efectos en salud mental han llevado a gobiernos a considerar regulaciones. El debate oscila entre protección ciudadana y preservación de la libertad de expresión digital.",
    positions: { favor: 71, contra: 15, neutral: 14 },
    commentCount: 267,
  },
];

export default function App() {
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <div className="min-h-screen bg-gray-50 flex">
      <GlobalMenu isOpen={menuOpen} onToggle={() => setMenuOpen(!menuOpen)} />
      
      {/* Main content area */}
      <div className={`flex-1 transition-all duration-300 ${menuOpen ? "ml-64" : "ml-0"}`}>
        <Navbar />
        <Hero />
        <DebateCarousel />
        
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Main content - 2 columns */}
            <div className="lg:col-span-2">
              <h2 className="text-3xl mb-6">Debates de hoy</h2>
              {debates.map((debate) => (
                <DebateCard
                  key={debate.id}
                  title={debate.title}
                  context={debate.context}
                  positions={debate.positions}
                  commentCount={debate.commentCount}
                />
              ))}
            </div>

            {/* Sidebar - 1 column */}
            <div className="lg:col-span-1">
              <Sidebar />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}