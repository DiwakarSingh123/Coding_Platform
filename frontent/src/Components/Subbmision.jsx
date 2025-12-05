import React, { useEffect, useState } from "react";
import axiosClient from "../utils/axiosClient";
import { FaChevronDown, FaChevronUp, FaRegCopy } from "react-icons/fa";
import { toast } from "react-toastify";
import Editor from "@monaco-editor/react";

const Subbmision = ({ pid }) => {
  const [submissions, setSubmissions] = useState([]);
  const [expandedRow, setExpandedRow] = useState(null);

  useEffect(() => {
    const fetchAllSubmission = async () => {
      try {
        const res = await axiosClient.get(`/problem/submitedProblem/${pid}`);
        console.log("Fetched Submissions:", res.data);

       setSubmissions(Array.isArray(res.data) ? res.data : []);
        console.log(submissions.length);
        
      } catch (err) {
        console.error("Error fetching submissions:", err);
        setSubmissions([]);
      }
    };
    fetchAllSubmission();
  }, [pid]);

  const getStatusColor = (status) => {
    switch (status?.toLowerCase()) {
      case "accepted":
        return "text-green-500";
      case "wrong":
        return "text-red-500";
      case "time limit exceeded":
        return "text-yellow-500";
      case "error":
        return "text-orange-500";
      case "pending":
        return "text-yellow-500";
      default:
        return "text-gray-400";
    }
  };

  const formatTimeAgo = (dateStr) => {
    if (!dateStr) return "";
    const diff = Date.now() - new Date(dateStr).getTime();
    const minutes = Math.floor(diff / (1000 * 60));
    if (minutes < 1) return "just now";
    if (minutes < 60) return `${minutes} min ago`;
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `${hours} hr ago`;
    const days = Math.floor(hours / 24);
    return `${days} day${days > 1 ? "s" : ""} ago`;
  };

  const handleCopy = (code) => {
    navigator.clipboard.writeText(code);
    toast.success("Code copied!");
  };

 if (!submissions) {
  return <div className="p-6 text-gray-400">Loading submissions...</div>;
}
  return (
    <div className="p-6 text-white">
      <h2 className="text-xl font-bold mb-2">Problem Submissions</h2>
      <p className="text-gray-400 mb-6">Viewing history for this problem</p>

      <div className="overflow-x-auto rounded-lg border border-gray-700">
        <table className="table-auto w-full text-sm">
          <thead className="bg-gray-800 text-gray-400">
            <tr>
              <th className="px-4 py-2"></th>
              <th className="px-4 py-2 text-left">STATUS</th>
              <th className="px-4 py-2 text-left">LANGUAGE</th>
              <th className="px-4 py-2 text-left">RUNTIME</th>
              <th className="px-4 py-2 text-left">MEMORY</th>
              <th className="px-4 py-2 text-left">TIME</th>
            </tr>
          </thead>
          <tbody className="bg-gray-900 divide-y divide-gray-700">
  {submissions.length > 0 ? (
    submissions.map((sub, idx) => (
      <React.Fragment key={idx}>
        <tr
          className="hover:bg-gray-800 cursor-pointer"
          onClick={() =>
            setExpandedRow(expandedRow === idx ? null : idx)
          }
        >
          <td className="px-4 py-2">
            {expandedRow === idx ? <FaChevronUp /> : <FaChevronDown />}
          </td>
          <td
            className={`px-4 py-2 font-medium ${getStatusColor(sub.status)}`}
          >
            {sub.status}
          </td>
          <td className="px-4 py-2">{sub.language}</td>
          <td className="px-4 py-2">{sub.runtime} ms</td>
          <td className="px-4 py-2">{sub.memory} MB</td>
          <td className="px-4 py-2">{formatTimeAgo(sub.createdAt)}</td>
        </tr>
        {expandedRow === idx && (
          <tr>
            <td colSpan="6" className="bg-gray-950 p-4">
              <div className="flex justify-between items-center mb-2">
                <h3 className="text-lg font-semibold">Submitted Code</h3>
                <button
                  onClick={() => handleCopy(sub.code)}
                  className="flex items-center gap-2 px-3 py-1 bg-gray-700 hover:bg-gray-600 rounded-md text-sm"
                >
                  <FaRegCopy /> Copy
                </button>
              </div>
              <Editor
                height="300px"
                language={sub.language?.toLowerCase()}
                value={sub.code}
                theme="vs-dark"
                options={{
                  readOnly: true,
                  minimap: { enabled: false },
                  scrollBeyondLastLine: false,
                }}
              />
            </td>
          </tr>
        )}
      </React.Fragment>
    ))
  ) : (
    <tr>
      <td colSpan="6" className="px-4 py-6 text-center text-gray-500">
        No submissions yet.
      </td>
    </tr>
  )}
</tbody>
        </table>
      </div>
    </div>
  );
};

export default Subbmision;
