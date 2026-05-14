import React, { useEffect, useState } from "react";
import axiosClient from "../utils/axiosClient";
import { FaChevronDown, FaChevronUp, FaRegCopy } from "react-icons/fa";
import Editor from "@monaco-editor/react";
import { CheckCircle, XCircle, Clock, Cpu, AlertCircle } from "lucide-react";

const Subbmision = ({ pid }) => {
    const [submissions, setSubmissions] = useState([]);
    const [expandedRow, setExpandedRow] = useState(null);
    const [loading, setLoading] = useState(true);
    const [copied, setCopied] = useState(false);

    useEffect(() => {
        const fetchAllSubmission = async () => {
            setLoading(true);
            try {
                const res = await axiosClient.get(`/problem/submitedProblem/${pid}`);
                setSubmissions(Array.isArray(res.data) ? res.data : []);
            } catch (err) {
                console.error("Error fetching submissions:", err);
                setSubmissions([]);
            } finally {
                setLoading(false);
            }
        };
        fetchAllSubmission();
    }, [pid]);

    const getStatusConfig = (status) => {
        switch (status?.toLowerCase()) {
            case "accepted": return { color: "text-green-400", bg: "bg-green-400/10 border-green-400/20", icon: <CheckCircle size={13} /> };
            case "wrong": return { color: "text-red-400", bg: "bg-red-400/10 border-red-400/20", icon: <XCircle size={13} /> };
            case "error": return { color: "text-orange-400", bg: "bg-orange-400/10 border-orange-400/20", icon: <AlertCircle size={13} /> };
            case "pending": return { color: "text-yellow-400", bg: "bg-yellow-400/10 border-yellow-400/20", icon: <Clock size={13} /> };
            default: return { color: "text-gray-400", bg: "bg-gray-400/10 border-gray-400/20", icon: null };
        }
    };

    const formatTimeAgo = (dateStr) => {
        if (!dateStr) return "";
        const diff = Date.now() - new Date(dateStr).getTime();
        const minutes = Math.floor(diff / 60000);
        if (minutes < 1) return "just now";
        if (minutes < 60) return `${minutes}m ago`;
        const hours = Math.floor(minutes / 60);
        if (hours < 24) return `${hours}h ago`;
        return `${Math.floor(hours / 24)}d ago`;
    };

    const handleCopy = (code) => {
        navigator.clipboard.writeText(code);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    if (loading) return (
        <div className="flex items-center justify-center py-16">
            <div className="w-6 h-6 border-2 border-orange-500 border-t-transparent rounded-full animate-spin" />
        </div>
    );

    return (
        <div className="p-4">
            <div className="flex items-center justify-between mb-4">
                <h2 className="text-sm font-semibold text-white">My Submissions</h2>
                <span className="text-xs text-gray-500">{submissions.length} total</span>
            </div>

            {submissions.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-16 text-gray-500">
                    <span className="text-4xl mb-3">📭</span>
                    <p className="text-sm">No submissions yet</p>
                    <p className="text-xs mt-1 text-gray-600">Submit your solution to see it here</p>
                </div>
            ) : (
                <div className="space-y-2">
                    {submissions.map((sub, idx) => {
                        const { color, bg, icon } = getStatusConfig(sub.status);
                        const isExpanded = expandedRow === idx;
                        return (
                            <div key={idx} className="rounded-lg border border-[#3d3d3d] overflow-hidden">
                                <button
                                    className="w-full flex items-center gap-3 px-4 py-3 bg-[#282828] hover:bg-[#2f2f2f] transition-colors text-left"
                                    onClick={() => setExpandedRow(isExpanded ? null : idx)}
                                >
                                    <div className={`flex items-center gap-1.5 text-xs font-medium px-2 py-0.5 rounded-full border ${bg} ${color}`}>
                                        {icon}
                                        {sub.status === "accepted" ? "Accepted" : sub.status === "wrong" ? "Wrong Answer" : sub.status === "error" ? "Runtime Error" : sub.status}
                                    </div>
                                    <span className="text-xs text-gray-400 bg-[#3d3d3d] px-2 py-0.5 rounded">{sub.language}</span>
                                    {sub.status === "accepted" && (
                                        <>
                                            <span className="text-xs text-gray-500 flex items-center gap-1"><Clock size={11} />{sub.runtime}s</span>
                                            <span className="text-xs text-gray-500 flex items-center gap-1"><Cpu size={11} />{sub.memory}KB</span>
                                        </>
                                    )}
                                    <span className="ml-auto text-xs text-gray-600">{formatTimeAgo(sub.createdAt)}</span>
                                    {isExpanded ? <FaChevronUp className="text-gray-500 text-xs" /> : <FaChevronDown className="text-gray-500 text-xs" />}
                                </button>

                                {isExpanded && (
                                    <div className="border-t border-[#3d3d3d]">
                                        <div className="flex items-center justify-between px-4 py-2 bg-[#1e1e1e]">
                                            <span className="text-xs text-gray-400">Submitted Code</span>
                                            <button
                                                onClick={() => handleCopy(sub.code)}
                                                className="flex items-center gap-1.5 text-xs text-gray-400 hover:text-white px-2 py-1 rounded bg-[#3d3d3d] hover:bg-[#4d4d4d] transition-colors"
                                            >
                                                <FaRegCopy size={11} />
                                                {copied ? "Copied!" : "Copy"}
                                            </button>
                                        </div>
                                        <Editor
                                            height="280px"
                                            language={sub.language === "c++" ? "cpp" : sub.language?.toLowerCase()}
                                            value={sub.code}
                                            theme="vs-dark"
                                            options={{ readOnly: true, minimap: { enabled: false }, scrollBeyondLastLine: false, fontSize: 13 }}
                                        />
                                    </div>
                                )}
                            </div>
                        );
                    })}
                </div>
            )}
        </div>
    );
};

export default Subbmision;
