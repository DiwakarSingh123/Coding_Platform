import { useState, useEffect, useRef } from "react";
import Editor from "@monaco-editor/react";
import { useParams, useNavigate } from "react-router";
import axiosClient from "../utils/axiosClient";
import { ChevronDown, ChevronUp, Lightbulb, Lock, ArrowLeft, CheckCircle, XCircle, Clock, Cpu } from "lucide-react";
import Subbmision from "../Components/Subbmision";
import ChatAi from "../Components/ChatWithAI";
import React from "react";

// Error boundary to prevent full blank page on crash
class ErrorBoundary extends React.Component {
    constructor(props) { super(props); this.state = { hasError: false, error: null }; }
    static getDerivedStateFromError(error) { return { hasError: true, error }; }
    render() {
        if (this.state.hasError) return (
            <div className="flex flex-col items-center justify-center h-full p-6 text-center">
                <XCircle size={32} className="text-red-400 mb-3" />
                <p className="text-red-400 font-medium">Something went wrong</p>
                <p className="text-gray-500 text-xs mt-1">{this.state.error?.message}</p>
                <button onClick={() => this.setState({ hasError: false, error: null })} className="mt-3 px-3 py-1.5 bg-[#3d3d3d] text-white text-xs rounded-md hover:bg-[#4d4d4d]">Retry</button>
            </div>
        );
        return this.props.children;
    }
}

const LANGUAGES = ["javascript", "java", "cpp"];
const LANG_DISPLAY = { javascript: "JavaScript", java: "Java", cpp: "C++" };
const LANG_MAP = { cpp: "c++", java: "java", javascript: "javascript" };
const MONACO_LANG = { cpp: "cpp", java: "java", javascript: "javascript" };

const getDifficultyStyle = (d) => {
    if (d === "Easy") return "text-green-400 bg-green-400/10 border border-green-400/30";
    if (d === "Medium") return "text-yellow-400 bg-yellow-400/10 border border-yellow-400/30";
    return "text-red-400 bg-red-400/10 border border-red-400/30";
};

const AccordionItem = ({ title, children, icon, defaultOpen = false }) => {
    const [open, setOpen] = useState(defaultOpen);
    return (
        <div className="border-b border-[#3d3d3d]">
            <button
                onClick={() => setOpen(!open)}
                className="flex items-center justify-between w-full px-4 py-3 text-gray-300 hover:bg-[#2a2a2a] transition-colors"
            >
                <div className="flex items-center gap-2 text-sm font-medium">{icon}{title}</div>
                {open ? <ChevronUp size={15} className="text-gray-500" /> : <ChevronDown size={15} className="text-gray-500" />}
            </button>
            {open && <div className="px-4 pb-4 text-sm text-gray-400">{children}</div>}
        </div>
    );
};

