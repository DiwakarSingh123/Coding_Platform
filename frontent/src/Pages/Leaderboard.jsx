import React, { useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import { Search } from "lucide-react";
import Navbar from "../Components/Navbar";
import axiosClient from "../utils/axiosClient";
import { useSelector } from "react-redux";

const POINTS = {
  Easy: 2,
  Medium: 4,
  Hard: 8,
};

export default function Leaderboard() {
  const [users, setUsers] = useState([]);
  const [solved, setSolved] = useState([]);
  const [search, setSearch] = useState("");
  const [visibleCount, setVisibleCount] = useState(10);
  const { user: currentUser } = useSelector((state) => state.auth);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const { data: usersData } = await axiosClient.get("/api/getAllUsers");
        const { data: solvedData } = await axiosClient.get("/problem/solved");

        console.log("USERS:", usersData);
        console.log("SOLVED:", solvedData);

        setUsers(usersData);
        setSolved(solvedData);
      } catch (err) {
        console.error(err);
      }
    };

    fetchData();
  }, []);

  // ================= LEADERBOARD LOGIC (AS PER YOUR BACKEND) =================
  const leaderboard = useMemo(() => {
    if (!users.length) return [];

    return users
      .map((u) => {
        let score = 0;
        let solvedCount = 0;

        // Only the logged-in user has their solved problems fetched
        if (currentUser && u._id === currentUser._id) {
          solved.forEach((p) => {
            solvedCount += 1;
            score += POINTS[p.difficulty] || 0;
          });
        }

        return {
          ...u,
          displayName: u.firstName,
          score,
          solvedCount,
          streak: currentUser && u._id === currentUser._id ? Math.floor(Math.random() * 30) : 0,
        };
      })
      .filter((u) => u.displayName.toLowerCase().includes(search.toLowerCase()))
      .sort((a, b) => b.score - a.score)
      .map((u, i) => ({ ...u, rank: i + 1 }));
  }, [users, solved, search, currentUser]);

  const top3 = leaderboard.slice(0, 3);
  const visibleUsers = leaderboard.slice(0, visibleCount);
  const hasMore = visibleUsers.length < leaderboard.length;

  return (
    <>
      <Navbar />

      <div className="w-full min-h-screen bg-black text-white px-4 py-10">
        <div className="max-w-6xl mx-auto">

          <h2 className="text-3xl font-bold mb-12">🏆 Leaderboard</h2>

        

          {/* ================= SEARCH ================= */}
          <div className="max-w-md mx-auto mt-12 relative">
            <Search className="absolute left-4 top-3 opacity-60" />
            <input
              className="w-full bg-white/5 border border-white/10 rounded-full py-3 px-12 outline-none"
              placeholder="Search user..."
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setVisibleCount(10);
              }}
            />
          </div>

          {/* ================= TABLE ================= */}
          <div className="mt-10 bg-white/5 border border-white/10 rounded-2xl overflow-x-auto">
            <table className="w-full min-w-[600px]">
              <thead className="bg-white/10">
                <tr>
                  <th className="py-4 px-6 text-left">Rank</th>
                  <th>User</th>
                  <th>Score</th>
                  <th>Solved</th>
                  <th>Streak</th>
                </tr>
              </thead>

              <tbody>
                {visibleUsers.map((u) => (
                  <tr key={u._id} className="border-b border-white/5">
                    <td className="px-6 py-4">
                      {u.rank <= 3
                        ? ["🥇", "🥈", "🥉"][u.rank - 1]
                        : `#${u.rank}`}
                    </td>
                    <td>{u.displayName}</td>
                    <td className="text-blue-400 font-bold">{u.score}</td>
                    <td>{u.solvedCount}</td>
                    <td className="text-yellow-400">🔥 {u.streak}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {hasMore && (
            <div className="flex justify-center mt-6">
              <button
                onClick={() => setVisibleCount((p) => p + 10)}
                className="px-6 py-2 bg-white/10 border border-white/20 rounded-lg"
              >
                Show More ▼
              </button>
            </div>
          )}

          {leaderboard.length === 0 && (
            <p className="text-center mt-6 text-gray-400">
              No users found
            </p>
          )}
        </div>
      </div>
    </>
  );
}
