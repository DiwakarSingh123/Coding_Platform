import React, { useState, useEffect } from 'react';
import { HiOutlineRefresh } from "react-icons/hi";
import { FaSlidersH } from "react-icons/fa";
import { BiBorderAll } from "react-icons/bi";
import { Check, Circle, AlertCircle, ChevronLeft, ChevronRight } from "lucide-react";
import axiosClient from '../utils/axiosClient';
import { NavLink, Link } from 'react-router';
import { useSelector } from 'react-redux';
import Navbar from '../Components/Navbar';
const Problems = () => {
    const [refresh, setRefresh] = useState(true);
    const [selectedTopics, setSelectedTopics] = useState(["all-tags"]);
    const [topicCounts, setTopicCounts] = useState({});
    const [currentPage, setCurrentPage] = useState(1);

    const [searchTerm, setSearchTerm] = useState(""); // 🔹 search state
    const [selectedDifficulty, setSelectedDifficulty] = useState("All"); // 🔹 difficulty state
    const [selectedStatus, setSelectedStatus] = useState("All"); // 🔹 status state

    const problemsPerPage = 10;

    // const [problems] = useState([
    //     { id: 1, title: "Add Two Numbers", difficulty: "Easy", topics: ["linked-list", "mathematical"], status: "solved" },
    //     { id: 2, title: "Longest Substring Without Repeating...", difficulty: "Easy", topics: ["sliding-window", "hash-maps"], status: "solved" },
    //     { id: 3, title: "Valid Parentheses", difficulty: "Easy", topics: ["stacks", "strings"], status: "solved" },
    //     { id: 4, title: "Merge Two Sorted Lists", difficulty: "Easy", topics: ["linked-list", "recursion"], status: "solved" },
    //     { id: 5, title: "Best Time to Buy and Sell Stock", difficulty: "Easy", topics: ["arrays", "greedy"], status: "attempted" },
    //     { id: 6, title: "Climbing Stairs", difficulty: "Easy", topics: ["dynamic-programming", "mathematical"], status: "" },
    //     { id: 7, title: "Product of Array Except Self", difficulty: "Medium", topics: ["arrays", "prefix-sum"], status: "solved" },
    //     { id: 8, title: "Search in Rotated Sorted Array", difficulty: "Medium", topics: ["arrays", "binary-search"], status: "attempted" },
    //     { id: 9, title: "Maximum Subarray", difficulty: "Medium", topics: ["arrays", "dynamic-programming"], status: "" },
    //     { id: 10, title: "Merge Intervals", difficulty: "Medium", topics: ["arrays", "sorting"], status: "solved" },
    //     { id: 11, title: "Merge Intervals", difficulty: "Medium", topics: ["arrays", "sorting"], status: "solved" },
    //     { id: 12, title: "Merge Intervals", difficulty: "Medium", topics: ["arrays", "sorting"], status: "solved" },
    // ]);

    const [problems, setProblems] = useState([]);
    const [loading, setLoading] = useState(true);
    const [fetchError, setFetchError] = useState(null);
    const { user } = useSelector((state) => state.auth);

    // Count topics
    useEffect(() => {

        // Now here i fetch the all problems and solved problems
        const fetchAllProblem = async () => {
            setLoading(true);
            setFetchError(null);
            try {
                const { data } = await axiosClient.get('/problem/allProblem');
                // fetch solved problems to mark status correctly
                let solvedIds = [];
                try {
                    const { data: solvedData } = await axiosClient.get('/problem/solved');
                    solvedIds = solvedData.map(p => p._id);
                } catch (_) {}

                const hero = data.map((val) => ({
                    ...val,
                    status: solvedIds.includes(val._id) ? "solved" : ""
                }));
                setProblems(hero);

                const counts = {};
                hero.forEach((problem) => {
                    problem.tags.forEach((topic) => {
                        counts[topic] = (counts[topic] || 0) + 1;
                    });
                });
                counts["all-tags"] = hero.length;
                setTopicCounts(counts);
            } catch (error) {
                console.error('Error fetching problems:', error);
                setFetchError('Failed to load problems. Please refresh.');
            } finally {
                setLoading(false);
            }
        };
    }, [user]);

    const toggleTopic = (topic) => {
        if (selectedTopics.includes(topic)) {
            // Clicking the already selected tag → deselect it
            setSelectedTopics([]);
        } else {
            // Only select the clicked tag
            setSelectedTopics([topic]);
        }
        setCurrentPage(1);
    };


    const formatTopicName = (topic) => {
        if (topic === "all-tags") return "All Tags";
        return topic
            .split("-")
            .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
            .join("-");
    };

    // 🔹 Apply all filters here
    const filteredProblems = problems
        .filter((problem) =>
            selectedTopics.length === 0 || selectedTopics.includes("all-tags")
                ? true
                : problem.tags.some((topic) => selectedTopics.includes(topic))
        )
        .filter((problem) =>
            searchTerm.trim() === "" ? true : problem.title.toLowerCase().includes(searchTerm.toLowerCase())
        )
        .filter((problem) =>
            selectedDifficulty === "All" ? true : problem.difficulty === selectedDifficulty
        )
        .filter((problem) =>
            selectedStatus === "All"
                ? true
                : selectedStatus.toLowerCase() === problem.status.toLowerCase()
        );

    // Pagination
    const indexOfLastProblem = currentPage * problemsPerPage;
    const indexOfFirstProblem = indexOfLastProblem - problemsPerPage;
    const currentProblems = filteredProblems.slice(indexOfFirstProblem, indexOfLastProblem);
    const totalPages = Math.ceil(filteredProblems.length / problemsPerPage);

    const getStatusIcon = (status) => {
        switch (status) {
            case "solved":
                return <Check className="h-5 w-5 text-green-500" />;
            case "attempted":
                return <AlertCircle className="h-5 w-5 text-yellow-500" />;
            default:
                return <Circle className="h-5 w-5 text-gray-400" />;
        }
    };

    const getDifficultyColor = (difficulty) => {
        switch (difficulty) {
            case "Easy":
                return "text-green-500";
            case "Medium":
                return "text-yellow-500";
            case "Hard":
                return "text-red-500";
            default:
                return "text-gray-400";
        }
    };

    // here the code of right side part means status bar showing dynamically
    const total = problems.length;
    const solved = problems.filter(p => p.status === "solved").length;
    const attempted = problems.filter(p => p.status === "attempted").length;

    // difficulty breakdown
    const difficultyLevels = ["Easy", "Medium", "Hard"];
    const difficultyStats = difficultyLevels.map(level => {
        const totalByLevel = problems.filter(p => p.difficulty === level).length;
        const solvedByLevel = problems.filter(p => p.difficulty === level && p.status === "solved").length;
        return { level, total: totalByLevel, solved: solvedByLevel };
    });

    // circle progress
    const radius = 40;
    const circumference = 2 * Math.PI * radius;
    const progress = (solved / total) * circumference;


    return (
        <>
           <Navbar />
            <div className="container mx-auto p-4 px-1 md:px-12 py-4">

                <div className="pl-3">
                    <h1 className="text-2xl font-bold mb-2 text-3xl">Your Coding Journey</h1>
                    <p className="text-gray-400 mb-4">You've conquered 0 challenges. Keep the momentum!</p>
                </div>


                {/* Main Content */}
                <div className="flex flex-col md:flex-row gap-4 ">

                    {/* Problem List */}
                    <div className="flex-1 bg-gray-800 p-4 rounded-lg">
                        {/* Filter & Sort */}
                        <div className="bg-gray-800 p-4 rounded-lg flex flex-col xl:flex-row xl:items-center xl:justify-between gap-4">
                            <span className="text-lg font-bold">
                                Filter & Sort ({filteredProblems.length})
                            </span>

                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:flex lg:flex-row items-center gap-3 w-full xl:w-auto">
                                {/* 🔹 Search */}
                                <input
                                    type="text"
                                    placeholder="Search by title..."
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    className="bg-gray-700 p-2 rounded-lg w-full lg:w-48 xl:w-64"
                                />

                                {/* 🔹 Difficulty */}
                                <select
                                    className="bg-gray-700 p-2 rounded-lg w-full lg:w-auto"
                                    value={selectedDifficulty}
                                    onChange={(e) => setSelectedDifficulty(e.target.value)}
                                >
                                    <option value="All">All Difficulties</option>
                                    <option value="Easy">Easy</option>
                                    <option value="Medium">Medium</option>
                                    <option value="Hard">Hard</option>
                                </select>

                                {/* 🔹 Status */}
                                <select
                                    className="bg-gray-700 p-2 rounded-lg w-full lg:w-auto"
                                    value={selectedStatus}
                                    onChange={(e) => setSelectedStatus(e.target.value)}
                                >
                                    <option value="All">All Statuses</option>
                                    <option value="Solved">Solved</option>
                                    <option value="Attempted">Attempted</option>
                                    <option value="">Not Started</option>
                                </select>

                                {/* 🔹 Action Group */}
                                <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
                                    <button
                                        className={`${refresh === false ? "bg-[#334155]" : "bg-blue-600"} p-2 rounded-[7px] flex items-center justify-center min-w-[40px]`}
                                        onClick={() => {
                                            setSearchTerm("");
                                            setSelectedDifficulty("All");
                                            setSelectedStatus("All");
                                            setSelectedTopics(["all-tags"]);
                                            setRefresh(prev => !prev);
                                        }}
                                    >
                                        <HiOutlineRefresh />
                                    </button>

                                    <div className="flex">
                                        <button className="bg-blue-600 p-2 rounded-l-lg border-r border-blue-700">
                                            <FaSlidersH />
                                        </button>
                                        <button className="bg-[#334155] p-2 rounded-r-lg">
                                            <BiBorderAll />
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>


                        {/* this code for status filter */}
                        <div className="flex flex-col space-y-4 bg-slate-950 text-white p-4 rounded-lg">

                            {/* Topic Filter */}
                            <div className="w-full bg-slate-900 p-4 rounded-lg flex flex-wrap gap-2">
                                {["all-tags", ...Object.keys(topicCounts).filter(t => t !== "all-tags").sort()].map((topic) => (
                                    <span
                                        key={topic}
                                        className={`cursor-pointer px-3 py-1 rounded-full text-sm 
        ${selectedTopics[0] === topic
                                                ? "bg-blue-600 text-white ring-2 ring-blue-400" // primary for selected
                                                : "bg-[#334155] hover:bg-blue-800 text-gray-300" // normal for others
                                            }`}
                                        onClick={() => {
                                            setSelectedTopics([topic]);
                                            setRefresh(false);
                                        }} // single selection
                                    >
                                        {topic === "all-tags" ? "All Tags" : formatTopicName(topic)} ({topicCounts[topic]})
                                    </span>
                                ))}
                            </div>

                            {/* Problem List */}
                            <div className="w-full overflow-x-auto">
                                <table className="w-full border-collapse">
                                    <thead>
                                        <tr className="border-b border-slate-700 text-left">
                                            <th className="p-3 text-slate-400 font-medium">STATUS</th>
                                            <th className="p-3 text-slate-400 font-medium">NO.</th>
                                            <th className="p-3 text-slate-400 font-medium">TITLE</th>
                                            <th className="p-3 text-slate-400 font-medium">DIFFICULTY</th>
                                            <th className="p-3 text-slate-400 font-medium">TOPICS</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {loading ? (
                                            <tr>
                                                <td colSpan="5" className="p-8 text-center">
                                                    <div className="flex items-center justify-center gap-3 text-blue-400">
                                                        <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-400"></div>
                                                        <span>Loading problems...</span>
                                                    </div>
                                                </td>
                                            </tr>
                                        ) : fetchError ? (
                                            <tr>
                                                <td colSpan="5" className="p-8 text-center text-red-400">
                                                    {fetchError}
                                                </td>
                                            </tr>
                                        ) : currentProblems.length === 0 ? (
                                            <tr>
                                                <td colSpan="5" className="p-8 text-center text-gray-400">
                                                    No problems match your filters.
                                                </td>
                                            </tr>
                                        ) : (
                                            currentProblems.map((problem, ind) => (
                                                <tr key={problem._id} className="border-b border-slate-800 hover:bg-slate-800/50">
                                                    <td className="p-3">{getStatusIcon(problem.status)}</td>
                                                    <td className="p-3 text-blue-400">{indexOfFirstProblem + ind + 1}.</td>
                                                    <td className="p-3 font-medium">
                                                        <NavLink to={`/problem/${problem._id}`} className="hover:text-primary">{problem.title}</NavLink>
                                                    </td>
                                                    <td className={`p-3 ${getDifficultyColor(problem.difficulty)}`}>{problem.difficulty}</td>
                                                    <td className="p-3 flex flex-wrap gap-1">
                                                        {problem.tags.map(topic => (
                                                            <span key={`${problem._id}-${topic}`} className="bg-slate-700 text-xs px-2 py-0.5 rounded-full">{topic}</span>
                                                        ))}
                                                    </td>
                                                </tr>
                                            ))
                                        )}
                                    </tbody>
                                </table>
                            </div>

                            {/* Pagination */}
                            <div className="flex justify-between items-center mt-4">
                                <button
                                    className="flex items-center px-3 py-1 border rounded text-slate-300 border-slate-700 disabled:opacity-50"
                                    onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                                    disabled={currentPage === 1}
                                >
                                    <ChevronLeft className="h-4 w-4 mr-1" /> Previous
                                </button>

                                <div className="flex space-x-1">
                                    {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
                                        <button
                                            key={page}
                                            className={`px-3 py-1 rounded border ${currentPage === page ? "bg-blue-600 hover:bg-blue-700 text-white" : "text-slate-300 border-slate-700"}`}
                                            onClick={() => setCurrentPage(page)}
                                        >
                                            {page}
                                        </button>
                                    ))}
                                </div>

                                <button
                                    className="flex items-center px-3 py-1 border rounded text-slate-300 border-slate-700 disabled:opacity-50"
                                    onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                                    disabled={currentPage === totalPages}
                                >
                                    Next <ChevronRight className="h-4 w-4 ml-1" />
                                </button>
                            </div>
                        </div>

                    </div>

                    {/* Stats Panel */}
                    <div className="w-full md:w-1/4 space-y-4">
                        {/* My Stats */}
                        <div className="bg-gray-800 p-4 rounded-lg">
                            <h2 className="text-lg font-bold mb-2">My Stats</h2>
                            <div className="relative w-32 h-32 mx-auto">
                                <svg className="w-full h-full">
                                    <circle
                                        cx="50%"
                                        cy="50%"
                                        r={radius}
                                        fill="none"
                                        stroke="#4B5563"
                                        strokeWidth="8"
                                    />
                                    <circle
                                        cx="50%"
                                        cy="50%"
                                        r={radius}
                                        fill="none"
                                        stroke="#3B82F6"
                                        strokeWidth="8"
                                        strokeDasharray={circumference}
                                        strokeDashoffset={circumference - progress}
                                        strokeLinecap="round"
                                    />
                                </svg>
                                <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-center">
                                    <div className="text-2xl font-bold">{solved}</div>
                                    <div className="text-sm text-gray-400">/ {total}</div>
                                </div>
                            </div>
                            <div className="text-center mt-4">
                                <p className="text-green-400">Solved <span>{solved}</span></p>
                                <p className="text-yellow-400">Attempted <span>{attempted}</span></p>
                            </div>
                        </div>

                        {/* Difficulty Breakdown */}
                        <div className="bg-gray-800 p-4 rounded-lg">
                            <h2 className="text-lg font-bold mb-2">Difficulty Breakdown</h2>
                            <div className="space-y-2">
                                {difficultyStats.map(d => (
                                    <div key={d.level} className="flex justify-between">
                                        <span
                                            className={
                                                d.level === "Easy"
                                                    ? "text-green-400"
                                                    : d.level === "Medium"
                                                        ? "text-yellow-400"
                                                        : "text-red-400"
                                            }
                                        >
                                            {d.level}
                                        </span>
                                        <span>{d.solved} / {d.total}</span>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* My Sprints */}
                        <div className="bg-gray-800 p-4 rounded-lg">
                            <h2 className="text-lg font-bold mb-2">My Sprints</h2>
                            <p className="text-gray-400">You have no active sprints.</p>
                            <button className="bg-blue-600 w-full p-2 rounded-lg mt-2">Start a new Sprint</button>
                        </div>

                        {/* My Problems */}
                        <div className="bg-gray-800 p-4 rounded-lg">
                            <h2 className="text-lg font-bold mb-2">My Problems</h2>
                            <div className="space-y-2">
                                <div>Liked <span className="text-gray-400">0 problems</span></div>
                                <div>Favorited <span className="text-gray-400">0 problems</span></div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
};

export default Problems;