const TestResultPanel = ({ result, type }) => {
    if (!result) return (
        <div className="flex flex-col items-center justify-center h-full text-gray-500 gap-2">
            <div className="text-4xl">{type === "run" ? "▶" : "📤"}</div>
            <p className="text-sm">{type === "run" ? "Run your code to see results" : "Submit your code to see results"}</p>
        </div>
    );

    const passed = result.testCasesPassed || 0;
    const total = result.testCasesTotal || 0;
    const accepted = result.status === "accepted";

    return (
        <div className="p-4 space-y-4">
            <div className={`flex items-center gap-2 text-lg font-bold ${accepted ? "text-green-400" : "text-red-400"}`}>
                {accepted ? <CheckCircle size={22} /> : <XCircle size={22} />}
                {accepted ? (type === "run" ? "All Visible Tests Passed" : "Accepted") : (result.status === "error" ? "Runtime Error" : "Wrong Answer")}
            </div>

            <div className="flex gap-4 text-sm">
                <div className="bg-[#2a2a2a] rounded-lg px-4 py-2 flex items-center gap-2">
                    <CheckCircle size={14} className="text-green-400" />
                    <span className="text-gray-400">Test Cases</span>
                    <span className={`font-bold ${accepted ? "text-green-400" : "text-red-400"}`}>{passed}/{total}</span>
                </div>
                {accepted && (
                    <>
                        <div className="bg-[#2a2a2a] rounded-lg px-4 py-2 flex items-center gap-2">
                            <Clock size={14} className="text-blue-400" />
                            <span className="text-gray-400">Runtime</span>
                            <span className="font-bold text-white">{result.runtime}s</span>
                        </div>
                        <div className="bg-[#2a2a2a] rounded-lg px-4 py-2 flex items-center gap-2">
                            <Cpu size={14} className="text-purple-400" />
                            <span className="text-gray-400">Memory</span>
                            <span className="font-bold text-white">{result.memory} KB</span>
                        </div>
                    </>
                )}
            </div>

            {result.errorMessage && typeof result.errorMessage === "string" && (
                <div className="bg-red-900/20 border border-red-500/30 rounded-lg p-3">
                    <p className="text-red-400 text-xs font-mono whitespace-pre-wrap">{result.errorMessage}</p>
                </div>
            )}

            <div className="space-y-2">
                {Array.from({ length: total }).map((_, i) => (
                    <div key={i} className={`flex items-center justify-between px-3 py-2 rounded-lg text-sm ${i < passed ? "bg-green-900/20 border border-green-500/20" : "bg-red-900/20 border border-red-500/20"}`}>
                        <span className="text-gray-300">Case {i + 1}</span>
                        {i < passed ? <span className="text-green-400 flex items-center gap-1"><CheckCircle size={13} /> Passed</span> : <span className="text-red-400 flex items-center gap-1"><XCircle size={13} /> Failed</span>}
                    </div>
                ))}
            </div>
        </div>
    );
};

