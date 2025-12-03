
import React, { useState, useEffect } from 'react';
import { PenTool, Trash2, Save, Eye, FileText } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import { translations, Language } from '../utils/translations';

interface NotebookProps {
    language: Language;
    content: string;
    onChange: (newContent: string) => void;
}

export const Notebook: React.FC<NotebookProps> = ({ language, content, onChange }) => {
    const t = translations[language];
    const [isPreview, setIsPreview] = useState(false);

    // Auto scroll to bottom when content changes (useful when AI adds notes)
    const textareaRef = React.useRef<HTMLTextAreaElement>(null);

    useEffect(() => {
        if (textareaRef.current) {
             textareaRef.current.scrollTop = textareaRef.current.scrollHeight;
        }
    }, [content]);

    const handleClear = () => {
        if (window.confirm('Are you sure you want to clear all notes?')) {
            onChange('');
        }
    };

    return (
        <div className="flex flex-col h-full bg-transparent">
            {/* Toolbar */}
            <div className="flex items-center justify-between p-3 px-4 border-b border-gray-100 dark:border-white/5 bg-gray-50/30 dark:bg-white/[0.02]">
                <div className="flex items-center gap-3">
                    <button 
                        onClick={() => setIsPreview(!isPreview)}
                        className={`flex items-center gap-2 text-xs font-medium px-2 py-1 rounded-md transition-colors ${
                            isPreview 
                            ? 'bg-primary-100 text-primary-700 dark:bg-primary-500/20 dark:text-primary-300' 
                            : 'text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-white/5'
                        }`}
                    >
                        {isPreview ? <FileText className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                        <span>{isPreview ? t.edit_mode : t.preview_mode}</span>
                    </button>
                    
                    {!isPreview && (
                        <div className="flex items-center gap-2 text-xs text-gray-400">
                             <span className="w-px h-3 bg-gray-300 dark:bg-white/10 mx-1"></span>
                            <PenTool className="w-3 h-3" />
                            <span>Markdown</span>
                        </div>
                    )}
                </div>

                <button 
                    onClick={handleClear}
                    className="p-1.5 hover:bg-red-50 dark:hover:bg-red-500/10 text-gray-400 hover:text-red-500 rounded-lg transition-colors"
                    title={t.clear_notes}
                >
                    <Trash2 className="w-3.5 h-3.5" />
                </button>
            </div>

            {/* Content Area */}
            <div className="flex-1 p-4 relative group overflow-hidden">
                {isPreview ? (
                     <div className="h-full overflow-y-auto prose prose-sm max-w-none 
                        prose-headings:text-gray-900 dark:prose-headings:text-white 
                        prose-p:text-gray-600 dark:prose-p:text-gray-300 
                        prose-a:text-primary-600 dark:prose-a:text-primary-400 
                        prose-strong:text-gray-900 dark:prose-strong:text-primary-200
                        prose-li:text-gray-600 dark:prose-li:text-gray-300
                        prose-code:text-accent-600 dark:prose-code:text-accent-300
                        prose-code:bg-gray-100 dark:prose-code:bg-white/5
                        prose-code:px-1 prose-code:rounded">
                        {content ? (
                            <ReactMarkdown>{content}</ReactMarkdown>
                        ) : (
                             <p className="text-gray-400 italic text-sm">{t.no_activity}</p>
                        )}
                     </div>
                ) : (
                    <>
                        <textarea
                            ref={textareaRef}
                            value={content}
                            onChange={(e) => onChange(e.target.value)}
                            placeholder={t.notes_placeholder}
                            className="w-full h-full bg-transparent resize-none focus:outline-none text-sm leading-relaxed 
                            text-gray-700 dark:text-gray-300 placeholder-gray-400 dark:placeholder-gray-600
                            font-mono"
                            spellCheck={false}
                        />
                        {/* Visual guideline for typing */}
                        <div className="absolute top-4 bottom-4 left-0 w-1 bg-gradient-to-b from-transparent via-primary-500/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
                    </>
                )}
            </div>
            
            {/* Status Bar */}
            <div className="p-2 px-4 text-[10px] text-gray-400 dark:text-gray-600 border-t border-gray-100 dark:border-white/5 flex justify-between items-center">
                <span>{content.length} chars</span>
                <div className="flex items-center gap-1.5">
                    <Save className="w-3 h-3" />
                    <span>Auto-saved</span>
                </div>
            </div>
        </div>
    );
};