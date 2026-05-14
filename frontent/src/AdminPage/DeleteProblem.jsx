import React, { useState, useEffect } from "react";
import { MdOutlineDeleteForever } from "react-icons/md";
import axiosClient from "../utils/axiosClient";
import { NavLink } from "react-router";

const DeleteProblem = () => {
  const [problems, setProblems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [difficulty, setDifficulty] = useState("All");
  const [isDeleting, setIsDeleting] = useState(null);

  const handleDeleteProblem = async (id) => {
    if (window.confirm("Are you sure you want to delete this problem?")) {
      setIsDeleting(id);
      try {
        await axiosClient.delete(`/problem/delete/${id}`);
        setProblems(problems.filter((p) => p._id !== id));
      } catch (error) {
        console.error(error);
        alert("Error deleting problem");
      } finally {
        setIsDeleting(null);
      }
    }
  };

  useEffect(() => {
    const fetchAllProblem = async () => {
      try {
        const { data } = await axiosClient.get('/problem/allProblem');
        setProblems(data);
      } catch (err) {
        console.error("Error fetching problems:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchAllProblem();
  }, []);

  const filteredProblems = problems.filter((p) =>
    p.title.toLowerCase().includes(searchTerm.toLowerCase()) &&
    (difficulty === "All" || p.difficulty === difficulty)
  );

  return (
    <div className="min-h-screen bg-gray-900 text-white p-6">
      <h1 className="text-3xl font-bold mb-6">Delete Problem Here.</h1>
      {/* Search + Filter */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6 gap-4">
        <input
          type="text"
          placeholder="Search problems..."
          className="px-4 py-2 rounded-lg bg-gray-800 border border-gray-700 text-white w-full sm:w-1/2"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />

        <select
          className="px-4 py-2 rounded-lg bg-gray-800 border border-gray-700 text-white"
          value={difficulty}
          onChange={(e) => setDifficulty(e.target.value)}
        >
          <option value="All">All Difficulties</option>
          <option value="Easy">Easy</option>
          <option value="Medium">Medium</option>
          <option value="Hard">Hard</option>
        </select>
      </div>

      {/* Table */}
      <div className="bg-gray-800 rounded-lg shadow-lg overflow-x-auto">
        <table className="w-full text-left">
          <thead className="bg-gray-700">
            <tr>
              <th className="p-3">ID</th>
              <th className="p-3">Title</th>
              <th className="p-3">Difficulty</th>
              <th className="p-3">Category</th>
              <th className="p-3">Action</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan="5" className="p-8 text-center">
                  <div className="flex items-center justify-center gap-3 text-yellow-400">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-yellow-400"></div>
                    <span>Loading Problems...</span>
                  </div>
                </td>
              </tr>
            ) : filteredProblems.length > 0 ? (
              filteredProblems.map((problem, ind) => (
                <tr
                  key={problem._id}
                  className="border-b border-gray-700 hover:bg-gray-700/50"
                >
                  <td className="p-3">{ind + 1}</td>
                  <td className="p-3 hover:text-primary cursor-pointer">
                    {problem.title}
                  </td>
                  <td className="p-3">
                    <span
                      className={`px-3 py-1 rounded-full text-sm ${problem.difficulty === "Easy"
                        ? "bg-green-600/30 text-green-400"
                        : problem.difficulty === "Medium"
                          ? "bg-yellow-600/30 text-yellow-400"
                          : "bg-red-600/30 text-red-400"
                        }`}
                    >
                      {problem.difficulty}
                    </span>
                  </td>
                  <td className="p-3 flex flex-wrap gap-1">
                    {problem.tags.map(topic => (
                      <span key={`${problem._id}-${topic}`} className="bg-slate-700 text-xs px-2 py-0.5 rounded-full">{topic}</span>
                    ))}
                  </td>
                  <td className="p-3">
                    <button
                      onClick={() => handleDeleteProblem(problem._id)}
                      disabled={isDeleting === problem._id}
                      className={`text-red-500 hover:text-red-400 text-xl disabled:opacity-50 ${isDeleting === problem._id ? 'animate-pulse' : ''}`}
                    >
                      <MdOutlineDeleteForever />
                    </button>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="5" className="p-6 text-center text-gray-400">No problems found.</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default DeleteProblem;