const SolveProblem = () => {
    const [problem, setProblem] = useState(null);
    const [selectedLanguage, setSelectedLanguage] = useState("javascript");
    const [code, setCode] = useState("");
    const [loading, setLoading] = useState(false);
    const [actionLoading, setActionLoading] = useState(false);
    const [runResult, setRunResult] = useState(null);
    const [submitResult, setSubmitResult] = useState(null);
    const [activeLeftTab, setActiveLeftTab] = useState("description");
    const [activeRightTab, setActiveRightTab] = useState("code");
    const [bottomTab, setBottomTab] = useState("testcase");
    const [showBottom, setShowBottom] = useState(false);

    const editorRef = useRef(null);
    const { id } = useParams();
    const navigate = useNavigate();

    useEffect(() => {
        const fetchProblem = async () => {
            setLoading(true);
            try {
                const { data } = await axiosClient.get(`/problem/problemById/${id}`);
                setProblem(data);
                setInitialCode(data, "javascript");
            } catch (err) {
                console.error("Error fetching problem:", err);
            } finally {
                setLoading(false);
            }
        };
        fetchProblem();
    }, [id]);

    const setInitialCode = (problemData, lang) => {
        const langKey = lang === "cpp" ? "c++" : lang;
        const starter = problemData.startCode.find(
            (sc) => sc.language.toLowerCase() === langKey.toLowerCase() ||
                (lang === "cpp" && sc.language === "C++") ||
                (lang === "java" && sc.language === "Java") ||
                (lang === "javascript" && (sc.language === "JavaScript" || sc.language === "Javascript"))
        );
        setCode(starter?.initialCode || "// Write your solution here");
    };

    const handleLanguageChange = (lang) => {
        setSelectedLanguage(lang);
        if (problem) setInitialCode(problem, lang);
    };

    const extractErrorMessage = (err) => {
        const d = err.response?.data;
        if (!d) return err.message || "Something went wrong";
        if (typeof d === "string") return d;
        if (typeof d === "object") return d.message || JSON.stringify(d);
        return "Something went wrong";
    };

    const handleRun = async () => {
        setActionLoading(true);
        setRunResult(null);
        setShowBottom(true);
        setBottomTab("testcase");
        try {
            const { data } = await axiosClient.post(`/submited/run/${id}`, {
                code,
                language: LANG_MAP[selectedLanguage],
            });
            setRunResult(data);
        } catch (err) {
            setRunResult({ status: "error", errorMessage: extractErrorMessage(err), testCasesPassed: 0, testCasesTotal: 0 });
        } finally {
            setActionLoading(false);
        }
    };

    const handleSubmit = async () => {
        setActionLoading(true);
        setSubmitResult(null);
        setShowBottom(true);
        setBottomTab("result");
        try {
            const { data } = await axiosClient.post(`/submited/submit/${id}`, {
                code,
                language: LANG_MAP[selectedLanguage],
            });
            setSubmitResult(data);
        } catch (err) {
            setSubmitResult({ status: "error", errorMessage: extractErrorMessage(err), testCasesPassed: 0, testCasesTotal: 0 });
        } finally {
            setActionLoading(false);
        }
    };

    if (loading) return (
        <div className="flex items-center justify-center h-screen bg-[#1a1a1a]">
            <div className="flex flex-col items-center gap-3">
                <div className="w-8 h-8 border-2 border-orange-500 border-t-transparent rounded-full animate-spin" />
                <span className="text-gray-400 text-sm">Loading problem...</span>
            </div>
        </div>
    );

    const leftTabs = ["description", "editorial", "solutions", "submissions", "askAI"];
    const leftTabLabels = { description: "Description", editorial: "Editorial", solutions: "Solutions", submissions: "Submissions", askAI: "Ask AI 🤖" };

    return (
        <div className="h-screen flex flex-col bg-[#1a1a1a] text-white overflow-hidden">
            {/* Top Navbar */}
            <div className="flex items-center justify-between px-4 py-2 bg-[#282828] border-b border-[#3d3d3d] shrink-0 h-14">
                <div className="flex items-center gap-2 min-w-0">
                    <button onClick={() => navigate("/problems")} className="flex items-center gap-1 text-gray-400 hover:text-white text-xs sm:text-sm transition-colors shrink-0">
                        <ArrowLeft size={16} /> <span className="hidden sm:inline">Problems</span>
                    </button>
                    <span className="text-[#3d3d3d] shrink-0">|</span>
                    <span className="text-sm font-medium text-gray-200 truncate block">{problem?.title}</span>
                    {problem && <span className={`hidden sm:inline-block text-[10px] px-2 py-0.5 rounded-full font-medium shrink-0 ${getDifficultyStyle(problem.difficulty)}`}>{problem.difficulty}</span>}
                </div>
                <div className="flex items-center gap-2 shrink-0 ml-2">
                    <button
                        onClick={handleRun}
                        disabled={actionLoading}
                        className="flex items-center gap-1.5 px-4 py-1.5 bg-[#3d3d3d] hover:bg-[#4d4d4d] text-white text-sm rounded-md transition-colors disabled:opacity-50"
                    >
                        {actionLoading && bottomTab === "testcase" ? <div className="w-3 h-3 border border-white border-t-transparent rounded-full animate-spin" /> : "▶"}
                        Run
                    </button>
                    <button
                        onClick={handleSubmit}
                        disabled={actionLoading}
                        className="flex items-center gap-1.5 px-4 py-1.5 bg-green-600 hover:bg-green-500 text-white text-sm rounded-md font-medium transition-colors disabled:opacity-50"
                    >
                        {actionLoading && bottomTab === "result" ? <div className="w-3 h-3 border border-white border-t-transparent rounded-full animate-spin" /> : "↑"}
                        Submit
                    </button>
                </div>
            </div>

            {/* Main Content */}
            <div className="flex flex-1 flex-col lg:flex-row overflow-hidden">
                {/* Left Panel */}
                <div className="w-full lg:w-[45%] flex flex-col border-b lg:border-b-0 lg:border-r border-[#3d3d3d] overflow-hidden min-h-[300px] lg:min-h-0">
                    {/* Left Tabs */}
                    <div className="flex bg-[#282828] border-b border-[#3d3d3d] shrink-0 overflow-x-auto">
                        {leftTabs.map(tab => (
                            <button
                                key={tab}
                                onClick={() => setActiveLeftTab(tab)}
                                className={`px-4 py-2.5 text-xs font-medium whitespace-nowrap transition-colors border-b-2 ${activeLeftTab === tab ? "text-white border-orange-500" : "text-gray-400 border-transparent hover:text-gray-200"}`}
                            >
                                {leftTabLabels[tab]}
                            </button>
                        ))}
                    </div>

                    <div className="flex-1 overflow-y-auto">
                        {/* Description Tab */}
                        {activeLeftTab === "description" && problem && (
                            <div className="p-5 space-y-5">
                                <div>
                                    <h1 className="text-xl font-bold text-white mb-3">{problem.title}</h1>
                                    <div className="flex flex-wrap gap-2 mb-4">
                                        <span className={`text-xs px-2.5 py-1 rounded-full font-medium ${getDifficultyStyle(problem.difficulty)}`}>{problem.difficulty}</span>
                                        {problem.tags?.map((tag, i) => (
                                            <span key={i} className="text-xs px-2.5 py-1 rounded-full bg-[#3d3d3d] text-gray-300">{tag}</span>
                                        ))}
                                    </div>
                                    <div className="text-sm text-gray-300 leading-relaxed whitespace-pre-wrap">{problem.description}</div>
                                </div>

                                {problem.visibleTestCases?.length > 0 && (
                                    <div className="space-y-3">
                                        {problem.visibleTestCases.map((ex, i) => (
                                            <div key={i}>
                                                <p className="text-sm font-semibold text-gray-200 mb-2">Example {i + 1}:</p>
                                                <div className="bg-[#282828] rounded-lg p-3 space-y-1.5 border border-[#3d3d3d]">
                                                    <div className="font-mono text-xs">
                                                        <span className="text-gray-400">Input: </span>
                                                        <span className="text-gray-200">{ex.input}</span>
                                                    </div>
                                                    <div className="font-mono text-xs">
                                                        <span className="text-gray-400">Output: </span>
                                                        <span className="text-gray-200">{ex.output}</span>
                                                    </div>
                                                    {ex.explanation && (
                                                        <div className="text-xs text-gray-400 pt-1 border-t border-[#3d3d3d]">
                                                            <span className="text-gray-500">Explanation: </span>{ex.explanation}
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                )}

                                <div className="rounded-lg overflow-hidden border border-[#3d3d3d]">
                                    <AccordionItem title="Topics" icon={<span>🏷️</span>} defaultOpen>
                                        <div className="flex flex-wrap gap-2 pt-1">
                                            {problem.tags?.map((tag, i) => (
                                                <span key={i} className="px-3 py-1 text-xs bg-[#3d3d3d] rounded-full text-gray-300 hover:bg-[#4d4d4d] cursor-pointer">{tag}</span>
                                            ))}
                                        </div>
                                    </AccordionItem>
                                    <AccordionItem title="Hint 1" icon={<Lightbulb size={14} className="text-yellow-400" />}>
                                        Think about the brute force approach first, then optimize.
                                    </AccordionItem>
                                    <AccordionItem title="Hint 2" icon={<Lightbulb size={14} className="text-yellow-400" />}>
                                        Consider edge cases: empty input, single element, duplicates.
                                    </AccordionItem>
                                    <AccordionItem title="Companies" icon={<span>🏢</span>}>
                                        <div className="flex items-center gap-2 text-yellow-500">
                                            <Lock size={13} /> Premium feature
                                        </div>
                                    </AccordionItem>
                                </div>
                            </div>
                        )}

                        {/* Editorial Tab */}
                        {activeLeftTab === "editorial" && problem && (
                            <div className="p-5 space-y-4">
                                <h2 className="text-lg font-bold text-white">Editorial</h2>
                                {problem.refranceSolution?.length > 0 ? (
                                    <div className="space-y-6">
                                        <div className="bg-[#282828] rounded-lg p-4 border border-[#3d3d3d]">
                                            <h3 className="text-sm font-semibold text-orange-400 mb-2">Approach</h3>
                                            <p className="text-sm text-gray-300 leading-relaxed">
                                                This problem can be solved by carefully analyzing the constraints and applying the appropriate algorithm.
                                                Study the reference solutions below for each language.
                                            </p>
                                        </div>
                                        {problem.refranceSolution.map((sol, i) => (
                                            <div key={i} className="space-y-2">
                                                <div className="flex items-center gap-2">
                                                    <span className="text-xs font-semibold text-orange-400 bg-orange-400/10 px-2 py-0.5 rounded">{sol.language}</span>
                                                    <span className="text-xs text-gray-500">Reference Solution</span>
                                                </div>
                                                <div className="rounded-lg overflow-hidden border border-[#3d3d3d]">
                                                    <Editor
                                                        height="250px"
                                                        language={sol.language === "C++" ? "cpp" : sol.language === "Java" ? "java" : "javascript"}
                                                        value={sol.completeCode}
                                                        theme="vs-dark"
                                                        options={{ readOnly: true, minimap: { enabled: false }, fontSize: 13, scrollBeyondLastLine: false, lineNumbers: "on" }}
                                                    />
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                ) : (
                                    <div className="flex flex-col items-center justify-center py-16 text-gray-500">
                                        <span className="text-4xl mb-3">📝</span>
                                        <p className="text-sm">No editorial available yet.</p>
                                    </div>
                                )}
                            </div>
                        )}

                        {/* Solutions Tab */}
                        {activeLeftTab === "solutions" && (
                            <div className="flex flex-col items-center justify-center h-full py-16 text-gray-500">
                                <span className="text-4xl mb-3">💡</span>
                                <p className="text-sm font-medium text-gray-400">Community Solutions</p>
                                <p className="text-xs mt-1">Coming soon</p>
                            </div>
                        )}

                        {/* Submissions Tab */}
                        {activeLeftTab === "submissions" && (
                            <Subbmision pid={id} />
                        )}

                        {/* Ask AI Tab */}
                        {activeLeftTab === "askAI" && problem && (
                            <ChatAi problem={problem} />
                        )}
                    </div>
                </div>

                {/* Right Panel */}
                <div className="flex-1 flex flex-col overflow-hidden min-h-[400px] lg:min-h-0">
                    {/* Language Selector */}
                    <div className="flex items-center gap-1 px-3 py-2 bg-[#282828] border-b border-[#3d3d3d] shrink-0 overflow-x-auto">
                        {LANGUAGES.map(lang => (
                            <button
                                key={lang}
                                onClick={() => handleLanguageChange(lang)}
                                className={`px-3 py-1 text-xs rounded-md font-medium transition-colors whitespace-nowrap ${selectedLanguage === lang ? "bg-[#3d3d3d] text-white" : "text-gray-400 hover:text-gray-200"}`}
                            >
                                {LANG_DISPLAY[lang]}
                            </button>
                        ))}
                    </div>

                    {/* Editor */}
                    <div className={`${showBottom ? "flex-[0_0_55%]" : "flex-1"} overflow-hidden transition-all min-h-[300px]`}>
                        <Editor
                            height="100%"
                            language={MONACO_LANG[selectedLanguage]}
                            value={code}
                            onChange={(val) => setCode(val || "")}
                            onMount={(editor) => (editorRef.current = editor)}
                            theme="vs-dark"
                            options={{
                                fontSize: 14,
                                minimap: { enabled: false },
                                scrollBeyondLastLine: false,
                                lineNumbers: "on",
                                tabSize: 4,
                                wordWrap: "on",
                                automaticLayout: true,
                                padding: { top: 12 },
                            }}
                        />
                    </div>

                    {/* Bottom Panel (Test Results) */}
                    {showBottom && (
                        <div className="flex-1 flex flex-col border-t border-[#3d3d3d] overflow-hidden min-h-0">
                            <div className="flex items-center justify-between px-3 py-1.5 bg-[#282828] border-b border-[#3d3d3d] shrink-0">
                                <div className="flex gap-1">
                                    {["testcase", "result"].map(tab => (
                                        <button
                                            key={tab}
                                            onClick={() => setBottomTab(tab)}
                                            className={`px-3 py-1 text-xs rounded-md font-medium transition-colors ${bottomTab === tab ? "bg-[#3d3d3d] text-white" : "text-gray-400 hover:text-gray-200"}`}
                                        >
                                            {tab === "testcase" ? "Test Result" : "Submission Result"}
                                        </button>
                                    ))}
                                </div>
                                <button onClick={() => setShowBottom(false)} className="text-gray-500 hover:text-gray-300 text-xs px-2">✕</button>
                            </div>
                            <div className="flex-1 overflow-y-auto">
                                <ErrorBoundary>
                                    {bottomTab === "testcase" && <TestResultPanel result={runResult} type="run" />}
                                    {bottomTab === "result" && <TestResultPanel result={submitResult} type="submit" />}
                                </ErrorBoundary>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default SolveProblem;
