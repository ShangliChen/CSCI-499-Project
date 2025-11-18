import React from "react";
import { Gamepad2, Waves, PenLine } from "lucide-react";

export default function RelaxingGames() {
  const games = [
    {
      title: "Tetris",
      description: "Stack, rotate, and relax your brain!",
      icon: <Gamepad2 className="h-12 w-12 text-[#7DD87D]" />,
      url: "https://play.tetris.com/",
    },
    {
      title: "A Soft Murmur",
      description: "Mix soothing sounds like rain and wind.",
      icon: <Waves className="h-12 w-12 text-[#7DD87D]" />,
      url: "https://asoftmurmur.com/",
    },
    {
      title: "Quick Draw",
      description: "Doodle freely and have fun!",
      icon: <PenLine className="h-12 w-12 text-[#7DD87D]" />,
      url: "https://quickdraw.withgoogle.com/",
    },
    {
      title: "Slither.io",
      description: "Glide around and grow your cute little snake!",
      icon: <Gamepad2 className="h-12 w-12 text-[#7DD87D]" />,
      url: "http://slither.com/io",
    },
  ];

  return (
    <div className="min-h-screen bg-[#E8FFE8] pb-20">

      {/* Fun playful header */}
      <div className="py-14 text-center">
        <h1 className="text-5xl font-extrabold text-gray-900 mb-3 tracking-wide">
           🎮 Relax & Play 🎮
        </h1>
        <p className="text-lg text-gray-700 max-w-2xl mx-auto">
          A collection of fun, simple, and relaxing mini-games to help you unwind.
        </p>
      </div>

      {/* Playful Cards */}
      <div className="container mx-auto max-w-6xl px-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
        {games.map((game, index) => (
          <div
            key={index}
            className="bg-white rounded-3xl shadow-xl p-8 border-2 border-[#C7F9CC] hover:bg-[#F0FFF0] hover:scale-105 hover:shadow-2xl active:scale-95 transition-all duration-300 cursor-pointer"
            onClick={() => window.open(game.url, "_blank")}
          >
            <div className="flex items-center gap-5 mb-4">
              <div className="p-4 bg-[#DFFFE0] rounded-full shadow-md">
                {game.icon}
              </div>
              <h2 className="text-2xl font-bold text-gray-900">{game.title}</h2>
            </div>

            <p className="text-gray-700 text-sm mb-6">{game.description}</p>

            <button className="w-full py-3 rounded-full bg-[#7DD87D] text-white font-semibold text-lg hover:bg-[#6CCB6C] transition">
              Play →
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
