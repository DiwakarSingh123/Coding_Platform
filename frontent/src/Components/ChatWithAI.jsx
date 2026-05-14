import { useState, useRef, useEffect } from "react";
import { useForm } from "react-hook-form";
import axiosClient from "../utils/axiosClient";
import { Send, Bot, User } from "lucide-react";

function ChatWithAI({ problem }) {
    const [messages, setMessages] = useState([
        {
            role: "model",
            parts: [{ text: `Hi! I'm your AI tutor for **${problem?.title}**. I can help you with hints, code review, or explain the optimal approach. What would you like help with?` }]
        }
    ]);
    const [isTyping, setIsTyping] = useState(false);

    const { register, handleSubmit, reset, formState: { errors } } = useForm();
    const messagesEndRef = useRef(null);

    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [messages, isTyping]);

    const onSubmit = async (data) => {
        const newUserMessage = { role: "user", parts: [{ text: data.message }] };
        const updatedMessages = [...messages, newUserMessage];
        setMessages(updatedMessages);
        reset();
        setIsTyping(true);

        try {
            const response = await axiosClient.post("/ai/chat", {
                messages: updatedMessages,
                title: problem.title,
                description: problem.description,
                visibleTestCases: problem.visibleTestCases,
                startCode: problem.startCode,
            });

            setMessages(prev => [...prev, {
                role: "model",
                parts: [{ text: response.data.message }]
            }]);
        } catch (error) {
            setMessages(prev => [...prev, {
                role: "model",
                parts: [{ text: "Sorry, I encountered an error. Please try again." }]
            }]);
        } finally {
            setIsTyping(false);
        }
    };

    const renderText = (text) => {
        // Basic markdown: bold, code blocks, inline code
        return text
            .split(/(```[\s\S]*?```|`[^`]+`|\*\*[^*]+\*\*)/g)
            .map((part, i) => {
                if (part.startsWith("```") && part.endsWith("```")) {
                    const code = part.slice(3, -3).replace(/^\w+\n/, "");
                    return <pre key={i} className="bg-[#1a1a1a] rounded-md p-3 my-2 text-xs font-mono overflow-x-auto text-green-300 border border-[#3d3d3d]">{code}</pre>;
                }
                if (part.startsWith("`") && part.endsWith("`")) {
                    return <code key={i} className="bg-[#1a1a1a] px-1.5 py-0.5 rounded text-xs font-mono text-orange-300">{part.slice(1, -1)}</code>;
                }
                if (part.startsWith("**") && part.endsWith("**")) {
                    return <strong key={i} className="text-white font-semibold">{part.slice(2, -2)}</strong>;
                }
                return <span key={i}>{part}</span>;
            });
    };

    return (
        <div className="flex flex-col h-full">
            {/* Header */}
            <div className="px-4 py-3 border-b border-[#3d3d3d] bg-[#282828]">
                <div className="flex items-center gap-2">
                    <div className="w-7 h-7 rounded-full bg-orange-500/20 flex items-center justify-center">
                        <Bot size={14} className="text-orange-400" />
                    </div>
                    <div>
                        <p className="text-sm font-medium text-white">AI Tutor</p>
                        <p className="text-xs text-gray-500">DSA Assistant • {problem?.title}</p>
                    </div>
                    <div className="ml-auto flex items-center gap-1.5">
                        <div className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse" />
                        <span className="text-xs text-gray-500">Online</span>
                    </div>
                </div>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
                {messages.map((msg, index) => (
                    <div key={index} className={`flex gap-2.5 ${msg.role === "user" ? "flex-row-reverse" : ""}`}>
                        <div className={`w-7 h-7 rounded-full flex items-center justify-center shrink-0 mt-0.5 ${msg.role === "user" ? "bg-blue-500/20" : "bg-orange-500/20"}`}>
                            {msg.role === "user"
                                ? <User size={13} className="text-blue-400" />
                                : <Bot size={13} className="text-orange-400" />
                            }
                        </div>
                        <div className={`max-w-[80%] rounded-xl px-3.5 py-2.5 text-sm leading-relaxed ${msg.role === "user"
                            ? "bg-blue-600/20 border border-blue-500/20 text-gray-200"
                            : "bg-[#282828] border border-[#3d3d3d] text-gray-300"
                        }`}>
                            {renderText(msg.parts[0].text)}
                        </div>
                    </div>
                ))}

                {isTyping && (
                    <div className="flex gap-2.5">
                        <div className="w-7 h-7 rounded-full bg-orange-500/20 flex items-center justify-center shrink-0">
                            <Bot size={13} className="text-orange-400" />
                        </div>
                        <div className="bg-[#282828] border border-[#3d3d3d] rounded-xl px-4 py-3">
                            <div className="flex gap-1 items-center">
                                <div className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: "0ms" }} />
                                <div className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: "150ms" }} />
                                <div className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: "300ms" }} />
                            </div>
                        </div>
                    </div>
                )}
                <div ref={messagesEndRef} />
            </div>

            {/* Input */}
            <form onSubmit={handleSubmit(onSubmit)} className="p-3 border-t border-[#3d3d3d] bg-[#282828]">
                <div className="flex items-center gap-2 bg-[#1a1a1a] rounded-xl border border-[#3d3d3d] px-3 py-2 focus-within:border-orange-500/50 transition-colors">
                    <input
                        placeholder="Ask for hints, code review, or explanation..."
                        className="flex-1 bg-transparent text-sm text-gray-200 placeholder-gray-600 outline-none"
                        {...register("message", { required: true, minLength: 2 })}
                    />
                    <button
                        type="submit"
                        disabled={!!errors.message || isTyping}
                        className="w-7 h-7 rounded-lg bg-orange-500 hover:bg-orange-400 disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center transition-colors shrink-0"
                    >
                        <Send size={13} className="text-white" />
                    </button>
                </div>
                <p className="text-xs text-gray-600 mt-1.5 text-center">AI is scoped to this problem only</p>
            </form>
        </div>
    );
}

export default ChatWithAI;
