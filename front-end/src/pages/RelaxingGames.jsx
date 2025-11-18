import React, { useState, useEffect } from "react";
import { Gamepad2, Waves, PenLine, Heart, HeartOff, Shuffle } from "lucide-react";

export default function RelaxingGames() {
  const allGames = [
    {
      title: "Tetris",
      category: "Puzzle",
      icon: <Gamepad2 className="h-12 w-12 text-[#7DD87D]" />,
      url: "https://play.tetris.com/",
    },
    {
      title: "A Soft Murmur",
      category: "Sound",
      icon: <Waves className="h-12 w-12 text-[#7DD87D]" />,
      url: "https://asoftmurmur.com/",
    },
    {
      title: "Quick Draw",
      category: "Drawing",
      icon: <PenLine className="h-12 w-12 text-[#7DD87D]" />,
      url: "https://quickdraw.withgoogle.com/",
    },
    {
      title: "Slither.io",
      category: "Arcade",
      icon: <Gamepad2 className="h-12 w-12 text-[#7DD87D]" />,
      url: "http://slither.com/io",
    },
  ];

  const categories = ["All", "Puzzle", "Sound", "Drawing", "Arcade"];

  const [selectedCategory, setSelectedCategory] = useState("All");
  const [recentGames, setRecentGames] = useState([]);
  const [favorites, setFavorites] = useState([]);

  // Filter games by category
  const filteredGames =
    selectedCategory === "All"
      ? allGames
      : allGames.filter((g) => g.category === selectedCategory);

  // Handle game click → open + add to recent
  const handlePlay = (game) => {
    window.open(game.url, "_blank");

    setRecentGames((prev) => {
      const updated = [game, ...prev.filter((g) => g.title !== game.title)];
      return updated.slice(0, 3); // Keep max 3 recent
    });
  };

  // Add/remove favorite
  const toggleFavorite = (game) => {
    setFavorites((prev) => {
      if (prev.find((fav) => fav.title === game.title)) {
        return prev.filter((fav) => fav.title !== game.title);
      }
      return [...prev, game];
    });
  };

  // Random Game
  const playRandomGame = () => {
    const random = allGames[Math.floor(Math.random() * allGames.length)];
    handlePlay(random);
  };

  return (
    <div className="min-h-screen bg-[#F0FFF0] pb-20 px-6">

      {/* Fun Header */}
      <div className="py-10 text-center">
        <h1 className="text-5xl font-extrabold text-gray-900 mb-3">
          🎮 Relax & Play
        </h1>
        <p className="text-lg text-gray-700 max-w-2xl mx-auto">
          A fun collection of relaxing mini-games for students to unwind.
        </p>
      </div>

      {/* Random Game Button */}
      <div className="text-center mb-6">
        <button
          onClick={playRandomGame}
          className="flex items-center gap-2 mx-auto px-6 py-3 rounded-full bg-[#7DD87D] text-white font-semibold text-lg hover:bg-[#6CCB6C] transition"
        >
          <Shuffle />
          Surprise Me!
        </button>
      </div>

      {/* Category Tabs */}
      <div className="flex justify-center gap-4 mb-10 flex-wrap">
        {categories.map((cat) => (
          <button
            key={cat}
            onClick={() => setSelectedCategory(cat)}
            className={`px-5 py-2 rounded-full text-sm font-medium transition 
              ${
                selectedCategory === cat
                  ? "bg-[#7DD87D] text-white"
                  : "bg-white text-gray-700 border border-gray-300"
              }`}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Recently Played */}
      {recentGames.length > 0 && (
        <div className="max-w-5xl mx-auto mb-10">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Recently Played</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {recentGames.map((game) => (
              <div
                key={game.title}
                className="bg-white rounded-3xl shadow-lg p-6 border-2 border-[#D6F5D6]"
              >
                <div className="flex items-center gap-3 mb-3">
                  <div className="p-3 bg-[#E9FCE9] rounded-full shadow">
                    {game.icon}
                  </div>
                  <h3 className="text-lg font-bold text-gray-900">{game.title}</h3>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Games Grid */}
      <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
        {filteredGames.map((game, index) => (
          <div
            key={index}
            className="bg-white rounded-3xl shadow-xl p-8 border-2 border-[#C7F9CC] hover:bg-[#F0FFF0] hover:scale-105 transition-all duration-300 cursor-pointer"
          >
            <div className="flex items-center gap-4 mb-4">
              <div className="p-4 bg-[#E9FCE9] rounded-full shadow">
                {game.icon}
              </div>
              <h2 className="text-2xl font-bold text-gray-900">{game.title}</h2>
            </div>

            <p className="text-gray-700 text-sm mb-4">{game.category}</p>

            {/* Buttons */}
            <div className="flex justify-between items-center mt-4">
              <button
                className="px-4 py-2 rounded-full bg-[#7DD87D] text-white font-semibold hover:bg-[#6CCB6C]"
                onClick={() => handlePlay(game)}
              >
                Play →
              </button>

              <button onClick={() => toggleFavorite(game)}>
                {favorites.find((f) => f.title === game.title) ? (
                  <Heart className="text-red-500" />
                ) : (
                  <HeartOff className="text-gray-400" />
                )}
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Favorites Section */}
      {favorites.length > 0 && (
        <div className="max-w-5xl mx-auto mt-16">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Your Favorites ❤️</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {favorites.map((game) => (
              <div
                key={game.title}
                className="bg-white rounded-3xl shadow-lg p-6 border-2 border-[#FFDCE0]"
              >
                <div className="flex items-center gap-3 mb-3">
                  <div className="p-3 bg-[#FFEFF0] rounded-full shadow">
                    {game.icon}
                  </div>
                  <h3 className="text-lg font-bold text-gray-900">{game.title}</h3>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
