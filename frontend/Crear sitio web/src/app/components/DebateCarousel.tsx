import Slider from "react-slick";
import { MessageCircle } from "lucide-react";
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";

interface DebatePreview {
  id: number;
  title: string;
  commentCount: number;
}

const debates: DebatePreview[] = [
  { id: 1, title: "¿Es viable la jornada laboral de 4 días?", commentCount: 234 },
  { id: 2, title: "¿La IA reemplazará a los programadores?", commentCount: 412 },
  { id: 3, title: "¿Debe limitarse Airbnb en grandes ciudades?", commentCount: 189 },
  { id: 4, title: "¿Es necesaria la energía nuclear para la transición energética?", commentCount: 321 },
  { id: 5, title: "¿Deben regularse las redes sociales?", commentCount: 267 },
];

export function DebateCarousel() {
  const settings = {
    dots: false,
    infinite: true,
    speed: 3000,
    slidesToShow: 3,
    slidesToScroll: 1,
    autoplay: true,
    autoplaySpeed: 3000,
    pauseOnHover: true,
    responsive: [
      {
        breakpoint: 1024,
        settings: {
          slidesToShow: 2,
        }
      },
      {
        breakpoint: 640,
        settings: {
          slidesToShow: 1,
        }
      }
    ]
  };

  return (
    <div className="bg-gray-50 py-8 border-b border-gray-200">
      <div className="max-w-6xl mx-auto px-4">
        <Slider {...settings}>
          {debates.map((debate) => (
            <div key={debate.id} className="px-3">
              <div className="bg-white border border-gray-200 rounded-lg p-6 hover:border-blue-500 transition-colors cursor-pointer">
                <h3 className="text-lg mb-3 min-h-[3.5rem]">
                  {debate.title}
                </h3>
                <div className="flex items-center gap-2 text-gray-500 text-sm">
                  <MessageCircle className="w-4 h-4" />
                  <span>{debate.commentCount} comentarios</span>
                </div>
              </div>
            </div>
          ))}
        </Slider>
      </div>
    </div>
  );
}
