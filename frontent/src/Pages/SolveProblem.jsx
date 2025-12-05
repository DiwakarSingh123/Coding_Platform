import { useState, useEffect, useRef } from "react";
import Editor from "@monaco-editor/react";
import { useParams } from "react-router";
import axiosClient from "../utils/axiosClient";
import { ChevronDown, ChevronUp, Lock, Lightbulb } from "lucide-react";
import { CiBookmarkCheck } from "react-icons/ci";
import Subbmision from "../Components/Subbmision";
import ChatAi from "../Components/ChatWithAI";

// ✅ Test Result Component (for Run)
const TestResult = ({ runResult }) => {
    if (!runResult) {
        return (
            <div className="p-4 text-gray-500 italic">
                Run code to see results here...
            </div>
        );
    }

    const total = runResult.testCasesTotal || 0;
    const passed = runResult.testCasesPassed || 0;
    const isAccepted = runResult.status === "accepted";

    return (
        <div
            className={`p-4 rounded-lg ${isAccepted
                ? "bg-green-100 border border-green-400"
                : "bg-red-100 border border-red-400"
                }`}
        >
            <h2
                className={`font-bold text-lg mb-2 ${isAccepted ? "text-green-700" : "text-red-700"
                    }`}
            >
                {isAccepted ? "✅ Accepted" : "❌ Wrong Answer"}
            </h2>
            <p className="text-green-400">
                {passed}/{total} test cases passed
            </p>
            {isAccepted ? (
                <p className="text-sm text-gray-600 mt-2">
                    Runtime: {runResult.runtime} sec | Memory: {runResult.memory} KB
                </p>
            ) : runResult.errorMessage ? (
                <p className="text-red-600 mt-2">{runResult.errorMessage}</p>
            ) : null}

            {/* Individual test cases UI (LeetCode style) */}
            <div className="mt-4 space-y-2">
                {Array.from({ length: total }).map((_, i) => {
                    const passedCase = i < passed;
                    return (
                        <div
                            key={i}
                            className={`p-2 rounded-md text-sm flex justify-between ${passedCase
                                ? "bg-green-50 text-green-700 border border-green-300"
                                : "bg-red-50 text-red-700 border border-red-300"
                                }`}
                        >
                            <span>Test Case #{i + 1}</span>
                            {passedCase ? "✅ Passed" : "❌ Failed"}
                        </div>
                    );
                })}
            </div>
        </div>
    );
};

// ✅ Submission Result Component
const SubmissionResult = ({ submitResult }) => {
    if (!submitResult) {
        return <p className="text-gray-500">Click Submit to see result.</p>;
    }

    const total = submitResult.testCasesTotal || 0;
    const passed = submitResult.testCasesPassed || 0;
    const isAccepted = submitResult.status === "accepted";

    return (
        <div
            className={`p-4 rounded-lg ${isAccepted
                ? "bg-green-100 border border-green-400"
                : "bg-red-100 border border-red-400"
                }`}
        >
            <h2
                className={`font-bold text-lg mb-2 ${isAccepted ? "text-green-700" : "text-red-700"
                    }`}
            >
                {isAccepted ? "🎉 Accepted" : "❌ Wrong Answer"}
            </h2>
            <p className="text-green-400">
                {passed}/{total} test cases passed
            </p>
            <p className="text-sm text-gray-600 mt-2">
                Runtime: {submitResult.runtime} sec | Memory: {submitResult.memory} KB
            </p>
            {submitResult.errorMessage && (
                <p className="text-red-600 mt-2">{submitResult.errorMessage}</p>
            )}
        </div>
    );
};

// Seeing the hints,tags and other thinks
const AccordionItem = ({ title, children, locked, icon }) => {
    const [open, setOpen] = useState(false);

    return (
        <div className="border-b border-gray-700">
            <button
                onClick={() => setOpen(!open)}
                className="flex items-center justify-between w-full px-4 py-3 text-gray-200 hover:bg-gray-800 transition"
            >
                <div className="flex items-center gap-2">
                    {icon}
                    <span className="font-medium">{title}</span>
                    {locked && <Lock size={16} className="text-yellow-500 ml-2" />}
                </div>
                {open ? (
                    <ChevronUp size={18} className="text-gray-400" />
                ) : (
                    <ChevronDown size={18} className="text-gray-400" />
                )}
            </button>
            {open && <div className="px-6 py-3 text-gray-300">{children}</div>}
        </div>
    );
};

