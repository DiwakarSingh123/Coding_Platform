import React, { useState, useEffect } from "react";
import axiosClient from "../utils/axiosClient";
import { Link } from "react-router";

const difficultyColors = {
  Easy: "bg-green-700 text-white",
  Medium: "bg-yellow-600 text-white",
  Hard: "bg-red-600 text-white",
};

const AdminProblem = () => {
  const [problems, setProblems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterDifficulty, setFilterDifficulty] = useState("All");

  const filteredProblems = problems.filter((problem) => {
    const matchesSearch = problem.title?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesDifficulty = filterDifficulty === "All" || problem.difficulty === filterDifficulty;
    return matchesSearch && matchesDifficulty;
  });

  useEffect(() => {
    const fetchAllProblem = async () => {
      try {
        const { data } = await axiosClient.get("/problem/allProblem");
        setProblems(data);
      } catch (err) {
        console.error("Error fetching problems:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchAllProblem();
  }, []);

  return (
    <div className="min-h-screen bg-gray-900 text-white p-6">
      
      <div className="max-w-5xl mx-auto">
        <h1 className="text-3xl font-bold mb-6">All Problems.</h1>
        {/* Search & Filter */}
        <div className="flex flex-col md:flex-row justify-between items-center gap-4 mb-6">
          <input
            type="text"
            placeholder="Search problems..."
            className="px-4 py-2 rounded-lg bg-gray-800 border border-gray-700 text-white w-full md:w-1/2"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />

          <select
            className="px-4 py-2 rounded-lg bg-gray-800 border border-gray-700 text-white"
            value={filterDifficulty}
            onChange={(e) => setFilterDifficulty(e.target.value)}
          >
            <option value="All">All Difficulties</option>
            <option value="Easy">Easy</option>
            <option value="Medium">Medium</option>
            <option value="Hard">Hard</option>
          </select>
        </div>

        {/* Problems List */}
        <div className="bg-gray-800 rounded-xl shadow-lg overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-gray-700 text-gray-300">
              <tr>
                <th className="px-4 py-3">ID</th>
                <th className="px-4 py-3">Title</th>
                <th className="px-4 py-3">Difficulty</th>
                <th className="px-4 py-3">Tags</th>
                <th className="px-4 py-3">Created</th>
                <th className="px-4 py-3 text-center">Action</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan="6" className="p-8 text-center">
                    <div className="flex items-center justify-center gap-3 text-yellow-400">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-yellow-400"></div>
                      <span>Loading Problems...</span>
                    </div>
                  </td>
                </tr>
              ) : filteredProblems.length > 0 ? (
                filteredProblems.map((problem, ind) => (
                  <tr key={problem._id} className="hover:bg-gray-700 transition-colors">
                    <td className="px-4 py-3">{ind + 1}</td>
                    <td className="p-3 hover:text-primary cursor-pointer">{problem.title}</td>
                    <td className="px-4 py-3">
                      <span className={`px-3 py-1 rounded-full text-sm ${
                        problem.difficulty === "Easy" ? "bg-green-600/30 text-green-400"
                        : problem.difficulty === "Medium" ? "bg-yellow-600/30 text-yellow-400"
                        : "bg-red-600/30 text-red-400"
                      }`}>
                        {problem.difficulty}
                      </span>
                    </td>
                    <td className="p-3 flex flex-wrap gap-1">
                      {problem.tags.map(topic => (
                        <span key={`${problem._id}-${topic}`} className="bg-slate-700 text-xs px-2 py-0.5 rounded-full">{topic}</span>
                      ))}
                    </td>
                    <td className="px-4 py-3">{new Date(problem.createdAt).toLocaleDateString()}</td>
                    <td className="px-4 py-3 text-center">
                      <Link to={`/admin/update/${problem._id}`} className="px-3 py-1 bg-blue-600 hover:bg-blue-500 text-white text-sm rounded-md transition-colors">
                        Update
                      </Link>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="6" className="p-6 text-center text-gray-400">No problems found.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default AdminProblem;
