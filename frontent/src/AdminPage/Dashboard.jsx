import React, { useState, useEffect } from "react";
import { Link } from "react-router";
import {
  FiCode,
  FiClipboard,
  FiCheckCircle,
  FiUsers,
} from "react-icons/fi";
import { FaPlus } from "react-icons/fa6";
import { CiCircleChevRight } from "react-icons/ci";
import { MdErrorOutline, MdCancel } from "react-icons/md";
import axiosClient from "../utils/axiosClient";

const Dashboard = () => {
  const [problems, setProblems] = useState([]);
  const [visibleCount, setVisibleCount] = useState(5); // show only 5 initially
  const [deficulty,setDeficulty]=useState({})
  const [users,setUsers]=useState(10);
  const stats = [
    { id: 1, label: "Total Problems", value: problems.length, icon: <FiClipboard size={22} /> },
    { id: 2, label: "Submissions", value: "205", icon: <FiCheckCircle size={22} /> },
    { id: 3, label: "Acceptance Rate", value: "23.2%", icon: <FiCode size={22} /> },
    { id: 4, label: "Active Users", value: users?.data?.length, icon: <FiUsers size={22} /> },
    { id: 5, label: "Easy Problems", value: deficulty?.easy?.length, icon: <CiCircleChevRight size={22} /> },
    { id: 6, label: "Medium Problems", value: deficulty?.medium?.length, icon: <MdErrorOutline size={22} /> },
    { id: 7, label: "Hard Problems", value: deficulty?.hard?.length, icon: <MdCancel size={22} /> },
  ];

  const diffColors = {
    Easy: "bg-[#2B534D]",
    Medium: "bg-[#53503C]",
    Hard: "bg-[#4a303e]",
  };

  useEffect(() => {
    const fetchAllProblem = async () => {
      try {
        const { data } = await axiosClient.get("/problem/allProblem");
        const users = await axiosClient.get("/api/getAllUsers");
        console.log(users);
        
        setUsers(users);
        // dynamically adding deficulty counts of problem.........
        const Easy=data.filter((val)=>val.difficulty==="Easy");
        const Medium=data.filter((val)=>val.difficulty==="Medium");
        const Hard=data.filter((val)=>val.difficulty==="Hard");
       
        
        const obj={
            easy:Easy,
            medium:Medium,
            hard:Hard
        }
        setDeficulty(obj);
        // Sort ascending by createdAt
        const sorted = [...data].sort(
          (a, b) => new Date(a.createdAt) - new Date(b.createdAt)
        );

        setProblems(sorted);
      } catch (err) {
        console.error("Error is " + err);
      }
    };

    fetchAllProblem();
  }, []);

  // Slice only visible problems
  const visibleProblems = problems.slice(0, visibleCount);

  return (
    <>
      {/* Top Header */}
      <header className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold">Problem Management</h1>
          <p className="text-gray-500 dark:text-gray-400 mt-1">
            Create, update, and manage coding problems
          </p>
        </div>
        <Link
          to="/admin/create"
          className="flex items-center gap-2 p-2 rounded-md bg-blue-600 cursor-pointer w-full sm:w-auto justify-center"
        >
          <FaPlus /> Create Problem
        </Link>
      </header>

      {/* Stats */}
      <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((s) => (
          <div
            key={s.id}
            className="bg-[#1E293B] p-4 rounded-lg flex items-center justify-between"
          >
            <div>
              <div className="text-gray-400">{s.label}</div>
              <div className="text-xl font-bold">{s.value}</div>
            </div>
            <div className="text-blue-400">{s.icon}</div>
          </div>
        ))}
      </section>

      {/* Recent Problems */}
      <section className="bg-[#1E293B] p-6 rounded-lg">
        <h3 className="text-lg font-bold mb-4">Recent Problems</h3>
        <ul className="divide-y divide-gray-700">
          {visibleProblems.map((p) => (
            <li key={p._id} className="flex justify-between items-center py-3">
              <div>
                <div className="font-medium hover:text-primary cursor-pointer">{p.title}</div>
                <div className="text-sm text-gray-400">
                  Created on {new Date(p.createdAt).toISOString().split("T")[0]}
                </div>
              </div>
              <span
                className={`px-3 py-1 rounded-full text-xs ${
                  diffColors[p.difficulty]
                }`}
              >
                {p.difficulty}
              </span>
            </li>
          ))}
        </ul>

        {/* Load more button */}
        {visibleCount < problems.length && (
          <div className="text-right mt-3">
            <button
              className="text-blue-400 hover:underline"
              onClick={() => setVisibleCount((prev) => prev + 5)}
            >
              View More Problems
            </button>
          </div>
        )}
      </section>
    </>
  );
};

export default Dashboard;
