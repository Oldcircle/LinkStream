
import React, { useState, useRef, useEffect } from 'react';
import { Bot, Send, User, Wand2, Loader2, BrainCircuit } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import { translations, Language } from '../utils/translations';
import { ChatMessage } from '../services/geminiService';

interface AiPanelProps {
    language: Language;
    chatHistory: ChatMessage[];
    onSendMessage: (text: string) => Promise<void>;
    onGenerateNotes: () => void;
    isGeneratingNotes: boolean;
}

export const AiPanel: React.FC<AiPanelProps> = ({ 
    language, 
    chatHistory, 
    onSendMessage,
    onGenerateNotes,
    isGeneratingNotes
}) => {
    const t = translations[language];
    const [inputValue, setInputValue] = useState('');
    const [isSending, setIsSending] = useState(false);
    const scrollRef = useRef<HTMLDivElement>(null);

    // Auto scroll to bottom
    useEffect(() => {
        if (scrollRef.current) {
            scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
        }
    }, [chatHistory, isSending]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!inputValue.trim() || isSending) return;

        const text = inputValue;
        setInputValue('');
        setIsSending(true);
        await onSendMessage(text);
        setIsSending(false);
    };

    return (
        <div className="flex flex-col h-full bg-transparent">
            {/* Header */}
            <div className="p-5 border-b border-gray-100 dark:border-white/5 bg-gray-50/50 dark:bg-white/[0.02]">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-primary-100 dark:bg-gradient-to-br dark:from-primary-500/20 dark:to-accent-500/20 flex items-center justify-center border border-primary-200/50 dark:border-white/5 text-primary-600 dark:text-primary-300">
                            <BrainCircuit className="w-5 h-5" />
                        </div>
                        <div>
                            <h2 className="font-semibold text-gray-900 dark:text-white tracking-tight">{t.ai_vision}</h2>
                            <div className="flex items-center gap-1.5">
                                <span className="w-1.5 h-1.5 rounded-full bg-green-500"></span>
                                <span className="text-xs text-gray-500 dark:text-gray-400 font-medium">{t.model_version}</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Chat Area */}
            <div ref={scrollRef} className="flex-1 overflow-y-auto p-4 space-y-6 scrollbar-thin relative">
                
                {/* Welcome Message */}
                {chatHistory.length === 0 && (
                     <div className="flex flex-col items-center justify-center h-full text-center opacity-70">
                        <div className="w-16 h-16 rounded-full bg-gray-100 dark:bg-white/5 flex items-center justify-center mb-4 dark:animate-pulse-glow">
                            <Bot className="w-8 h-8 text-gray-400 dark:text-gray-500" />
                        </div>
                        <p className="text-sm text-gray-500 max-w-[240px] leading-relaxed">
                            {t.chat_welcome}
                        </p>
                    </div>
                )}

                {chatHistory.map((msg, index) => (
                    <div key={index} className={`flex gap-3 ${msg.role === 'user' ? 'flex-row-reverse' : 'flex-row'}`}>
                        {/* Avatar */}
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 
                            ${msg.role === 'user' 
                                ? 'bg-gray-200 dark:bg-white/10 text-gray-600 dark:text-gray-300' 
                                : 'bg-primary-100 dark:bg-primary-900/30 text-primary-600 dark:text-primary-400'
                            }`}>
                            {msg.role === 'user' ? <User className="w-4 h-4" /> : <Bot className="w-4 h-4" />}
                        </div>

                        {/* Bubble */}
                        <div className={`max-w-[85%] rounded-2xl px-4 py-3 text-sm leading-relaxed shadow-sm
                            ${msg.role === 'user'
                                ? 'bg-white dark:bg-white/10 text-gray-800 dark:text-gray-100 rounded-tr-none'
                                : 'bg-white/50 dark:bg-black/20 text-gray-700 dark:text-gray-200 rounded-tl-none border border-gray-100 dark:border-white/5'
                            }`}>
                            <ReactMarkdown className="prose prose-sm dark:prose-invert max-w-none">
                                {msg.text}
                            </ReactMarkdown>
                        </div>
                    </div>
                ))}

                {isSending && (
                    <div className="flex gap-3">
                        <div className="w-8 h-8 rounded-full bg-primary-100 dark:bg-primary-900/30 text-primary-600 dark:text-primary-400 flex items-center justify-center shrink-0">
                             <Bot className="w-4 h-4" />
                        </div>
                        <div className="bg-white/50 dark:bg-black/20 rounded-2xl rounded-tl-none px-4 py-3 border border-gray-100 dark:border-white/5 flex items-center gap-2">
                            <span className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce"></span>
                            <span className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '100ms' }}></span>
                            <span className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '200ms' }}></span>
                        </div>
                    </div>
                )}
            </div>

            {/* Smart Actions */}
            {chatHistory.length > 0 && (
                <div className="px-4 pb-2">
                    <button 
                        onClick={onGenerateNotes}
                        disabled={isGeneratingNotes}
                        className="w-full flex items-center justify-center gap-2 py-2 rounded-lg bg-gradient-to-r from-primary-500/10 to-accent-500/10 hover:from-primary-500/20 hover:to-accent-500/20 border border-primary-200/20 dark:border-white/5 transition-all group"
                    >
                        {isGeneratingNotes ? (
                             <Loader2 className="w-3.5 h-3.5 animate-spin text-primary-500" />
                        ) : (
                             <Wand2 className="w-3.5 h-3.5 text-primary-500 group-hover:scale-110 transition-transform" />
                        )}
                        <span className="text-xs font-medium text-primary-600 dark:text-primary-400">
                            {isGeneratingNotes ? t.generating_notes : t.generate_notes}
                        </span>
                    </button>
                </div>
            )}

            {/* Input Area */}
            <div className="p-4 pt-2 border-t border-gray-100 dark:border-white/5 bg-gray-50/50 dark:bg-white/[0.02]">
                <form onSubmit={handleSubmit} className="relative">
                    <input 
                        type="text" 
                        value={inputValue}
                        onChange={(e) => setInputValue(e.target.value)}
                        placeholder={t.type_message}
                        className="w-full pl-4 pr-12 py-3 rounded-xl bg-white dark:bg-black/20 border border-gray-200 dark:border-white/10 focus:outline-none focus:ring-2 focus:ring-primary-500/50 text-sm text-gray-800 dark:text-gray-200 shadow-sm"
                    />
                    <button 
                        type="submit"
                        disabled={!inputValue.trim() || isSending}
                        className="absolute right-2 top-2 p-1.5 rounded-lg bg-primary-600 dark:bg-white text-white dark:text-black hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                    >
                        <Send className="w-4 h-4" />
                    </button>
                </form>
            </div>
        </div>
    );
};