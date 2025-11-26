import React, { useState, useEffect } from "react";
import { Gamepad2, Waves, PenLine, Heart, HeartOff, Shuffle } from "lucide-react";

export default function RelaxingGames() {
  const user = JSON.parse(localStorage.getItem("user")); // Logged-in user

  // Master game list — ICONS STAY ONLY HERE (never stored to DB)
  const allGames = [
    {
      title: "Sketch Master",
      category: "Drawing",
      icon: <PenLine className="h-12 w-12 text-[#7DD87D]" />,
      url: "https://playhop.com/app/211823",
    },

    {
      title: "Foot Clinic",
      category: "Arcade",
      icon: <Gamepad2 className="h-12 w-12 text-[#7DD87D]" />,
      url: "https://playhop.com/app/453752",
    },

    {
      title: "Cutting Things",
      category: "Sound",
      icon: <Waves className="h-12 w-12 text-[#7DD87D]" />,
      url: "https://playhop.com/app/394621",
    },
    {
      title: "Antistress",
      category: "Sound",
      icon: <Waves className="h-12 w-12 text-[#7DD87D]" />,
      url: "https://playhop.com/app/396595",
    },

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
      url: "https://slither.io/",
    },
  ];

  const categories = ["All", "Puzzle", "Sound", "Drawing", "Arcade"];

  const [selectedCategory, setSelectedCategory] = useState("All");
  const [recentGames, setRecentGames] = useState([]);
  const [favorites, setFavorites] = useState([]);

  // Helper: reattach icons after loading from DB
  const attachIcon = (items) =>
    items.map((item) => {
      const match = allGames.find((g) => g.title === item.title);
      return match ? { ...item, icon: match.icon } : item;
    });

  // 1️ Load recent + favorites from DB on page load
  useEffect(() => {
    if (!user) return;

    fetch(`http://localhost:5000/api/games/${user.userId}`)
      .then((res) => res.json())
      .then((data) => {
        if (data.success) {
          setFavorites(attachIcon(data.favorites || []));
          setRecentGames(attachIcon(data.recentGames || []));
        }
      })
      .catch((err) => console.error("Error loading game data:", err));
  }, []);

  const filteredGames =
    selectedCategory === "All"
      ? allGames
      : allGames.filter((g) => g.category === selectedCategory);


  // 2️ Play Game → update recentGames + save to DB (max 3)
  const handlePlay = (game) => {
    window.open(game.url, "_blank");

    setRecentGames((prev) => {
      // clean out icons from previous items before saving
      const cleanedPrev = prev
        .filter((g) => g.title !== game.title)
        .map((g) => ({
          title: g.title,
          category: g.category,
          url: g.url,
        }));

      const updated = [
        { title: game.title, category: game.category, url: game.url },
        ...cleanedPrev,
      ].slice(0, 3);

      if (user) {
        fetch(`http://localhost:5000/api/games/recent/${user.userId}`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ recentGames: updated }),
        });
      }

      return attachIcon(updated);
    });
  };


  // 3️ Favorite / Unfavorite game → update DB

  const toggleFavorite = (game) => {
    setFavorites((prev) => {
      const exists = prev.some((f) => f.title === game.title);

      // clean previous favorites (strip icons)
      let updatedClean;
      if (exists) {
        updatedClean = prev
          .filter((f) => f.title !== game.title)
          .map((f) => ({
            title: f.title,
            category: f.category,
            url: f.url,
          }));
      } else {
        updatedClean = [
          ...prev.map((f) => ({
            title: f.title,
            category: f.category,
            url: f.url,
          })),
          {
            title: game.title,
            category: game.category,
            url: game.url,
          },
        ];
      }

      if (user) {
        fetch(`http://localhost:5000/api/games/favorites/${user.userId}`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ favorites: updatedClean }),
        });
      }

      return attachIcon(updatedClean);
    });
  };

  // 4 Clear all recent games
  const clearRecentGames = () => {
    setRecentGames([]);
    if (user) {
      fetch(`http://localhost:5000/api/games/recent/${user.userId}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ recentGames: [] }),
      });
    }
  };

  //5 Random game
  const playRandomGame = () => {
    const random = allGames[Math.floor(Math.random() * allGames.length)];
    handlePlay(random);
  };

  return (
    <div className="min-h-screen bg-[#F0FFF0] pb-20 px-6">
      {/* Header */}
      <div className="py-10 text-center">
        <h1 className="text-5xl font-extrabold text-gray-900 mb-3">
          🐛 Relax & Play 
        </h1>
        <p className="text-lg text-gray-700 max-w-2xl mx-auto">
          A fun collection of relaxing mini-games for students to unwind.
        </p>
      </div>

      {/* Favorites */}
      {favorites.length > 0 && (
        <div className="max-w-5xl mx-auto mb-10">
          <h2 className="text-2xl font-bold text-gray-900 mb-3">
            Your Favorites 💚
          </h2>

          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
            {favorites.map((game) => (
              <div
                key={game.title}
                onClick={() => handlePlay(game)}
                className="bg-white rounded-xl shadow-md p-4 border-2 border-[#FFDCE0] cursor-pointer hover:scale-105 transition-all"
              >
                <div className="p-2 bg-[#FFEFF0] rounded-full">
                  {game.icon}
                </div>

                <h3 className="text-sm font-semibold text-gray-900 text-center">
                  {game.title}
                </h3>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Random button */}
      <div className="text-center mb-6">
        <button
          onClick={playRandomGame}
          className="flex items-center gap-2 mx-auto px-6 py-3 rounded-full bg-[#7DD87D] text-white font-semibold text-lg hover:bg-[#6CCB6C] transition"
        >
          <Shuffle />
          Surprise Me!
        </button>
      </div>

      {/* Category tabs */}
      <div className="flex justify-center gap-4 mb-10 flex-wrap">
        {categories.map((cat) => (
          <button
            key={cat}
            onClick={() => setSelectedCategory(cat)}
            className={`px-5 py-2 rounded-full text-sm font-medium transition ${
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
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-2xl font-bold text-gray-900">
              Recently Played
            </h2>
          <button
            onClick={clearRecentGames}
            className="px-4 py-1 rounded-full text-sm font-medium bg-red-100 text-red-600 hover:bg-red-200 transition"
          >
            Clear Recent
          </button>
          </div>

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
                  <h3 className="text-lg font-bold text-gray-900">
                    {game.title}
                  </h3>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Games grid */}
      <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
        {filteredGames.map((game) => (
          <div
            key={game.title}
            className="bg-white rounded-3xl shadow-xl p-8 border-2 border-[#C7F9CC] hover:bg-[#F0FFF0] hover:scale-105 transition-all duration-300 cursor-pointer"
          >
            <div className="flex items-center gap-4 mb-4">
              <div className="p-4 bg-[#E9FCE9] rounded-full shadow">
                {game.icon}
              </div>
              <h2 className="text-2xl font-bold text-gray-900">
                {game.title}
              </h2>
            </div>

            <p className="text-gray-700 text-sm mb-4">{game.category}</p>

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
    </div>
  );
}