const SolveProblem = () => {
    const [problem, setProblem] = useState(null);
    const [selectedLanguage, setSelectedLanguage] = useState("javascript");
    const [code, setCode] = useState("");
    const [loading, setLoading] = useState(false);
    const [runResult, setRunResult] = useState(null);
    const [submitResult, setSubmitResult] = useState(null);
    const [activeLeftTab, setActiveLeftTab] = useState("description");
    const [activeRightTab, setActiveRightTab] = useState("code");

    const editorRef = useRef(null);
    const { id } = useParams();

    // Fetch problem
    useEffect(() => {
        const fetchProblem = async () => {
            setLoading(true);
            try {
                const { data } = await axiosClient.get(`/problem/problemById/${id}`);
                setProblem(data);

                const initialCode =
                    data.startCode.find((sc) => {
                        if (sc.language === "C++" && selectedLanguage === "cpp") return true;
                        if (sc.language === "Java" && selectedLanguage === "java")
                            return true;
                        if (
                            sc.language === "Javascript" &&
                            selectedLanguage === "javascript"
                        )
                            return true;
                        return false;
                    })?.initialCode || "// Write your code here";

                setCode(initialCode);
            } catch (err) {
                console.error("Error fetching problem:", err);
            } finally {
                setLoading(false);
            }
        };
        fetchProblem();
    }, [id]);

    // Update code when language changes
    useEffect(() => {
        if (problem) {
            // normalize cpp to c++
            const lang = selectedLanguage === "cpp" ? "c++" : selectedLanguage;
            const initialCode =
                problem.startCode.find(
                    (sc) => sc.language.toLowerCase() === lang
                )?.initialCode || "";
            setCode(initialCode);
        }
    }, [selectedLanguage, problem]);

    const handleRun = async () => {
        setLoading(true);
        setRunResult(null);
        try {
            const lang =
                selectedLanguage === "cpp"
                    ? "c++"
                    : selectedLanguage === "java"
                        ? "java"
                        : "javascript";

            const { data } = await axiosClient.post(`/submited/run/${id}`, {
                code,
                language: lang,
            });

            setRunResult(data); // ✅ direct DB response
            setActiveRightTab("testcase");
        } catch (err) {
            setRunResult({
                status: "error",
                errorMessage: err.response?.data?.message || "Something went wrong",
            });
        } finally {
            setLoading(false);
        }
    };

    const handleSubmitCode = async () => {
        setLoading(true);
        setSubmitResult(null);
        try {
            const lang =
                selectedLanguage === "cpp"
                    ? "c++"
                    : selectedLanguage === "java"
                        ? "java"
                        : "javascript";

            const { data } = await axiosClient.post(`/submited/submit/${id}`, {
                code,
                language: lang,
            });

            setSubmitResult(data); // ✅ DB response handle
            setActiveRightTab("result");
        } catch (err) {
            setSubmitResult({
                status: "error",
                errorMessage: err.response?.data?.message || "Submission failed",
            });
        } finally {
            setLoading(false);
        }
    };

    const getLanguageForMonaco = (lang) => {
        if (lang === "cpp") return "cpp";
        return lang;
    };

    const getDifficultyColor = (difficulty) => {
        switch (difficulty) {
            case "Easy":
                return "bg-green-600/30 text-green-200";
            case "Medium":
                return "bg-yellow-600/30 text-yellow-100";
            case "Hard":
                return "bg-red-600/30 text-red-200";
            default:
                return "text-gray-500";
        }
    };

    if (loading && !problem) {
        return (
            <div className="flex justify-center items-center min-h-screen">
                <span className="loading loading-spinner loading-lg"></span>
            </div>
        );
    }

    return (
        <div className="h-screen flex bg-base-100">
            {/* Left Panel */}
            <div className="w-1/2 flex flex-col border-r border-base-300">
                {/* Left Tabs */}
                <div className="tabs tabs-bordered bg-base-200 px-4">
                    <button
                        className={`tab ${activeLeftTab === 'description' ? 'tab-active' : ''}`}
                        onClick={() => setActiveLeftTab('description')}
                    >
                        Description
                    </button>
                    <button
                        className={`tab ${activeLeftTab === 'editorial' ? 'tab-active' : ''}`}
                        onClick={() => setActiveLeftTab('editorial')}
                    >
                        Editorial
                    </button>
                    <button
                        className={`tab ${activeLeftTab === 'solutions' ? 'tab-active' : ''}`}
                        onClick={() => setActiveLeftTab('solutions')}
                    >
                        Solutions
                    </button>
                    <button
                        className={`tab ${activeLeftTab === 'submissions' ? 'tab-active' : ''}`}
                        onClick={() => setActiveLeftTab('submissions')}
                    >
                        Submissions
                    </button>
                    <button
                        className={`tab ${activeLeftTab === 'chatAI' ? 'tab-active' : ''}`}
                        onClick={() => setActiveLeftTab('chatAI')}
                    >
                        Ask AI
                    </button>
                </div>

                <div className="flex-1 overflow-y-auto p-6 ">
                    {problem && activeLeftTab === "description" && (
                        <div className="">
                            <div className="flex  flex-col items-start gap-4 mb-6">
                                <h1 className="text-2xl font-bold">{problem?.title}</h1>

                                <span
                                    className={` rounded-2xl px-2 py-1  ${getDifficultyColor(
                                        problem?.difficulty
                                    )}`}
                                >
                                    <div className="text-[11px] "> {problem?.difficulty}</div>
                                </span>

                            </div>
                            <div className="whitespace-pre-wrap text-sm">
                                {problem?.description}
                            </div>
                            <h3 className="mt-6 font-semibold">Examples:</h3>
                            {problem?.visibleTestCases?.map((ex, i) => (
                                <div key={i} className="bg-base-200 p-3 rounded mt-2">
                                    <p>
                                        <strong>Input:</strong> {ex.input}
                                    </p>
                                    <p>
                                        <strong>Output:</strong> {ex.output}
                                    </p>
                                    <p>
                                        <strong>Explanation:</strong> {ex.explanation}
                                    </p>
                                </div>
                            ))}
                        </div>
                    )}

                    {problem && activeLeftTab === "submissions" && (
                        <div>
                               <Subbmision pid={id}/>
                        </div>
                    
                    )}

                    {problem && activeLeftTab === "chatAI" && (
                        <div>
                               <ChatAi problem={problem} />
                        </div>
                    
                    )}

                    {/* Topics and tags here abbliable.............. */}
                    {
                        activeLeftTab === "description" &&
                        <div className="bg-[#1D232A] text-white  rounded-lg overflow-hidden border border-gray-800 shadow-lg mt-4">
                            <AccordionItem title="Topics" icon={<span>🏷️</span>}>
                                <div className="flex flex-wrap gap-2">
                                    {problem?.tags?.map((tag, idx) => (
                                        <span
                                            key={idx}
                                            className="px-3 py-1 text-sm bg-gray-700 rounded-full hover:bg-gray-600 cursor-pointer"
                                        >
                                            {tag}
                                        </span>
                                    ))}
                                </div>

                            </AccordionItem>

                            <AccordionItem title="Companies" locked={true} icon={<span>🏢</span>}>
                                <p>Premium feature. Unlock to see companies.</p>
                            </AccordionItem>

                            <AccordionItem title="Hint 1" icon={<Lightbulb size={16} />}>
                                Try simulating the entire process.
                            </AccordionItem>

                            <AccordionItem title="Hint 2" icon={<Lightbulb size={16} />}>
                                Focus on edge cases while simulating.
                            </AccordionItem>

                            <AccordionItem title="Similar Questions" icon={<span>❓</span>}>
                                <ul className="list-disc pl-4 space-y-1">
                                    <li>Question 1</li>
                                    <li>Question 2</li>
                                    <li>Question 3</li>
                                </ul>
                            </AccordionItem>
                        </div>
                    }

                </div>
            </div>

            {/* Right Panel */}
            <div className="w-1/2 flex flex-col">
                <div className="tabs tabs-bordered bg-base-200 px-4">
                    {["code", "testcase", "result"].map((tab) => (
                        <button
                            key={tab}
                            className={`tab ${activeRightTab === tab ? "tab-active" : ""}`}
                            onClick={() => setActiveRightTab(tab)}
                        >
                            {tab.charAt(0).toUpperCase() + tab.slice(1)}
                        </button>
                    ))}
                </div>

                <div className="flex-1 flex flex-col">
                    {activeRightTab === "code" && (
                        <div className="flex-1 flex flex-col">
                            <div className="flex gap-2 p-2 border-b border-base-300">
                                {["javascript", "java", "cpp"].map((lang) => (
                                    <button
                                        key={lang}
                                        className={`btn btn-sm ${selectedLanguage === lang ? "btn-primary" : "btn-ghost"
                                            }`}
                                        onClick={() => setSelectedLanguage(lang)}
                                    >
                                        {lang === "cpp" ? "C++" : lang}
                                    </button>
                                ))}
                            </div>

                            <Editor
                                height="100%"
                                language={getLanguageForMonaco(selectedLanguage)}
                                value={code}
                                onChange={(val) => setCode(val || "")}
                                onMount={(editor) => (editorRef.current = editor)}
                                theme="vs-dark"
                            />

                            <div className="p-2 border-t flex justify-end gap-2">
                                <button
                                    className="btn btn-outline btn-sm"
                                    onClick={handleRun}
                                    disabled={loading}
                                >
                                    {loading ? "Running..." : "Run"}
                                </button>
                                <button
                                    className="btn btn-primary btn-sm"
                                    onClick={handleSubmitCode}
                                    disabled={loading}
                                >
                                    {loading ? "Submitting..." : "Submit"}
                                </button>
                            </div>
                        </div>
                    )}

                    {activeRightTab === "testcase" && (
                        <div className="flex-1 p-4 overflow-y-auto">
                            <h3 className="font-semibold mb-4">Test Results</h3>
                            <TestResult runResult={runResult} />
                        </div>
                    )}

                    {activeRightTab === "result" && (
                        <div className="flex-1 p-4 overflow-y-auto">
                            <h3 className="font-semibold mb-4">Submission Result</h3>
                            <SubmissionResult submitResult={submitResult} />
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default SolveProblem;
